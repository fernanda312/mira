/* MIRA — aplica no site público o que o comprador guarda no painel.
   Lê APENAS as chaves que js/admin.js grava em localStorage.
   Não inventa nenhum contacto, email ou número: não há mailto aqui.
   Regras de segurança, em todas as secções:
   - Só aplica uma chave se ela existir e tiver a forma esperada.
   - Se uma secção ou um item não condizer com a página, essa parte
     fica exatamente como está — nunca apaga nem deixa a página em branco.
   - Cada secção corre dentro do seu próprio try/catch, para uma falha
     numa secção nunca impedir as outras.
   - A aplicação é idempotente: correr duas vezes dá o mesmo resultado.
   Porque há uma segunda passagem: a página tem hidratação React, que
   pode voltar a desenhar uma secção depois da primeira passagem. A
   segunda passagem (1,2 s depois do carregamento) repõe os valores do
   painel nesse caso, sem mudar nada se já estiverem certos. */
(function () {
  "use strict";

  function load(key) {
    try {
      var raw = window.localStorage.getItem(key);
      if (!raw) return null;
      var v = JSON.parse(raw);
      return v == null ? null : v;
    } catch (e) { return null; }
  }
  function isStr(v) { return typeof v === "string" && v.trim() !== ""; }
  function isObj(v) { return v !== null && typeof v === "object" && !Array.isArray(v); }
  function fmtMT(n) {
    var num = Number(n);
    if (!isFinite(num)) return null;
    /* Mesmo formato do site: ponto como separador de milhares. */
    return num.toLocaleString("pt-PT").replace(/[,\s]/g, ".").replace(/\.00$/, "") + " MT";
  }
  function renderPrice(priceEl, item) {
    /* Preserva o bloco de preço desenhado de servicos.html: etiqueta
       pequena + montante grande em verde-lima + unidade. Nunca pôr
       o preço como texto simples, senão o desenho desaparece. */
    var num = Number(item.price);
    if (!isFinite(num)) return;
    var amount = num.toLocaleString("pt-PT").replace(/[,\s]/g, ".");
    var unit = item.monthly ? "MT/mês" : "MT";
    var label = priceEl.querySelector(".price-label");
    if (!label) {
      label = document.createElement("span");
      label.className = "price-label";
      priceEl.appendChild(label);
    }
    label.textContent = "A partir de";
    var amt = priceEl.querySelector(".price-amount");
    if (!amt) {
      amt = document.createElement("span");
      amt.className = "price-amount";
      priceEl.appendChild(amt);
    }
    /* Limpa o montante e repõe só a unidade, para não acumular texto. */
    while (amt.firstChild) amt.removeChild(amt.firstChild);
    amt.appendChild(document.createTextNode(amount + " "));
    var u = document.createElement("span");
    u.className = "price-unit";
    u.textContent = unit;
    amt.appendChild(u);
    /* Remove qualquer texto simples solto que uma versão anterior
       tenha deixado dentro do bloco de preço. */
    Array.prototype.slice.call(priceEl.childNodes).forEach(function (node) {
      if (node.nodeType === 3 && node.textContent.trim() !== "") {
        priceEl.removeChild(node);
      }
    });
  }
  function isVideo(item) {
    if (!item || !item.src) return false;
    if (item.kind === "video") return true;
    if (/^data:video\//i.test(item.src)) return true;
    return /\.mp4(\?|$)/i.test(item.src);
  }
  function makeImg(src, alt, cls) {
    var img = document.createElement("img");
    if (cls) img.className = cls;
    img.src = src;
    img.alt = alt || "";
    img.loading = "lazy";
    img.decoding = "async";
    return img;
  }

  /* ---------- mira_admin_settings: título e hero ---------- */
  function applySettings() {
    var s = load("mira_admin_settings");
    if (!isObj(s)) return;
    if (isStr(s.siteTitle)) { document.title = s.siteTitle; }
    if (isStr(s.hero)) {
      var hero = document.querySelector("#intro img");
      if (hero) hero.src = s.hero;
    }
  }

  /* ---------- mira_admin_logos: faixa de logos ---------- */
  function applyLogos() {
    var list = load("mira_admin_logos");
    if (!Array.isArray(list)) return;
    var valid = list.filter(function (l) { return isObj(l) && isStr(l.src); });
    if (!valid.length) return;
    var groups = document.querySelectorAll(".mira-logos-group");
    if (!groups.length) return;
    Array.prototype.forEach.call(groups, function (group) {
      while (group.firstChild) group.removeChild(group.firstChild);
      valid.forEach(function (l) {
        group.appendChild(makeImg(l.src, l.name || "", "mira-logo"));
      });
    });
  }

  /* ---------- mira_admin_marquee: imagens de Trabalhos ---------- */
  function applyMarquee() {
    var list = load("mira_admin_marquee");
    if (!Array.isArray(list)) return;
    var valid = list.filter(function (m) { return isObj(m) && isStr(m.src); });
    if (!valid.length) return;
    var groups = document.querySelectorAll(".mira-trabalhos-group");
    if (!groups.length) return;
    Array.prototype.forEach.call(groups, function (group) {
      while (group.firstChild) group.removeChild(group.firstChild);
      valid.forEach(function (m) {
        group.appendChild(makeImg(m.src, m.name || "", ""));
      });
    });
  }

  /* ---------- mira_admin_brands: faixa de marcas ---------- */
  function applyBrands() {
    var list = load("mira_admin_brands");
    if (!Array.isArray(list)) return;
    var valid = list.filter(function (b) { return isStr(b); });
    if (!valid.length) return;
    var groups = document.querySelectorAll(".mira-brands-group");
    if (!groups.length) return;
    /* Cada grupo original já traz a lista duas vezes, para o loop
       contínuo não ter salto. Mantém-se essa estrutura. */
    Array.prototype.forEach.call(groups, function (group) {
      while (group.firstChild) group.removeChild(group.firstChild);
      for (var rep = 0; rep < 2; rep++) {
        valid.forEach(function (b) {
          var span = document.createElement("span");
          span.className = "mira-brand";
          span.textContent = b;
          group.appendChild(span);
        });
      }
    });
  }

  /* ---------- mira_admin_fazemos: cartões de O que fazemos ---------- */
  function applyFazemos() {
    var list = load("mira_admin_fazemos");
    if (!Array.isArray(list)) return;
    var valid = list.filter(function (c) {
      return isObj(c) && isStr(c.title) && isStr(c.src);
    });
    if (!valid.length) return;
    var grid = document.querySelector("#fazemos .mira-work-grid");
    if (!grid) return;
    while (grid.firstChild) grid.removeChild(grid.firstChild);
    valid.forEach(function (c) {
      var card = document.createElement("article");
      card.className = "mira-work-card mira-fazemos-card";
      var media;
      if (isVideo(c)) {
        media = document.createElement("video");
        media.src = c.src;
        media.autoplay = true;
        media.muted = true;
        media.loop = true;
        media.playsInline = true;
        media.preload = "metadata";
        media.setAttribute("aria-label", c.title);
      } else {
        media = makeImg(c.src, c.title, "");
      }
      card.appendChild(media);
      var type = document.createElement("p");
      type.className = "mira-work-type";
      type.textContent = c.type || "";
      card.appendChild(type);
      var title = document.createElement("h3");
      title.textContent = c.title;
      card.appendChild(title);
      var desc = document.createElement("p");
      desc.textContent = c.desc || "";
      card.appendChild(desc);
      grid.appendChild(card);
    });
  }

  /* ---------- mira_admin_texts: textos de Sobre e de O que fazemos ---------- */
  function applyTexts() {
    var t = load("mira_admin_texts");
    if (!isObj(t)) return;
    if (isStr(t.aboutHeading)) {
      var h = document.querySelector("#about .about-title");
      if (h) h.textContent = t.aboutHeading;
    }
    if (isStr(t.aboutText)) {
      var p = document.querySelector("#about .about-belief");
      if (p) p.textContent = t.aboutText;
    }
    if (isStr(t.servicesIntro)) {
      var intro = document.querySelector("#fazemos > p");
      if (intro) intro.textContent = t.servicesIntro;
    }
  }

  /* ---------- mira_admin_contact: título de Contacto ---------- */
  function applyContact() {
    var c = load("mira_admin_contact");
    if (!isObj(c) || !isStr(c.heading)) return;
    var heading = document.querySelector("#contact .contact-heading");
    if (!heading) return;
    var accent = heading.querySelector(".claim-accent");
    if (accent) {
      /* Preserva o acento colorido: última palavra vai para o span,
         o resto fica como texto antes dele. */
      var words = c.heading.trim().split(/\s+/);
      var last = words.pop();
      Array.prototype.slice.call(heading.childNodes).forEach(function (node) {
        if (node.nodeType === 3) heading.removeChild(node);
      });
      heading.insertBefore(document.createTextNode(words.join(" ") + " "), accent);
      accent.textContent = last;
    } else {
      heading.textContent = c.heading;
    }
    /* Nota: mira_admin_contact.whatsapp e .note NÃO têm elemento
       correspondente na página pública (não há botão de WhatsApp nem
       zona de nota em #contact), por isso não são aplicados aqui e
       nenhum elemento novo é criado para os mostrar. */
  }

  /* ---------- mira_admin_services: preços em servicos.html ----------
     Na página inicial não há elementos de preço, por isso esta secção
     aí não faz nada. Em servicos.html, cada .service tem h2 (nome),
     um <p> de descrição e um <p class="price">. */
  function applyServices() {
    var list = load("mira_admin_services");
    if (!Array.isArray(list)) return;
    var valid = list.filter(function (s) { return isObj(s) && isStr(s.name); });
    if (!valid.length) return;
    var sections = document.querySelectorAll(".service");
    if (!sections.length) return;
    var byName = {};
    valid.forEach(function (s) {
      byName[s.name.trim().toLowerCase()] = s;
    });
    Array.prototype.forEach.call(sections, function (sec, idx) {
      var nameEl = sec.querySelector("h2");
      if (!nameEl) return;
      var item = byName[nameEl.textContent.trim().toLowerCase()];
      /* Se o nome foi mudado no painel e já não condiz, só se usa a
         posição quando as contagens são iguais; senão, deixa-se a
         secção exatamente como está. */
      if (!item && valid.length === sections.length) item = valid[idx];
      if (!item) return;
      if (isStr(item.name)) nameEl.textContent = item.name;
      var descEl = sec.querySelector("p:not(.price)");
      if (descEl && typeof item.desc === "string") descEl.textContent = item.desc;
      var priceEl = sec.querySelector(".price");
      if (priceEl) {
        renderPrice(priceEl, item);
      }
    });
    /* Não se adicionam nem removem secções de serviço: uma lista do
       painel com outro tamanho fica por aplicar nessa diferença. */
  }

  function applyAll() {
    var steps = [applySettings, applyLogos, applyMarquee, applyBrands,
      applyFazemos, applyTexts, applyContact, applyServices];
    steps.forEach(function (fn) {
      try { fn(); } catch (e) { /* uma secção nunca trava as outras */ }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyAll);
  } else {
    applyAll();
  }
  /* Segunda passagem de segurança contra a hidratação React: ver o
     comentário no topo do ficheiro. */
  window.addEventListener("load", function () {
    setTimeout(applyAll, 1200);
  });
})();
