/*
 * ============================================================
 *  RODAPÉ — preenche os links de contato nas 3 páginas
 * ============================================================
 * Você não precisa editar este arquivo para trocar número ou @:
 * eles vêm do CONFIG em js/produtos.js.
 *
 * Como funciona: no HTML, qualquer link com
 *   data-whatsapp        → vira o link do WhatsApp
 *   data-instagram       → vira o link do Instagram
 *   data-instagram-texto → além do link, mostra o @ como texto
 *   data-ano             → recebe o ano atual
 * Então dá para colocar um link de WhatsApp em qualquer lugar do site
 * só escrevendo <a data-whatsapp href="#">Fale com a gente</a>.
 */
function preencherRodape() {
  // Deixa só os dígitos: "+55 (85) 8664-2054" → "558586642054"
  const numero = CONFIG.whatsapp.replace(/\D/g, "");

  document.querySelectorAll("[data-whatsapp]").forEach((link) => {
    link.href = "https://wa.me/" + numero;
  });

  document.querySelectorAll("[data-instagram]").forEach((link) => {
    link.href = CONFIG.instagramUrl;
    if (link.hasAttribute("data-instagram-texto")) link.textContent = CONFIG.instagram;
  });

  document.querySelectorAll("[data-ano]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

// Roda quando a página termina de carregar
document.addEventListener("DOMContentLoaded", preencherRodape);
