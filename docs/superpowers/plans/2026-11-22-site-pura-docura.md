# Site Pura Doçura Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Site estático de 3 páginas (Início, Nossa História, Monte seu Pedido) que envia o pedido montado para o WhatsApp da confeitaria.

**Architecture:** Três arquivos HTML independentes compartilhando `css/estilo.css`. Dados editáveis em `js/produtos.js`; lógica pura de mensagem em `js/mensagem.js` (testável no Node); `js/pedido.js` só liga a lógica ao DOM. Scripts clássicos (`<script src>`), sem módulos ES, para funcionar abrindo o arquivo direto no navegador.

**Tech Stack:** HTML, CSS, JavaScript puro. Google Fonts (Fraunces, Jost, Ballet). Testes com `node --test` (Node 24, sem dependências).

**Spec:** `docs/superpowers/specs/2026-11-22-site-pura-docura-design.md`

## Global Constraints

- Sem framework, sem build, sem dependências npm. Só HTML/CSS/JS.
- Mobile first; funcionar de 360px de largura até desktop, sem rolagem horizontal.
- Cores exatas: Algodão `#FBF8F3`, Amêndoa `#E6D5C3`, Rosa Seco `#E6C9C2`, Framboesa Seca `#8C4A47`, Cacau 70% `#3B2621`.
- Fontes: Fraunces (títulos, peso 300 e itálico), Jost (rótulos/preços/botões; títulos pequenos em caixa alta espaçada), Ballet (só assinatura: "Pura", manifesto — nunca texto longo).
- Preços sempre exibidos como "a partir de R$ X" nas encomendas; pronta entrega pode ter preço fechado. A mensagem do WhatsApp **não** leva preço nem total.
- Todo conteúdo provisório (textos, fotos, número, @) marcado com comentário `<!-- PROVISÓRIO -->` ou `// PROVISÓRIO`.
- Idioma do site: português do Brasil. `<html lang="pt-BR">`.
- Não é repositório git: **não** há passos de commit. Se o usuário pedir git depois, um commit por task.

## Review Focus

1. Texto com acentos, `&`, `#`, `?`, emoji ou quebra de linha na observação/nome → a mensagem chega intacta no WhatsApp (tudo via `encodeURIComponent`). Teste em Task 1.
2. Nome só com espaços, ou nenhum item com quantidade > 0 → não abre o WhatsApp; mostra o que falta. Teste em Task 1 (`validarPedido`) e verificação em Task 4.
3. Número do WhatsApp escrito com formatação (`+55 (11) 99999-9999`) em `produtos.js` → link usa só dígitos. Teste em Task 1.
4. Data preenchida mas só itens de pronta entrega → a linha "Para:" não aparece. Teste em Task 1.
5. Nenhum produto `tipo: "pronta"` em `produtos.js` (dono removeu) → aba Pronta entrega some e a página funciona só com Encomendas. Verificação em Task 4.

---

### Task 1: Dados e lógica da mensagem

**Files:**
- Create: `js/produtos.js`
- Create: `js/mensagem.js`
- Test: `tests/mensagem.test.js`

**Interfaces:**
- Produces (`js/produtos.js`, globais no navegador e `module.exports` no Node):
  - `CONFIG = { whatsapp: string, instagram: string, instagramUrl: string }`
  - `PRODUTOS: Array<{ id: string, nome: string, descricao: string, categoria: "Bolos"|"Brigadeiros"|"Cupcakes"|"Brownies", tipo: "encomenda"|"pronta", preco: number, aPartirDe: boolean, imagem: string }>`
  - Conteúdo provisório: ~2 itens por categoria como encomenda (`aPartirDe: true`) e 2–3 itens `pronta` (`aPartirDe: false`).
- Produces (`js/mensagem.js`, globais e `module.exports`):
  - `formatarPreco(valor: number, aPartirDe: boolean) -> string` — `"a partir de R$ 80,00"` / `"R$ 6,50"`
  - `formatarData(iso: string) -> string` — `"2026-12-10"` → `"10/12/2026"`; `""` → `""`
  - `validarPedido(pedido) -> string[]` — mensagens de erro em português; vazio = válido
  - `montarMensagem(pedido) -> string`
  - `linkWhatsApp(numero: string, texto: string) -> string`
  - onde `pedido = { nome: string, data: string /* ISO ou "" */, observacao: string, itens: Array<{ nome: string, quantidade: number, tipo: "encomenda"|"pronta" }> }`

- [ ] **Step 1: Write the failing tests** em `tests/mensagem.test.js` (`node:test` + `node:assert/strict`, `require("../js/mensagem.js")`):

