/*
 * ============================================================
 *  PÁGINA "MONTE SEU PEDIDO" — faz a página funcionar
 * ============================================================
 * Liga os produtos (js/produtos.js) e a mensagem (js/mensagem.js) à tela:
 * desenha a lista, controla as abas e os botões + e −, confere o
 * formulário e abre o WhatsApp.
 *
 * O que dá para mudar aqui com segurança:
 *   - QTD_MAXIMA: quantidade máxima de cada item.
 *   - DICAS: frase que aparece embaixo das abas.
 *   - NOTAS: frase embaixo do botão de enviar.
 *   - renderizarItem: o "desenho" (HTML) de cada produto da lista.
 * Para trocar produtos ou preços, use js/produtos.js — não este arquivo.
 */

// ---------- Textos e limites ----------
const QTD_MAXIMA = 99;
let produtos = []; // PRODUTOS já normalizados (ver normalizarProdutos em mensagem.js)
const DICAS = {
  encomenda: "Feitos sob encomenda — peça com alguns dias de antecedência.",
  pronta: "Disponíveis hoje, enquanto durarem.",
};
const NOTAS = {
  encomenda: "Os valores são “a partir de” — o preço final é combinado no WhatsApp.",
  pronta: "Pagamento e retirada são combinados no WhatsApp.",
};

// ---------- Estado da página (o que o cliente já escolheu) ----------
const quantidades = {}; // chave do produto -> quantidade
let abaAtual = "encomenda"; // "encomenda" ou "pronta"

// Evita que textos com < > & quebrem o HTML (segurança).

