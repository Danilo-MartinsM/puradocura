# Site Pura Doçura — Design

Data: 2026-11-22 · Tamanho: projeto pequeno (design curto)

## Intenção e porquê

Site estático para a confeitaria artesanal **Pura Doçura**, linkado na bio do Instagram.
Clientes sempre perguntam "o que tem?" e "como faz?". O site responde isso e **adianta
a primeira mensagem no WhatsApp** — não fecha a venda, só agiliza o atendimento.
A conversa e o preço final continuam no WhatsApp com a confeiteira.

## Objetivos

- Apresentar a confeitaria e os produtos (bolos, brigadeiros, cupcakes, brownies).
- Contar brevemente a história da confeitaria.
- Permitir montar um pedido simples e enviá-lo ao WhatsApp com mensagem pronta.
- Ser fácil de manter: trocar produtos, preços e número sem mexer em HTML.

## Não-objetivos

- Pagamento, carrinho com total, login, backend ou painel administrativo.
- Resolver toda a negociação (sabores, tamanhos e valores finais ficam no WhatsApp).

## Anti-objetivos (seria fracasso mesmo funcionando)

- Página de pedido complicada a ponto de o cliente desistir e mandar "oi" no direct.
- Visual que não pareça a mesma marca do Instagram/manual de identidade.
- Preços desatualizados presos no HTML.

## Restrições

- Somente HTML, CSS e JavaScript puros. Sem framework, sem build.
- Funcionar bem no celular (público vem do Instagram) — mobile first.
- Seguir o manual de identidade visual (PDF "Pura Doçura — Identidade Visual").

## Abordagens consideradas

- **A) Três páginas HTML + CSS/JS compartilhados — ESCOLHIDA.** URLs próprias (link direto
  para o pedido), dados editáveis em um arquivo JS. Custo: menu/rodapé repetidos em 3 arquivos.
- B) Página única com seções trocadas via JS — código mais confuso, link direto pior.
- C) A + Bootstrap/Tailwind — brigaria com a identidade própria da marca.

## Estrutura

```
index.html        Início
historia.html     Nossa História
pedido.html       Monte seu Pedido
css/estilo.css
js/produtos.js    lista de produtos, preços "a partir de", nº WhatsApp, @instagram
js/pedido.js      monta a lista na tela, gera a mensagem, abre o WhatsApp
imagens/          fotos provisórias + símbolo P
```

## Identidade visual (decidido)

- Cores: Algodão `#FBF8F3` (fundo), Amêndoa `#E6D5C3` e Rosa Seco `#E6C9C2` (faixas/cartões),
  Framboesa Seca `#8C4A47` (botões, links, detalhes), Cacau 70% `#3B2621` (texto, rodapé).
- Fontes (Google Fonts): Fraunces (títulos, leve 300 e itálico), Jost (cardápio, preços,
  rótulos em caixa alta espaçada), Ballet (apenas assinatura — "Pura", manifesto; nunca texto longo).
- Logo "Pura Doçura" recriado em HTML/CSS com as fontes; símbolo **P** extraído do PDF
  (ou arquivos oficiais, se fornecidos).
- Elementos reaproveitados: onda divisória, selo circular "feito à mão", manifesto
  ("Feito à mão, feito com amor, feito para você."), linha "Bolos · Brigadeiros · Cupcakes · Brownies".
- Rodapé na versão "sobre cacau" com @instagram e WhatsApp.

## Páginas

**Início:** cabeçalho com símbolo + menu; destaque com a assinatura principal, "Confeitaria
Artesanal" e botão "Faça seu pedido"; texto curto "sobre"; galeria de produtos por categoria;
"Como encomendar" em 3 passos (escolha → envie pelo WhatsApp → combine detalhes); rodapé.

**Nossa História:** texto breve (provisório) com foto, fechando com o manifesto.

**Monte seu Pedido:**
- Duas abas: **Encomendas** e **Pronta entrega** (esta fácil de remover via `produtos.js`).
- Itens agrupados por categoria, cada um com nome, descrição curta, "a partir de R$ X"
  e seletor de quantidade [- 0 +]. Pronta entrega pode ter preço fechado.
- Campos: nome (obrigatório), data desejada (só em Encomendas), observação livre.
- Botão "Enviar pedido pelo WhatsApp" abre `https://wa.me/<número>?text=<mensagem>`.
- Mensagem sem total, ex.: "Olá! Sou a Ana, gostaria de encomendar: 1x Bolo de chocolate,
  1x Brigadeiro (cento). Para: 10/12. Obs: tema infantil."
- Sem itens selecionados ou sem nome: botão avisa o que falta em vez de enviar.

## Conteúdo

Textos, fotos, produtos, preços, número e @instagram **provisórios**, marcados para troca.
O dono substitui depois (fotos em `imagens/`, dados em `js/produtos.js`).

## Hospedagem

GitHub Pages ou Netlify (gratuito). Fica para o final; não afeta a construção.

## Decisões deixadas ao construtor (chamadas minhas)

- Formato exato de `produtos.js` (array de objetos com categoria, tipo encomenda/pronta, preço).
- Se a aba Pronta entrega e o pedido de Encomendas podem ser combinados na mesma mensagem
  (proposta: sim — uma mensagem só, com as duas seções quando houver itens nas duas).
- Origem das fotos provisórias (placeholders locais simples, sem depender de serviço externo).
- Data mínima da encomenda: sem restrição no site (a confeiteira combina no WhatsApp).