```js
test("formatarPreco", () => {
  assert.equal(formatarPreco(80, true), "a partir de R$ 80,00");
  assert.equal(formatarPreco(6.5, false), "R$ 6,50");
});
test("formatarData", () => {
  assert.equal(formatarData("2026-12-10"), "10/12/2026");
  assert.equal(formatarData(""), "");
});
test("validarPedido exige nome e ao menos um item", () => {
  assert.deepEqual(validarPedido({ nome: "   ", data: "", observacao: "", itens: [] }),
    ["Informe seu nome.", "Escolha pelo menos um item."]);
  assert.deepEqual(validarPedido({ nome: "Ana", data: "", observacao: "",
    itens: [{ nome: "Brownie", quantidade: 0, tipo: "pronta" }] }), ["Escolha pelo menos um item."]);
});
test("montarMensagem com encomendas e pronta entrega", () => {
  const msg = montarMensagem({ nome: " Ana ", data: "2026-12-10", observacao: "tema infantil",
    itens: [
      { nome: "Bolo de chocolate", quantidade: 1, tipo: "encomenda" },
      { nome: "Brigadeiro (cento)", quantidade: 2, tipo: "encomenda" },
      { nome: "Brownie", quantidade: 3, tipo: "pronta" },
      { nome: "Cupcake", quantidade: 0, tipo: "pronta" } ] });
  assert.equal(msg,
    "Olá! Sou a Ana e gostaria de fazer um pedido pelo site:\n\n" +
    "*Encomendas*\n- 1x Bolo de chocolate\n- 2x Brigadeiro (cento)\nPara: 10/12/2026\n\n" +
    "*Pronta entrega*\n- 3x Brownie\n\n" +
    "Obs: tema infantil");
});
test("montarMensagem omite Para: sem encomendas e omite Obs vazia", () => {
  const msg = montarMensagem({ nome: "Ana", data: "2026-12-10", observacao: "  ",
    itens: [{ nome: "Brownie", quantidade: 1, tipo: "pronta" }] });
  assert.equal(msg, "Olá! Sou a Ana e gostaria de fazer um pedido pelo site:\n\n*Pronta entrega*\n- 1x Brownie");
});
test("linkWhatsApp limpa o número e codifica o texto", () => {
  assert.equal(linkWhatsApp("+55 (11) 99999-9999", "Olá & tchau? #1 🎂\nok"),
    "https://wa.me/5511999999999?text=" + encodeURIComponent("Olá & tchau? #1 🎂\nok"));
});
```

Também um teste que faz `require("../js/produtos.js")` e confere que todo produto tem `id` único, `tipo` em `["encomenda","pronta"]`, `preco > 0`, e que `CONFIG.whatsapp` tem só dígitos após remover não-dígitos e ≥ 12 dígitos.

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/`
Expected: FAIL — `Cannot find module '../js/mensagem.js'`

- [ ] **Step 3: Implement `js/produtos.js` e `js/mensagem.js`**

Ambos terminam com `if (typeof module !== "undefined") module.exports = { ... };` para o Node, e ficam como globais no navegador. Preço com `toLocaleString("pt-BR", { minimumFractionDigits: 2 })` ou formatação manual equivalente. Seções da mensagem só aparecem se tiverem itens com quantidade > 0; "Para:" só dentro de Encomendas e só com data; "Obs:" só com observação não vazia após `trim()`. Nome com `trim()`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/`
Expected: todos PASS, 0 fail.

---

### Task 2: Base visual + página Início

**Files:**
- Create: `css/estilo.css`
- Create: `index.html` (carrega `js/produtos.js` e `js/layout.js`)
- Create: `js/layout.js`
- Create: `imagens/simbolo-p.svg` (ou `.png`)
- Create: `imagens/` placeholders SVG por categoria: `bolo.svg`, `brigadeiro.svg`, `cupcake.svg`, `brownie.svg`, `historia.svg`

**Interfaces:**
- Consumes: `CONFIG` de `js/produtos.js` (rodapé preenche WhatsApp/Instagram via pequeno script inline ou em `js/layout.js`).
- Produces (usado por Tasks 3 e 4): variáveis CSS `--algodao --amendoa --rosa-seco --framboesa --cacau`; classes `.cabecalho`, `.menu` (com `.ativo` na página atual), `.assinatura` (logo HTML: `<span class="assinatura__pura">Pura</span><span class="assinatura__docura">Doçura</span>`), `.rotulo` (Jost caixa alta espaçada), `.botao` (Framboesa), `.onda` (divisor SVG inline/background), `.secao`, `.secao--amendoa`, `.secao--rosa`, `.cartao`, `.rodape` (fundo Cacau, versão "sobre cacau" da marca); `js/layout.js` com `preencherRodape()` que escreve links `https://wa.me/<dígitos>` e `CONFIG.instagramUrl` em elementos `[data-whatsapp]` e `[data-instagram]`.

- [ ] **Step 1: Extrair o símbolo P** do PDF `C:\Users\danil\Downloads\Pura Doçura — Identidade Visual.pdf` com PyMuPDF (já instalado em scratchpad `pylibs`): recortar a região do símbolo na página 1 (`page.get_svg_image()` ou `get_pixmap(clip=..., dpi=300, alpha=True)`) para `imagens/simbolo-p.svg`/`.png`. Fallback se não sair limpo: "P" em Fraunces itálico Framboesa. Verificar abrindo o arquivo.