function escapar(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

// ---------- Desenho da lista ----------

// Desenha os produtos da aba atual, agrupados por categoria.
function renderizarLista() {
  const lista = document.getElementById("lista-produtos");
  const doTipo = produtos.filter((p) => p.tipo === abaAtual);
  // Categorias conhecidas primeiro, depois qualquer outra que o dono criar
  const categorias = [...new Set([...CATEGORIAS_CONHECIDAS, ...doTipo.map((p) => p.categoria)])];

  lista.innerHTML = categorias.map((categoria) => {
    const itens = doTipo.filter((p) => p.categoria === categoria);
    if (!itens.length) return "";
    return `
      <section class="categoria">
        <h2 class="categoria__titulo">${escapar(categoria)}</h2>
        <ul class="produtos">
          ${itens.map(renderizarItem).join("")}
        </ul>
      </section>`;
  }).join("");

  lista.setAttribute("aria-labelledby", "aba-" + abaAtual);
  document.getElementById("dica-aba").textContent = DICAS[abaAtual];
  document.getElementById("nota-preco").textContent = NOTAS[abaAtual];
}

// HTML de um produto: foto, nome, descrição, preço e botões − quantidade +.
function renderizarItem(p) {
  const qtd = quantidades[p.chave] || 0;
  const nome = escapar(p.nome);
  const chave = escapar(p.chave);
  const preco = formatarPreco(p.preco, p.aPartirDe);
  return `
    <li class="produto${qtd ? " produto--escolhido" : ""}" data-chave="${chave}">
      <img class="produto__foto" src="${escapar(p.imagem)}" alt="" width="96" height="72" loading="lazy">
      <div class="produto__info">
        <h3 class="produto__nome">${nome}</h3>
        <p class="produto__descricao">${escapar(p.descricao)}</p>
        ${preco ? `<p class="produto__preco">${preco}</p>` : ""}
      </div>
      <div class="qtd" role="group" aria-label="Quantidade de ${nome}">
        <button type="button" class="qtd__botao" data-delta="-1" aria-label="Diminuir ${nome}" ${qtd === 0 ? "disabled" : ""}>−</button>
        <output class="qtd__valor" aria-live="polite">${qtd}</output>
        <button type="button" class="qtd__botao" data-delta="1" aria-label="Aumentar ${nome}" ${qtd >= QTD_MAXIMA ? "disabled" : ""}>+</button>
      </div>
    </li>`;
}

// ---------- Abas ----------

// Troca entre Encomendas e Pronta entrega (as quantidades escolhidas continuam).
function trocarAba(tipo, focar = false) {
  abaAtual = tipo;
  document.querySelectorAll(".aba").forEach((aba) => {
    const ativa = aba.dataset.tipo === tipo;
    aba.setAttribute("aria-selected", String(ativa));
    aba.tabIndex = ativa ? 0 : -1; // só a aba ativa entra no Tab; setas trocam entre elas
    if (ativa && focar) aba.focus();
  });
  // A data só faz sentido para encomendas
  document.getElementById("campo-data-wrap").hidden = tipo !== "encomenda";
  renderizarLista();
}

// Setas ← → , Home e End trocam de aba (acessibilidade pelo teclado).
function navegarAbasComTeclado(evento) {
  const abas = [...document.querySelectorAll(".aba")];
  const atual = abas.findIndex((a) => a.dataset.tipo === abaAtual);
  const destino = {
    ArrowRight: (atual + 1) % abas.length,
    ArrowLeft: (atual - 1 + abas.length) % abas.length,
    Home: 0,
    End: abas.length - 1,
  }[evento.key];
  if (destino === undefined) return;
  evento.preventDefault();
  trocarAba(abas[destino].dataset.tipo, true);
}

// ---------- Quantidades ----------

// Atualiza só o item alterado (sem redesenhar a lista), para manter o foco
// no botão e o leitor de tela anunciar a nova quantidade.
function alterarQuantidade(item, delta) {
  const chave = item.dataset.chave;
  const nova = Math.min(QTD_MAXIMA, Math.max(0, (quantidades[chave] || 0) + delta));
  quantidades[chave] = nova;

  item.classList.toggle("produto--escolhido", nova > 0);
  item.querySelector(".qtd__valor").textContent = nova;
  const [menos, mais] = item.querySelectorAll(".qtd__botao");
  menos.disabled = nova === 0;
  mais.disabled = nova >= QTD_MAXIMA;
  // Se o botão clicado ficou desativado, leva o foco para o outro
  if (document.activeElement?.disabled || !item.contains(document.activeElement)) {
    (nova === 0 ? mais : menos).focus();
  }

  atualizarResumo();
}

// Atualiza o texto "N itens escolhidos" perto do botão de enviar.
function atualizarResumo() {
  const total = Object.values(quantidades).reduce((soma, q) => soma + q, 0);
  document.getElementById("resumo").textContent =
    total === 0 ? "Nenhum item escolhido" : total === 1 ? "1 item escolhido" : `${total} itens escolhidos`;
  revalidarAviso();
}

// ---------- Formulário e envio ----------

// Junta tudo o que o cliente preencheu num objeto só.
function montarPedido() {
  return {
    nome: document.getElementById("campo-nome").value,
    data: document.getElementById("campo-data").value,
    observacao: document.getElementById("campo-obs").value,
    itens: produtos.map((p) => ({ nome: p.nome, quantidade: quantidades[p.chave] || 0, tipo: p.tipo })),
  };
}

// Mostra a caixa de aviso com o que está faltando.
function mostrarAviso(erros) {
  const aviso = document.getElementById("aviso");
  aviso.innerHTML = erros.map((e) => `<p>${escapar(e)}</p>`).join("");
  aviso.hidden = false;
}

// Se o aviso está na tela, mostra só o que ainda falta (ou some quando estiver tudo certo)
function revalidarAviso() {
  const aviso = document.getElementById("aviso");
  if (aviso.hidden) return;
  const erros = validarPedido(montarPedido());
  if (erros.length) mostrarAviso(erros);
  else aviso.hidden = true;
}

// Clique em "Enviar pedido pelo WhatsApp": confere e, se estiver tudo certo, abre o WhatsApp.
function enviarPedido(evento) {
  evento.preventDefault();
  const pedido = montarPedido();
  const erros = validarPedido(pedido);

  if (erros.length) {
    mostrarAviso(erros);
    if (!pedido.nome.trim()) document.getElementById("campo-nome").focus();
    else document.getElementById("lista-produtos").scrollIntoView();
    return;
  }

  document.getElementById("aviso").hidden = true;
  abrirWhatsApp(linkWhatsApp(CONFIG.whatsapp, montarMensagem(pedido)));
}

// Navega na mesma aba: window.open falha em silêncio no navegador interno
// do Instagram/Facebook, que é por onde a maioria dos clientes chega.
function abrirWhatsApp(url) {
  window.location.href = url;
}

// ---------- Início ----------

// Prepara a página assim que ela carrega: lista, abas, botões e formulário.
function iniciarPedido() {
  produtos = normalizarProdutos(PRODUTOS);

  // Sem produtos de pronta entrega: esconde as abas e fica só com Encomendas
  if (!produtos.some((p) => p.tipo === "pronta")) {
    document.getElementById("abas").hidden = true;
  }

  const abas = document.getElementById("abas");
  abas.addEventListener("click", (e) => {
    const aba = e.target.closest(".aba");
    if (aba) trocarAba(aba.dataset.tipo);
  });
  abas.addEventListener("keydown", navegarAbasComTeclado);

  document.getElementById("lista-produtos").addEventListener("click", (e) => {
    const botao = e.target.closest(".qtd__botao");
    if (botao) alterarQuantidade(botao.closest(".produto"), Number(botao.dataset.delta));
  });

  document.getElementById("campo-nome").addEventListener("input", revalidarAviso);

  document.getElementById("form-pedido").addEventListener("submit", enviarPedido);

  trocarAba("encomenda");
  atualizarResumo();
}

document.addEventListener("DOMContentLoaded", iniciarPedido);
