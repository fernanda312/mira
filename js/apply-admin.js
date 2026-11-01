/* MIRA — aplica no site público o que o comprador guarda no painel.
   Lê APENAS as chaves que js/admin.js grava em localStorage.
   Não inventa nenhum contacto, email ou número: um mailto só aparece quando o comprador preencheu um email no painel.
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

  /* ---------- mira_admin_settings: título, hero e vídeo de fundo ---------- */
  function applySettings() {
    var s = load("mira_admin_settings");
    if (!isObj(s)) return;
    if (isStr(s.siteTitle)) { document.title = s.siteTitle; }
    if (isStr(s.hero)) {
      var hero = document.querySelector("#intro img");
      if (hero) hero.src = s.hero;
    }
    if (isStr(s.bgVideo)) {
      /* Só troca quando muda, para a segunda passagem não reiniciar o vídeo. */
      document.querySelectorAll(".mira-bg-video").forEach(function (v) {
        if (v.getAttribute("src") !== s.bgVideo) {
          v.setAttribute("src", s.bgVideo);
          try { v.load(); } catch (e) { /* vídeo antigo continua */ }
        }
      });
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

  /* ---------- mira_admin_about_photos: fotos do Sobre ---------- */
  function applyAboutPhotos() {
    var list = load("mira_admin_about_photos");
    if (!Array.isArray(list) || list.length < 3) return;
    var srcs = list.map(function (p) { return isObj(p) && isStr(p.src) ? p.src : null; });
    if (!srcs[0] || !srcs[1] || !srcs[2]) return;
    /* Mãos do Sobre, por ordem: direita, esquerda, topo. */
    var hand = document.querySelectorAll("#about .about-hand img");
    if (hand.length >= 3) {
      hand[0].src = srcs[0];
      hand[1].src = srcs[1];
      hand[2].src = srcs[2];
    }
    var figure = document.querySelector("#about .mira-sobre-figure img");
    if (figure) figure.src = srcs[2];
    /* Janela de fotografias do estúdio, só se já estiver aberta no DOM:
       a janela é criada ao clicar, por isso aqui só se troca se existir. */
    var lightbox = document.querySelectorAll(".mira-fallback-lightbox img");
    if (lightbox.length >= 2) {
      lightbox[0].src = srcs[0];
      lightbox[1].src = srcs[2];
    }
  }

  /* ---------- mira_admin_details: Pormenores ---------- */
  function applyDetails() {
    var d = load("mira_admin_details");
    if (!isObj(d)) return;
    if (isStr(d.title)) {
      var h = document.querySelector("#play .project-title");
      if (h) h.textContent = d.title;
    }
    if (!Array.isArray(d.items)) return;
    var items = document.querySelectorAll("#play .mira-details li");
    if (items.length !== d.items.length) return;
    items.forEach(function (li, i) {
      var item = d.items[i];
      if (!isObj(item)) return;
      var strong = li.querySelector("strong");
      var desc = li.querySelector("p");
      if (strong && isStr(item.title)) strong.textContent = item.title;
      if (desc && typeof item.desc === "string") desc.textContent = item.desc;
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
    if (isStr(t.aboutMore)) {
      var more = document.querySelector("#about .about-more");
      if (more) more.textContent = t.aboutMore;
    }
    if (Array.isArray(t.percurso)) {
      /* Lista não compacta do Percurso: a lista compacta de Serviços
         é tratada em applyHomeServices, não aqui. */
      var all = document.querySelectorAll("#resume .resume-summary-list");
      var percursoList = null;
      all.forEach(function (ol) {
        if (!percursoList && !ol.classList.contains("resume-summary-list--tight")) percursoList = ol;
      });
      if (percursoList) {
        var roles = percursoList.querySelectorAll(".resume-entry-role");
        if (roles.length === t.percurso.length) {
          roles.forEach(function (role, i) {
            if (isStr(t.percurso[i])) role.textContent = t.percurso[i];
          });
        }
      }
    }
    if (isStr(t.quote)) {
      var quote = document.querySelector("#about .about-quote p");
      if (quote) quote.textContent = t.quote;
    }
    if (isStr(t.attribution)) {
      var attrib = document.querySelector("#about .about-attribution");
      if (attrib) attrib.textContent = t.attribution;
    }
  }

  /* ---------- mira_admin_contact: título e redes de Contacto ----------
     Redes: só se aplica o que o comprador preencheu no painel. Um email
     só vira mailto quando está preenchido e tem @; nunca se inventa
     nenhum email, telefone ou ligação, e nunca se usa o email de outra
     pessoa. Sem valor preenchido, a ligação fica em #contact. */
  function applyContact() {
    var c = load("mira_admin_contact");
    if (!isObj(c)) return;
    if (isStr(c.heading)) {
      var heading = document.querySelector("#contact .contact-heading");
      if (heading) {
        var accent = heading.querySelector(".claim-accent");
        if (accent) {
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
      }
    }
    var linkedin = isStr(c.linkedin) ? c.linkedin : null;
    var x = isStr(c.x) ? c.x : null;
    var email = (isStr(c.email) && c.email.indexOf("@") > 0) ? c.email : null;
    /* Barra do topo: cada grupo de 3 botões é [email, LinkedIn, X].
       A identificação usa o rótulo do botão quando existe, e só cai
       para a posição no grupo quando o rótulo falta. */
    var rail = document.querySelectorAll(".rail-social-btn");
    rail.forEach(function (a, i) {
      var label = (a.getAttribute("aria-label") || "") + " " + (a.className || "");
      var kind;
      if (/mail|email|contacto/i.test(label)) kind = 0;
      else if (/linkedin/i.test(label)) kind = 1;
      else if (/\bX\b/i.test(a.getAttribute("aria-label") || "")) kind = 2;
      else kind = i % 3;
      if (kind === 0) { if (email) a.setAttribute("href", "mailto:" + email); }
      else if (kind === 1) { if (linkedin) a.setAttribute("href", linkedin); }
      else { if (x) a.setAttribute("href", x); }
    });
    /* Menu: só LinkedIn e X, por esta ordem. */
    var social = document.querySelectorAll(".menu-contact-social");
    if (social.length >= 1 && linkedin) social[0].setAttribute("href", linkedin);
    if (social.length >= 2 && x) social[1].setAttribute("href", x);
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
      /* Imagem/vídeo do cartão, sempre inteiro (object-fit: contain já
         está no CSS da página de Serviços: sem zoom, sem corte). */
      var media = sec.querySelector(".media");
      if (media && isStr(item.img)) {
        if (isVideo(item)) {
          media.innerHTML = "";
          var vid = document.createElement("video");
          vid.src = item.img;
          vid.autoplay = true; vid.muted = true; vid.loop = true; vid.playsInline = true;
          vid.preload = "metadata";
          vid.setAttribute("aria-label", item.name);
          media.appendChild(vid);
        } else {
          media.innerHTML = "";
          media.appendChild(makeImg(item.img, item.name, ""));
        }
      }
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

  /* ---------- Lista de Serviços na página inicial ----------
     A lista compacta debaixo de "Serviços" no Percurso segue os nomes
     guardados no painel, por ordem. Só reconstrói se a lista existir. */
  function applyHomeServices() {
    var list = load("mira_admin_services");
    if (!Array.isArray(list)) return;
    var valid = list.filter(function (s) { return isObj(s) && isStr(s.name); });
    if (!valid.length) return;
    var ol = document.querySelector('ol[aria-labelledby="resume-education"]');
    if (!ol) return;
    while (ol.firstChild) ol.removeChild(ol.firstChild);
    valid.forEach(function (item) {
      var li = document.createElement("li");
      li.className = "resume-entry";
      var role = document.createElement("p");
      role.className = "resume-entry-role";
      role.textContent = item.name;
      li.appendChild(role);
      ol.appendChild(li);
    });
  }

  /* ---------- mira_admin_menu: cartões do menu e navegação ---------- */
  function applyMenu() {
    var m = load("mira_admin_menu");
    if (!isObj(m)) return;
    if (Array.isArray(m.tiles)) {
      var tiles = document.querySelectorAll(".menu-tile");
      if (tiles.length === m.tiles.length) {
        tiles.forEach(function (tile, i) {
          var item = m.tiles[i];
          if (!isObj(item)) return;
          var img = tile.querySelector("img");
          if (img && isStr(item.src)) img.src = item.src;
          var title = tile.querySelector(".menu-tile-title");
          if (title && isStr(item.title)) title.textContent = item.title;
        });
      }
    }
    if (Array.isArray(m.nav)) {
      var nav = document.querySelectorAll(".site-nav a");
      if (nav.length === m.nav.length) {
        nav.forEach(function (a, i) {
          if (isStr(m.nav[i])) a.textContent = m.nav[i];
        });
      }
    }
  }

  function applyAll() {
    var steps = [applySettings, applyLogos, applyMarquee, applyBrands,
      applyFazemos, applyAboutPhotos, applyDetails, applyTexts, applyContact,
      applyServices, applyHomeServices, applyMenu];
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
