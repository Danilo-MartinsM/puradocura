/*
 * Testes automáticos da mensagem do WhatsApp e dos dados de produtos.js.
 * Para rodar (precisa do Node.js instalado):  node --test tests/*.test.js
 * Se todos passarem, aparece "fail 0" no final.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const {
  formatarPreco,
  formatarData,
  validarPedido,
  montarMensagem,
  linkWhatsApp,
  normalizarProdutos,
} = require("../js/mensagem.js");
const { CONFIG, PRODUTOS } = require("../js/produtos.js");

test("formatarPreco", () => {
  assert.equal(formatarPreco(80, true), "a partir de R$ 80,00");
  assert.equal(formatarPreco(6.5, false), "R$ 6,50");
});

test("formatarData", () => {
  assert.equal(formatarData("2026-12-10"), "10/12/2026");
  assert.equal(formatarData(""), "");
});

test("validarPedido exige nome e ao menos um item", () => {
  assert.deepEqual(validarPedido({ nome: "   ", data: "", observacao: "", itens: [] }), [
    "Informe seu nome.",
    "Escolha pelo menos um item.",
  ]);
  assert.deepEqual(
    validarPedido({
      nome: "Ana",
      data: "",
      observacao: "",
      itens: [{ nome: "Brownie", quantidade: 0, tipo: "pronta" }],
    }),
    ["Escolha pelo menos um item."]
  );
  assert.deepEqual(
    validarPedido({
      nome: "Ana",
      data: "",
      observacao: "",
      itens: [{ nome: "Brownie", quantidade: 1, tipo: "pronta" }],
    }),
    []
  );
});

test("montarMensagem com encomendas e pronta entrega", () => {
  const msg = montarMensagem({
    nome: " Ana ",
    data: "2026-12-10",
    observacao: "tema infantil",
    itens: [
      { nome: "Bolo de chocolate", quantidade: 1, tipo: "encomenda" },
      { nome: "Brigadeiro (cento)", quantidade: 2, tipo: "encomenda" },
      { nome: "Brownie", quantidade: 3, tipo: "pronta" },
      { nome: "Cupcake", quantidade: 0, tipo: "pronta" },
    ],
  });
  assert.equal(
    msg,
    "Olá! Meu nome é Ana e gostaria de fazer um pedido pelo site:\n\n" +
      "*Encomendas*\n- 1x Bolo de chocolate\n- 2x Brigadeiro (cento)\nPara: 10/12/2026\n\n" +
      "*Pronta entrega*\n- 3x Brownie\n\n" +
      "Obs: tema infantil"
  );
});

test("montarMensagem omite Para: sem encomendas e omite Obs vazia", () => {
  const msg = montarMensagem({
    nome: "Ana",
    data: "2026-12-10",
    observacao: "  ",
    itens: [{ nome: "Brownie", quantidade: 1, tipo: "pronta" }],
  });
  assert.equal(
    msg,
    "Olá! Meu nome é Ana e gostaria de fazer um pedido pelo site:\n\n*Pronta entrega*\n- 1x Brownie"
  );
});

test("linkWhatsApp limpa o número e codifica o texto", () => {
  assert.equal(
    linkWhatsApp("+55 (11) 99999-9999", "Olá & tchau? #1 🎂\nok"),
    "https://wa.me/5511999999999?text=" + encodeURIComponent("Olá & tchau? #1 🎂\nok")
  );
});

test("produtos.js tem dados válidos", () => {
  const ids = PRODUTOS.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length, "ids duplicados");
  for (const p of PRODUTOS) {
    assert.ok(["encomenda", "pronta"].includes(p.tipo), `tipo inválido em ${p.id}`);
    assert.ok(p.preco > 0, `preço inválido em ${p.id}`);
    assert.ok(["Bolos", "Brigadeiros", "Cupcakes", "Brownies"].includes(p.categoria), `categoria inválida em ${p.id}`);
  }
  assert.ok(CONFIG.whatsapp.replace(/\D/g, "").length >= 12);
});

test("montarMensagem junta espaços e quebras de linha do nome", () => {
  const msg = montarMensagem({
    nome: " João \n da  Silva ",
    data: "",
    observacao: "",
    itens: [{ nome: "Brownie", quantidade: 1, tipo: "pronta" }],
  });
  assert.ok(msg.startsWith("Olá! Meu nome é João da Silva e gostaria"));
});

test("formatarPreco aceita texto e devolve vazio para preço inválido", () => {
  assert.equal(formatarPreco("90", true), "a partir de R$ 90,00");
  assert.equal(formatarPreco("R$ 8,50", false), "R$ 8,50");
  assert.equal(formatarPreco("", true), "");
  assert.equal(formatarPreco(undefined, true), "");
});

test("normalizarProdutos tolera erros comuns de edição", () => {
  const lista = normalizarProdutos([
    { id: "a", nome: "A", categoria: "bolos", tipo: "Encomenda ", preco: "90" },
    { id: "a", nome: "A cópia", categoria: "Tortas", tipo: "pronta", preco: 10 },
    { id: "b", nome: "B", categoria: "Brownies", tipo: "xyz", preco: "R$ 90" },
  ]);
  assert.deepEqual(lista.map((p) => p.chave), ["a", "a-2", "b"]);
  assert.deepEqual(lista.map((p) => p.categoria), ["Bolos", "Tortas", "Brownies"]);
  assert.deepEqual(lista.map((p) => p.tipo), ["encomenda", "pronta", "encomenda"]);
  assert.deepEqual(lista.map((p) => p.preco), [90, 10, 90]);
});
