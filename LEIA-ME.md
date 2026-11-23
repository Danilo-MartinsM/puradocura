# Pura Doçura — site

Site estático (HTML, CSS e JavaScript puros) da confeitaria Pura Doçura, feito para o link da bio do Instagram.

| Página | Arquivo |
|---|---|
| Início | `index.html` |
| Nossa história | `historia.html` |
| Monte seu pedido | `pedido.html` |

## Mapa: onde mexer em cada coisa

| Quero mudar... | Arquivo | Onde |
|---|---|---|
| Número do WhatsApp, @ do Instagram | `js/produtos.js` | bloco `CONFIG` (topo) |
| Produtos, preços, fotos dos produtos | `js/produtos.js` | lista `PRODUTOS` |
| Texto da mensagem que chega no WhatsApp | `js/mensagem.js` | função `montarMensagem` |
| Frases embaixo das abas e do botão de enviar | `js/pedido.js` | `DICAS` e `NOTAS` (topo) |
| Textos e fotos da página inicial | `index.html` | procure `PROVISÓRIO` |
| Texto e foto da Nossa História | `historia.html` | procure `PROVISÓRIO` |
| Menu ou rodapé | as 3 páginas `.html` | blocos `CABEÇALHO` e `RODAPÉ` (mude nas 3) |
| Cores, fontes, tamanhos | `css/estilo.css` | bloco `VARIÁVEIS` (topo) |

Todos os arquivos têm comentários explicando cada parte. Nos `.html` eles aparecem como `<!-- ... -->`, no CSS e no JS como `/* ... */` ou `// ...`. Comentários não aparecem no site.

## Como editar

### Número do WhatsApp e Instagram
Abra `js/produtos.js` e altere o bloco `CONFIG` no topo:

```js
const CONFIG = {
  whatsapp: "+55 (85) 8664-2054",    // DDI + DDD + número (pode ter espaços e traços)
  instagram: "@puradocura.fortaleza",
  instagramUrl: "https://www.instagram.com/puradocura.fortaleza/",
};
```

### Produtos e preços
Ainda em `js/produtos.js`, cada produto da lista `PRODUTOS` é um bloco assim:

```js
{
  id: "bolo-chocolate",          // identificador único, sem espaços
  nome: "Bolo de chocolate",
  descricao: "Massa fofinha de cacau com recheio de brigadeiro.",
  categoria: "Bolos",            // Bolos | Brigadeiros | Cupcakes | Brownies
  tipo: "encomenda",             // encomenda | pronta
  preco: 90,                     // use ponto para centavos: 3.5
  aPartirDe: true,               // true = "a partir de R$ 90,00"
  imagem: "imagens/bolo.svg",
},
```

- **Adicionar:** copie um bloco, mude o `id` e os dados.
- **Remover:** apague o bloco inteiro (do `{` até o `},`).
- **Tirar a pronta entrega do site:** apague todos os produtos com `tipo: "pronta"`. As abas somem sozinhas.

### Fotos
As imagens ficam em `imagens/`. As atuais são provisórias (`bolo.svg`, `brigadeiro.svg`, `cupcake.svg`, `brownie.svg`, `historia.svg`).
Coloque as fotos reais na pasta (de preferência `.jpg` em proporção 4:3, até ~300 KB cada) e troque o caminho no HTML (`src="imagens/..."`) ou no campo `imagem` dos produtos.

### Textos
Os textos provisórios estão marcados com o comentário `PROVISÓRIO` dentro dos arquivos `.html`. Procure por essa palavra para achar o que trocar.

### Logo
`imagens/simbolo-p.png` (escuro) e `imagens/simbolo-p-claro.png` (para fundo cacau) foram recortados do manual de identidade. Se tiver os arquivos oficiais do logo, substitua mantendo os mesmos nomes.

## Ver o site no computador
Basta abrir o `index.html` no navegador. Depois de editar algo, recarregue com **Ctrl + Shift + R** para o navegador não mostrar a versão antiga.

## Testes
A lógica da mensagem do WhatsApp tem testes automáticos (precisa do [Node.js](https://nodejs.org)):

```bash
node --test tests/*.test.js
```

## Publicar (grátis)
- **Netlify:** entre em app.netlify.com → *Add new site* → *Deploy manually* e arraste esta pasta.
- **GitHub Pages:** suba a pasta para um repositório no GitHub → *Settings* → *Pages* → *Deploy from a branch* (`main`, pasta `/root`).

Depois é só colocar o link gerado (ou o de `.../pedido.html`) na bio do Instagram.
