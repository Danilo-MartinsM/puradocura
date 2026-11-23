/*
 * ============================================================
 *  DADOS DO SITE — este é o arquivo que você mais vai editar
 * ============================================================
 *
 * Tudo que muda com frequência fica aqui, sem precisar mexer no HTML:
 *   1. CONFIG   → número do WhatsApp e Instagram (usados no rodapé das
 *                 3 páginas e no botão "Enviar pedido pelo WhatsApp").
 *   2. PRODUTOS → itens que aparecem na página "Monte seu Pedido".
 *
 * Depois de salvar, recarregue o site com Ctrl + Shift + R.
 */

/* ------------------------------------------------------------
 * 1. CONTATO DA CONFEITARIA
 * ------------------------------------------------------------
 * whatsapp:     DDI (55) + DDD + número. Pode escrever com espaços,
 *               parênteses e traços — o site usa só os dígitos.
 * instagram:    o @ como aparece escrito no rodapé.
 * instagramUrl: o endereço do perfil (para onde o link leva).
 */
const CONFIG = {
  whatsapp: "+55 (85) 8664-2054",
  instagram: "@puradocura.fortaleza",
  instagramUrl: "https://www.instagram.com/puradocura.fortaleza/",
};

/* ------------------------------------------------------------
 * 2. PRODUTOS (página "Monte seu Pedido")
 * ------------------------------------------------------------
 * Cada produto é um bloco { ... }, separado do próximo por vírgula.
 *
 *   id:        nome interno único, sem espaços nem acentos (ex.: "bolo-cenoura")
 *   nome:      como aparece no site e na mensagem do WhatsApp
 *   descricao: frase curta embaixo do nome
 *   categoria: "Bolos" | "Brigadeiros" | "Cupcakes" | "Brownies"
 *              (pode criar outra, ex.: "Tortas" — ela vira um grupo novo)
 *   tipo:      "encomenda" → aba Encomendas | "pronta" → aba Pronta entrega
 *   preco:     só o número, com ponto nos centavos (ex.: 90 ou 3.5)
 *   aPartirDe: true  → mostra "a partir de R$ 90,00"
 *              false → mostra o preço fechado "R$ 3,50"
 *   imagem:    caminho da foto dentro da pasta imagens/
 *
 * ADICIONAR: copie um bloco inteiro, cole abaixo e troque o id e os dados.
 * REMOVER:   apague o bloco inteiro, do "{" até o "},".
 * SEM PRONTA ENTREGA: apague todos os blocos com tipo "pronta" — as abas
 *                     somem sozinhas da página de pedido.
 */

// PROVISÓRIO — trocar pelos produtos, preços e fotos reais
const PRODUTOS = [
  // ----- Encomendas -----
  {
    id: "bolo-chocolate",
    nome: "Bolo de chocolate",
    descricao: "Massa fofinha de cacau com recheio de brigadeiro.",
    categoria: "Bolos",
    tipo: "encomenda",
    preco: 90,
    aPartirDe: true,
    imagem: "imagens/bolo.svg",
  },
  {
    id: "bolo-ninho-morango",
    nome: "Bolo de ninho com morango",
    descricao: "Creme de leite ninho e morangos frescos.",
    categoria: "Bolos",
    tipo: "encomenda",
    preco: 110,
    aPartirDe: true,
    imagem: "imagens/bolo.svg",
  },
  {
    id: "brigadeiro-tradicional",
    nome: "Brigadeiros tradicionais (cento)",
    descricao: "Chocolate belga e granulado.",
    categoria: "Brigadeiros",
    tipo: "encomenda",
    preco: 150,
    aPartirDe: true,
    imagem: "imagens/brigadeiro.svg",
  },
  {
    id: "brigadeiro-gourmet",
    nome: "Brigadeiros de autor (cento)",
    descricao: "Sabores variados: pistache, café, limão siciliano.",
    categoria: "Brigadeiros",
    tipo: "encomenda",
    preco: 190,
    aPartirDe: true,
    imagem: "imagens/brigadeiro.svg",
  },
  {
    id: "cupcake-decorado",
    nome: "Cupcakes decorados (dúzia)",
    descricao: "Decoração personalizada para a sua festa.",
    categoria: "Cupcakes",
    tipo: "encomenda",
    preco: 84,
    aPartirDe: true,
    imagem: "imagens/cupcake.svg",
  },
  {
    id: "brownie-caixa",
    nome: "Caixa de brownies (12 un.)",
    descricao: "Brownie úmido com casquinha crocante.",
    categoria: "Brownies",
    tipo: "encomenda",
    preco: 72,
    aPartirDe: true,
    imagem: "imagens/brownie.svg",
  },

  // ----- Pronta entrega -----
  {
    id: "pronta-brigadeiro",
    nome: "Brigadeiro (unidade)",
    descricao: "Sabores do dia.",
    categoria: "Brigadeiros",
    tipo: "pronta",
    preco: 3.5,
    aPartirDe: false,
    imagem: "imagens/brigadeiro.svg",
  },
  {
    id: "pronta-brownie",
    nome: "Brownie (unidade)",
    descricao: "Tradicional ou com doce de leite.",
    categoria: "Brownies",
    tipo: "pronta",
    preco: 8,
    aPartirDe: false,
    imagem: "imagens/brownie.svg",
  },
  {
    id: "pronta-cupcake",
    nome: "Cupcake (unidade)",
    descricao: "Sabor do dia.",
    categoria: "Cupcakes",
    tipo: "pronta",
    preco: 9,
    aPartirDe: false,
    imagem: "imagens/cupcake.svg",
  },
];

// (Técnico) Permite que os testes automáticos em tests/ leiam este arquivo. Não apague.
if (typeof module !== "undefined") module.exports = { CONFIG, PRODUTOS };