- [ ] **Step 2: Placeholders** SVG simples nas cores da marca (fundo Amêndoa/Rosa Seco, nome da categoria em Fraunces), com comentário `PROVISÓRIO`.

- [ ] **Step 3: `css/estilo.css`** com tokens, `@import` das Google Fonts (`Fraunces:ital,wght@0,300;0,400;1,300`, `Jost:wght@400;500`, `Ballet`), base mobile first, e as classes do bloco Interfaces. Menu: no celular os 3 links em linha compacta (sem hambúrguer — são só 3).

- [ ] **Step 4: `index.html`** — seções na ordem do spec: cabeçalho; destaque (assinatura, "CONFEITARIA ARTESANAL", onda, botão "Faça seu pedido" → `pedido.html`); "Sobre" curto (provisório); galeria de 4 categorias (imagem + nome + linha curta); "Como encomendar" em 3 passos (Escolha no site → Envie pelo WhatsApp → Combine os detalhes com a confeiteira); rodapé com "feito à mão", WhatsApp e Instagram.

- [ ] **Step 5: Verificar no navegador** — abrir `index.html` no painel de navegador, em largura 375px e desktop: sem erros no console, fontes carregadas, sem rolagem horizontal, links do rodapé apontam para `https://wa.me/<número>` e Instagram.

---

### Task 3: Nossa História

**Files:**
- Create: `historia.html`

**Interfaces:**
- Consumes: classes e `js/layout.js` da Task 2.

- [ ] **Step 1: `historia.html`** — mesmo cabeçalho (link `.ativo`) e rodapé; título; 2–3 parágrafos curtos provisórios com `historia.svg`; fechamento com o manifesto "Feito à mão, / feito com amor, / feito para você." (Fraunces itálico; "Pura" em Ballet na assinatura abaixo) e o selo circular "PURA DOÇURA · CONFEITARIA ARTESANAL · FEITO À MÃO ·" (SVG com `textPath`) como detalhe.

- [ ] **Step 2: Verificar no navegador** em 375px e desktop: sem erros no console, menu navega entre Início e História.

---

### Task 4: Monte seu Pedido

**Files:**
- Create: `pedido.html`
- Create: `js/pedido.js`

**Interfaces:**
- Consumes: `CONFIG`, `PRODUTOS` (Task 1); `formatarPreco`, `validarPedido`, `montarMensagem`, `linkWhatsApp` (Task 1); classes CSS (Task 2).
- Produces: `js/pedido.js` com `iniciarPedido()` chamado no `DOMContentLoaded`; estado `quantidades: Record<id, number>`.

- [ ] **Step 1: `pedido.html`** — ordem de scripts: `produtos.js`, `mensagem.js`, `layout.js`, `pedido.js`. Abas "Encomendas" / "Pronta entrega" (`role="tablist"`, botões com `aria-selected`); contêiner da lista; campos `nome` (obrigatório), `data` (`type="date"`, visível só na aba Encomendas), `observacao` (textarea, placeholder "sabor, tema, tamanho..."); área de aviso `role="alert"`; botão "Enviar pedido pelo WhatsApp".

- [ ] **Step 2: `js/pedido.js`** — renderiza `PRODUTOS` filtrados pela aba, agrupados por `categoria`, cada item com nome, descrição, `formatarPreco(preco, aPartirDe)` e seletor `[- n +]` (mínimo 0, máximo 99). Quantidades persistem ao trocar de aba. Mostra um resumo "N itens escolhidos". Se não houver produto `pronta`, esconde as abas. No envio: monta o `pedido`, `validarPedido`; com erros mostra-os no aviso e foca o primeiro campo problemático; sem erros, `window.open(linkWhatsApp(CONFIG.whatsapp, montarMensagem(pedido)), "_blank")`.

- [ ] **Step 3: Verificar no navegador** (375px e desktop):
  - Enviar sem nome e sem itens → aviso "Informe seu nome." e "Escolha pelo menos um item."; nada abre.
  - Escolher 1 bolo (Encomendas), 2 brownies (Pronta entrega), data e obs com acento/emoji → interceptar o `window.open` via console (`window.open = u => console.log(u)`) e conferir que `decodeURIComponent` da URL bate com o formato da Task 1.
  - Trocar de aba não zera quantidades; campo de data some na aba Pronta entrega.
  - Remover temporariamente os itens `pronta` de `produtos.js` → abas somem, página funciona; restaurar.

---

### Task 5: Revisão final e instruções de manutenção

**Files:**
- Create: `LEIA-ME.md`

- [ ] **Step 1: `LEIA-ME.md`** curto: como trocar número/Instagram (`js/produtos.js` → `CONFIG`), como adicionar/remover produto e a pronta entrega, onde trocar fotos (`imagens/`) e textos (procurar `PROVISÓRIO`), como rodar os testes (`node --test tests/`) e como publicar no GitHub Pages ou Netlify (arrastar a pasta).

- [ ] **Step 2: Rodar tudo**

Run: `node --test tests/`
Expected: todos PASS.
Abrir as 3 páginas em 375px: navegação entre todas, sem erros de console, sem rolagem horizontal.
