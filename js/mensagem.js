/*
 * ============================================================
 *  LÓGICA DO PEDIDO — formatação, validação e mensagem do WhatsApp
 * ============================================================
 * Este arquivo não mexe na página: só recebe dados e devolve textos.
 * Quem usa estas funções é o js/pedido.js. Os testes ficam em tests/.
 *
 * O que dá para mudar aqui com segurança:
 *   - CATEGORIAS_CONHECIDAS: a ordem em que os grupos aparecem no pedido.
 *   - Os textos de erro em validarPedido.
 *   - O texto da mensagem em montarMensagem (veja o exemplo lá embaixo).
 */

// Ordem dos grupos na página de pedido. Categorias novas aparecem depois destas.
const CATEGORIAS_CONHECIDAS = ["Bolos", "Brigadeiros", "Cupcakes", "Brownies"];

// Aceita 90, "90", "R$ 8,50". Devolve null se não der para ler um número.
function lerPreco(valor) {
  if (typeof valor === "number") return Number.isFinite(valor) ? valor : null;
  const limpo = String(valor ?? "").replace(/[^\d,.]/g, "").replace(",", ".");
  const numero = parseFloat(limpo);
  return Number.isFinite(numero) ? numero : null;
}

// 90 → "R$ 90,00" (ou "a partir de R$ 90,00" quando aPartirDe é true).
function formatarPreco(valor, aPartirDe) {
  const numero = lerPreco(valor);
  if (numero === null) return "";
  const reais = "R$ " + numero.toFixed(2).replace(".", ",");
  return aPartirDe ? "a partir de " + reais : reais;
}

// "2026-12-10" (formato do campo de data) → "10/12/2026".
function formatarData(iso) {
  if (!iso) return "";
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

// Só os itens com quantidade maior que zero de um tipo (encomenda ou pronta).
function itensEscolhidos(itens, tipo) {
  return itens.filter((item) => item.quantidade > 0 && item.tipo === tipo);
}

/*
 * Deixa a lista de produtos resistente a erros comuns de edição em produtos.js:
 * preço como texto, maiúsculas/espaços em tipo e categoria, id repetido.
 * Cada produto ganha uma "chave" única usada pela página de pedido.
 */
function normalizarProdutos(lista) {
  const usadas = {};
  return lista.map((produto, indice) => {
    const tipoLido = String(produto.tipo ?? "").trim().toLowerCase();
    const tipo = tipoLido === "pronta" ? "pronta" : "encomenda";
    if (tipoLido !== tipo && typeof console !== "undefined") {
      console.warn(`produtos.js: tipo "${produto.tipo}" desconhecido em "${produto.nome}"; usando "encomenda".`);
    }

    const categoriaLida = String(produto.categoria ?? "").trim();
    const categoria =
      CATEGORIAS_CONHECIDAS.find((c) => c.toLowerCase() === categoriaLida.toLowerCase()) ||
      categoriaLida ||
      "Outros";

    const base = String(produto.id || "produto-" + (indice + 1));
    usadas[base] = (usadas[base] || 0) + 1;
    const chave = usadas[base] === 1 ? base : `${base}-${usadas[base]}`;

    return { ...produto, tipo, categoria, preco: lerPreco(produto.preco), chave };
  });
}

// Confere se dá para enviar. Devolve a lista do que falta (vazia = tudo certo).
function validarPedido(pedido) {
  const erros = [];
  if (!pedido.nome.trim()) erros.push("Informe seu nome.");
  if (!pedido.itens.some((item) => item.quantidade > 0)) erros.push("Escolha pelo menos um item.");
  return erros;
}

/*
 * MENSAGEM DO WHATSAPP — para mudar o texto que o cliente envia, é aqui.
 * Exemplo do resultado:
 *
 *   Olá! Meu nome é Ana e gostaria de fazer um pedido pelo site:
 *
 *   *Encomendas*            ← *texto* fica em negrito no WhatsApp
 *   - 1x Bolo de chocolate
 *   Para: 10/12/2026
 *
 *   *Pronta entrega*
 *   - 2x Brownie (unidade)
 *
 *   Obs: tema infantil
 *
 * Se mudar o texto, rode os testes (node --test tests/*.test.js) e
 * atualize os exemplos em tests/mensagem.test.js.
 */
function montarMensagem(pedido) {
  const linhaItem = (item) => `- ${item.quantidade}x ${item.nome}`;
  const nome = pedido.nome.replace(/\s+/g, " ").trim();
  const blocos = [`Olá! Meu nome é ${nome} e gostaria de fazer um pedido pelo site:`];

  const encomendas = itensEscolhidos(pedido.itens, "encomenda");
  if (encomendas.length) {
    const linhas = ["*Encomendas*", ...encomendas.map(linhaItem)];
    if (pedido.data) linhas.push("Para: " + formatarData(pedido.data));
    blocos.push(linhas.join("\n"));
  }

  const prontas = itensEscolhidos(pedido.itens, "pronta");
  if (prontas.length) {
    blocos.push(["*Pronta entrega*", ...prontas.map(linhaItem)].join("\n"));
  }

  const observacao = pedido.observacao.trim();
  if (observacao) blocos.push("Obs: " + observacao);

  return blocos.join("\n\n");
}

// Monta o link wa.me que abre a conversa com a mensagem já escrita.
function linkWhatsApp(numero, texto) {
  return `https://wa.me/${numero.replace(/\D/g, "")}?text=${encodeURIComponent(texto)}`;
}

// (Técnico) Permite que os testes automáticos em tests/ usem estas funções. Não apague.
if (typeof module !== "undefined") {
  module.exports = {
    formatarPreco,
    formatarData,
    validarPedido,
    montarMensagem,
    linkWhatsApp,
    normalizarProdutos,
    CATEGORIAS_CONHECIDAS,
  };
}
