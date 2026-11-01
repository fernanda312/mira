/* MIRA Admin — guarda tudo neste navegador (localStorage).
   Imagens por ficheiro viram data URLs e ficam no localStorage.
   Nota de limite: o localStorage tem cerca de 5 MB no total. Por isso,
   usa imagens até 2 MB e evita dezenas de imagens grandes ao mesmo tempo.
   Para uso ao vivo em vários dispositivos, trocar isto por Supabase
   (tabelas + bucket + Auth) — ver a secção Início do painel. */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var clone = function (v) { return JSON.parse(JSON.stringify(v)); };
  var load = function (key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return clone(fallback);
      var v = JSON.parse(raw);
      return v == null ? clone(fallback) : v;
    } catch (e) { return clone(fallback); }
  };
  var saveKey = function (key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      toast("Guardado.");
      return true;
    } catch (e) {
      toast("Não coube no armazenamento do navegador. Usa imagens mais pequenas.");
      return false;
    }
  };
  var toastTimer = null;
  function toast(msg) {
    var t = $("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2600);
  }
  function readFile(file, cb) {
    if (!file) { cb(null); return; }
    if (file.size > 2 * 1024 * 1024) {
      toast("Ficheiro demasiado grande (máximo 2 MB). Escolhe um ficheiro mais pequeno.");
      cb(null); return;
    }
    var r = new FileReader();
    r.onload = function () { cb(String(r.result)); };
    r.onerror = function () { toast("Não consegui ler esse ficheiro."); cb(null); };
    r.readAsDataURL(file);
  }

  /* ---------- Valores iniciais (os mesmos do site atual) ---------- */
  var DEFAULTS = {
    settings: { siteTitle: "MIRA — Estúdio de Design", hero: "images/mira-hero-mira-ext.jpg" },
    logos: [
      { name: "sync", src: "images/logos/logo-sync.png" },
      { name: "CA", src: "images/logos/logo-ca.png" },
      { name: "mormedia", src: "images/logos/logo-mormedia.png" },
      { name: "UNCANE", src: "images/logos/logo-uncane.png" },
      { name: "area.lab", src: "images/logos/logo-arealab.png" },
      { name: "niche", src: "images/logos/logo-niche.png" },
      { name: "drew", src: "images/logos/logo-drew.png" }
    ],
    marquee: [
      { name: "UN:LEASH", src: "images/trabalho-unleash.jpg" },
      { name: "Birds", src: "images/trabalho-birds.jpg" },
      { name: "Diet Coke", src: "images/trabalho-dietcoke.jpg" },
      { name: "M-HOME", src: "images/trabalho-mhome.jpg" },
      { name: "DARKMATTER", src: "images/trabalho-darkmatter.jpg" }
    ],
    brands: ["MIRA", "Design gráfico", "Livraria", "Papelaria", "Impressões", "Edição e publicação", "Material escolar"],
    fazemos: [
      { type: "LIVRARIA", title: "Livraria", desc: "Livros e leitura, com espaço para descobrir.", src: "media/mira-video-3.mp4", kind: "video" },
      { type: "EDIÇÃO E PUBLICAÇÃO", title: "Edição e publicação de livros", desc: "Do manuscrito ao livro, com design gráfico e impressões cuidadas.", src: "media/mira-video-1.mp4", kind: "video" },
      { type: "PAPELARIA", title: "Papelaria", desc: "Papelaria de todos os dias, com design gráfico e impressões próprias.", src: "media/mira-video-2.mp4", kind: "video" },
      { type: "PAPELARIA", title: "Papelaria", desc: "Cadernos e papelaria, simples e bem feitos.", src: "images/mira-cadernos.jpg", kind: "image" },
      { type: "MATERIAL ESCOLAR", title: "Material escolar", desc: "Material escolar para a escola e para casa.", src: "images/mira-material.jpg", kind: "image" },
      { type: "MATERIAL ESCOLAR", title: "Material escolar", desc: "Mochilas e material escolar para o novo ano.", src: "images/mira-mochila.jpg", kind: "image" }
    ],
    texts: {
      aboutHeading: "Desenhamos, ouvimos e simplificamos.",
      aboutText: "Questionamos o pedido até encontrar o problema por baixo dele. Depois desenhamos com pouco, mas bem feito: marca, produto e site, sem ruído.",
      servicesIntro: "Design gráfico, livraria, papelaria, impressões, edição e publicação de livros e material escolar — tudo com o mesmo cuidado."
    },
    services: [
      { name: "Identidade de marca", desc: "Uma marca clara, que se reconhece à primeira vista.", price: 25000, monthly: false },
      { name: "Produto digital", desc: "Uma aplicação simples de usar, do primeiro ecrã ao último.", price: 30000, monthly: false },
      { name: "Websites", desc: "Um site limpo, rápido de ler e fácil de navegar.", price: 35000, monthly: false },
      { name: "Editorial", desc: "Páginas com espaço para respirar e uma história para contar.", price: 18000, monthly: false },
      { name: "Embalagem", desc: "Embalagens que mostram o produto e a marca.", price: 15000, monthly: false },
      { name: "Redes sociais", desc: "Conteúdos e imagens para as redes do negócio.", price: 12000, monthly: false },
      { name: "Catálogo", desc: "Catálogos organizados, prontos a mostrar e a vender.", price: 20000, monthly: false },
      { name: "Livraria", desc: "Livros e leitura, com espaço para descobrir.", price: 10000, monthly: false },
      { name: "Edição e publicação de livros", desc: "Do manuscrito ao livro, com design gráfico e impressões cuidadas.", price: 22000, monthly: false },
      { name: "Papelaria", desc: "Papelaria de todos os dias, com design gráfico e impressões próprias.", price: 8000, monthly: false },
      { name: "Material escolar", desc: "Material escolar para a escola e para casa.", price: 9000, monthly: false },
      { name: "Direcção de arte", desc: "Direcção de arte para marca, produto e site, em conjunto.", price: 20000, monthly: false },
      { name: "Acompanhamento e evolução do site", desc: "Depois de entregar, acompanhamos o uso e ajustamos o que for preciso.", price: 10000, monthly: true }
    ],
    contact: { heading: "O resto da história é uma conversa.", whatsapp: "", note: "" },
    orders: [],
    clients: [],
    visitors: [
      { page: "Início", count: 0 },
      { page: "Serviços", count: 0 }
    ]
  };
  var S = {
    settings: load("mira_admin_settings", DEFAULTS.settings),
    logos: load("mira_admin_logos", DEFAULTS.logos),
    marquee: load("mira_admin_marquee", DEFAULTS.marquee),
    brands: load("mira_admin_brands", DEFAULTS.brands),
    fazemos: load("mira_admin_fazemos", DEFAULTS.fazemos),
    texts: load("mira_admin_texts", DEFAULTS.texts),
    services: load("mira_admin_services", DEFAULTS.services),
    contact: load("mira_admin_contact", DEFAULTS.contact),
    orders: load("mira_admin_orders", DEFAULTS.orders),
    clients: load("mira_admin_clients", DEFAULTS.clients),
    visitors: load("mira_admin_visitors", DEFAULTS.visitors)
  };
  var chatMessages = function () { return load("mira_chat_messages", []); };
  var chatReplies = function () { return load("mira_chat_replies", {}); };
  var fmtMT = function (n) {
    return Number(n || 0).toLocaleString("pt-PT").replace(/,/g, " ") + " MT";
  };
  var mediaTag = function (item, cls) {
    if (!item || !item.src) return "<span>Sem ficheiro</span>";
    if (item.kind === "video" || /\.mp4(\?|$)/i.test(item.src)) {
      return '<video class="' + cls + '" src="' + esc(item.src) + '" muted loop playsinline preload="metadata"></video>';
    }
    return '<img class="' + cls + '" src="' + esc(item.src) + '" alt="' + esc(item.name || item.title || "") + '">';
  };

  /* ---------- Navegação e entrada ---------- */
  function showSection(id) {
    document.querySelectorAll(".panel").forEach(function (p) { p.hidden = true; });
    var sec = $("sec-" + id);
    if (sec) sec.hidden = false;
    document.querySelectorAll(".tab-btn").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-sec") === id);
    });
    renderSummary();
  }
  function renderSummary() {
    var el = $("summary");
    if (!el) return;
    var msgs = chatMessages();
    var fresh = msgs.filter(function (m) { return !chatReplies()[String(m.id)]; }).length;
    el.innerHTML =
      "<span>" + S.logos.length + " logos</span>" +
      "<span>" + S.marquee.length + " imagens em Trabalhos</span>" +
      "<span>" + S.services.length + " serviços</span>" +
      "<span>" + S.fazemos.length + " cartões em O que fazemos</span>" +
      "<span>" + S.orders.length + " pedidos</span>" +
      "<span>" + S.clients.length + " clientes</span>" +
      "<span>" + fresh + " chats por responder</span>";
  }
  document.querySelectorAll(".tab-btn").forEach(function (b) {
    b.addEventListener("click", function () { showSection(b.getAttribute("data-sec")); });
  });
  $("gateForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var email = $("adminEmail").value.trim();
    if (!email || email.indexOf("@") < 1) { toast("Escreve um email válido."); return; }
    sessionStorage.setItem("mira_admin_session", JSON.stringify({ email: email, at: new Date().toISOString() }));
    startApp(email);
    toast("Bem-vindo ao painel.");
  });
  $("logoutBtn").addEventListener("click", function () {
    sessionStorage.removeItem("mira_admin_session");
    $("app").hidden = true;
    $("topbarActions").hidden = true;
    $("gate").hidden = false;
  });
  function startApp(email) {
    $("gate").hidden = true;
    $("app").hidden = false;
    $("topbarActions").hidden = false;
    $("sessionEmail").textContent = email;
    fillLogoHero(); fillTexts(); fillContact();
    renderLogos(); renderMarquee(); renderBrands(); renderFazemos(); renderServices();
    renderChats(); renderOrders(); renderClients(); renderVisitors();
    showSection("inicio");
  }

  /* ---------- Logo e Hero ---------- */
  var pendingHero = null;
  function fillLogoHero() {
    $("siteTitle").value = S.settings.siteTitle || "";
    $("heroPreview").src = pendingHero || S.settings.hero || "";
  }
  $("heroFile").addEventListener("change", function () {
    readFile(this.files[0], function (url) {
      if (url) { pendingHero = url; $("heroPreview").src = url; }
    });
  });
  $("logoHeroForm").addEventListener("submit", function (e) {
    e.preventDefault();
    S.settings.siteTitle = $("siteTitle").value.trim() || S.settings.siteTitle;
    if (pendingHero) S.settings.hero = pendingHero;
    pendingHero = null;
    saveKey("mira_admin_settings", S.settings);
  });

  /* ---------- Logos ---------- */
  function renderLogos() {
    var el = $("logosTable");
    if (!S.logos.length) { el.innerHTML = '<p class="empty">Ainda não há logos. Adiciona a primeira logo em baixo.</p>'; return; }
    var rows = S.logos.map(function (l, i) {
      return "<tr><td>" + esc(l.name) + "</td><td>" + mediaTag(l, "thumb") + "</td>" +
        '<td><label class="btn btn-small">Trocar ficheiro<input type="file" accept="image/*" hidden data-logo-replace="' + i + '"></label> ' +
        '<button class="btn btn-small btn-danger" type="button" data-logo-del="' + i + '">Remover</button></td></tr>';
    }).join("");
    el.innerHTML = '<div class="table-wrap"><table><thead><tr><th>Nome</th><th>Pré-visualização</th><th>Ações</th></tr></thead><tbody>' + rows + "</tbody></table></div>";
    el.querySelectorAll("[data-logo-replace]").forEach(function (input) {
      input.addEventListener("change", function () {
        var idx = Number(input.getAttribute("data-logo-replace"));
        readFile(input.files[0], function (url) {
          if (!url) return;
          S.logos[idx].src = url;
          if (saveKey("mira_admin_logos", S.logos)) renderLogos();
        });
      });
    });
    el.querySelectorAll("[data-logo-del]").forEach(function (b) {
      b.addEventListener("click", function () {
        var idx = Number(b.getAttribute("data-logo-del"));
        if (!confirm("Remover a logo “" + S.logos[idx].name + "”?")) return;
        S.logos.splice(idx, 1);
        if (saveKey("mira_admin_logos", S.logos)) renderLogos();
      });
    });
  }
  $("logoAddForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var name = $("logoAddName").value.trim();
    readFile($("logoAddFile").files[0], function (url) {
      if (!url) { toast("Escolhe um ficheiro de imagem."); return; }
      S.logos.push({ name: name, src: url });
      if (saveKey("mira_admin_logos", S.logos)) { renderLogos(); e.target.reset(); }
    });
  });

  /* ---------- Trabalhos (marquee) ---------- */
  function renderMarquee() {
    var el = $("marqueeTable");
    if (!S.marquee.length) { el.innerHTML = '<p class="empty">Ainda não há imagens em Trabalhos. Adiciona a primeira em baixo.</p>'; return; }
    var rows = S.marquee.map(function (m, i) {
      return "<tr><td>" + (i + 1) + "</td><td>" + esc(m.name) + "</td><td>" + mediaTag(m, "thumb") + "</td>" +
        '<td><button class="btn btn-small" type="button" data-mq-up="' + i + '">↑ Subir</button> ' +
        '<button class="btn btn-small" type="button" data-mq-down="' + i + '">↓ Descer</button> ' +
        '<label class="btn btn-small">Trocar ficheiro<input type="file" accept="image/*" hidden data-mq-replace="' + i + '"></label> ' +
        '<button class="btn btn-small btn-danger" type="button" data-mq-del="' + i + '">Remover</button></td></tr>';
    }).join("");
    el.innerHTML = '<div class="table-wrap"><table><thead><tr><th>#</th><th>Nome</th><th>Pré-visualização</th><th>Ações</th></tr></thead><tbody>' + rows + "</tbody></table></div>";
    var move = function (i, dir) {
      var j = i + dir;
      if (j < 0 || j >= S.marquee.length) return;
      var tmp = S.marquee[i]; S.marquee[i] = S.marquee[j]; S.marquee[j] = tmp;
      if (saveKey("mira_admin_marquee", S.marquee)) renderMarquee();
    };
    el.querySelectorAll("[data-mq-up]").forEach(function (b) { b.addEventListener("click", function () { move(Number(b.getAttribute("data-mq-up")), -1); }); });
    el.querySelectorAll("[data-mq-down]").forEach(function (b) { b.addEventListener("click", function () { move(Number(b.getAttribute("data-mq-down")), 1); }); });
    el.querySelectorAll("[data-mq-replace]").forEach(function (input) {
      input.addEventListener("change", function () {
        var idx = Number(input.getAttribute("data-mq-replace"));
        readFile(input.files[0], function (url) {
          if (!url) return;
          S.marquee[idx].src = url;
          if (saveKey("mira_admin_marquee", S.marquee)) renderMarquee();
        });
      });
    });
    el.querySelectorAll("[data-mq-del]").forEach(function (b) {
      b.addEventListener("click", function () {
        var idx = Number(b.getAttribute("data-mq-del"));
        if (!confirm("Remover a imagem “" + S.marquee[idx].name + "”?")) return;
        S.marquee.splice(idx, 1);
        if (saveKey("mira_admin_marquee", S.marquee)) renderMarquee();
      });
    });
  }
  $("marqueeAddForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var name = $("marqueeAddName").value.trim();
    readFile($("marqueeAddFile").files[0], function (url) {
      if (!url) { toast("Escolhe um ficheiro de imagem."); return; }
      S.marquee.push({ name: name, src: url });
      if (saveKey("mira_admin_marquee", S.marquee)) { renderMarquee(); e.target.reset(); }
    });
  });

  /* ---------- Faixa de marcas ---------- */
  function renderBrands() {
    $("brandsList").innerHTML = S.brands.map(function (b, i) {
      return '<label>Linha ' + (i + 1) + ' <span style="display:flex;gap:.5rem;"><input type="text" data-brand="' + i + '" value="' + esc(b) + '"> ' +
        '<button class="btn btn-small btn-danger" type="button" data-brand-del="' + i + '">Remover</button></span></label>';
    }).join("");
    $("brandsList").querySelectorAll("[data-brand-del]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        S.brands.splice(Number(btn.getAttribute("data-brand-del")), 1);
        renderBrands();
      });
    });
  }
  $("brandAddBtn").addEventListener("click", function () { S.brands.push("Nova linha"); renderBrands(); });
  $("brandsForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var vals = [];
    $("brandsList").querySelectorAll("[data-brand]").forEach(function (input) {
      var v = input.value.trim();
      if (v) vals.push(v);
    });
    S.brands = vals;
    if (saveKey("mira_admin_brands", S.brands)) renderBrands();
  });

  /* ---------- O que fazemos ---------- */
  function renderFazemos() {
    var el = $("fazemosTable");
    if (!S.fazemos.length) { el.innerHTML = '<p class="empty">Ainda não há cartões. Adiciona o primeiro em baixo.</p>'; return; }
    var rows = S.fazemos.map(function (c, i) {
      return "<tr><td>" + esc(c.type) + "</td><td><strong>" + esc(c.title) + "</strong><br>" + esc(c.desc) + "</td><td>" + mediaTag(c, "thumb") + "</td>" +
        '<td><button class="btn btn-small" type="button" data-fz-edit="' + i + '">Editar texto</button> ' +
        '<label class="btn btn-small">Trocar ficheiro<input type="file" accept="image/*,video/*" hidden data-fz-replace="' + i + '"></label> ' +
        '<button class="btn btn-small btn-danger" type="button" data-fz-del="' + i + '">Remover</button></td></tr>';
    }).join("");
    el.innerHTML = '<div class="table-wrap"><table><thead><tr><th>Tipo</th><th>Título e descrição</th><th>Ficheiro</th><th>Ações</th></tr></thead><tbody>' + rows + "</tbody></table></div>";
    el.querySelectorAll("[data-fz-edit]").forEach(function (b) {
      b.addEventListener("click", function () {
        var idx = Number(b.getAttribute("data-fz-edit"));
        var c = S.fazemos[idx];
        var type = prompt("Tipo do cartão:", c.type);
        if (type === null) return;
        var title = prompt("Título do cartão:", c.title);
        if (title === null) return;
        var desc = prompt("Descrição do cartão:", c.desc);
        if (desc === null) return;
        c.type = type.trim() || c.type; c.title = title.trim() || c.title; c.desc = desc.trim() || c.desc;
        if (saveKey("mira_admin_fazemos", S.fazemos)) renderFazemos();
      });
    });
    el.querySelectorAll("[data-fz-replace]").forEach(function (input) {
      input.addEventListener("change", function () {
        var idx = Number(input.getAttribute("data-fz-replace"));
        readFile(input.files[0], function (url) {
          if (!url) return;
          S.fazemos[idx].src = url;
          S.fazemos[idx].kind = input.files[0] && input.files[0].type.indexOf("video") === 0 ? "video" : "image";
          if (saveKey("mira_admin_fazemos", S.fazemos)) renderFazemos();
        });
      });
    });
    el.querySelectorAll("[data-fz-del]").forEach(function (b) {
      b.addEventListener("click", function () {
        var idx = Number(b.getAttribute("data-fz-del"));
        if (!confirm("Remover o cartão “" + S.fazemos[idx].title + "”?")) return;
        S.fazemos.splice(idx, 1);
        if (saveKey("mira_admin_fazemos", S.fazemos)) renderFazemos();
      });
    });
  }
  $("fazemosAddForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var type = $("fazemosAddType").value.trim();
    var title = $("fazemosAddTitle").value.trim();
    var desc = $("fazemosAddDesc").value.trim();
    var file = $("fazemosAddFile").files[0];
    readFile(file, function (url) {
      if (!url) { toast("Escolhe um ficheiro de imagem ou vídeo."); return; }
      S.fazemos.push({ type: type, title: title, desc: desc, src: url, kind: file.type.indexOf("video") === 0 ? "video" : "image" });
      if (saveKey("mira_admin_fazemos", S.fazemos)) { renderFazemos(); e.target.reset(); }
    });
  });

  /* ---------- Textos, Serviços, Contacto ---------- */
  function fillTexts() {
    $("aboutHeading").value = S.texts.aboutHeading || "";
    $("aboutText").value = S.texts.aboutText || "";
    $("servicesIntro").value = S.texts.servicesIntro || "";
  }
  $("textsForm").addEventListener("submit", function (e) {
    e.preventDefault();
    S.texts.aboutHeading = $("aboutHeading").value.trim();
    S.texts.aboutText = $("aboutText").value.trim();
    S.texts.servicesIntro = $("servicesIntro").value.trim();
    saveKey("mira_admin_texts", S.texts);
  });
  function renderServices() {
    var el = $("servicesTable");
    if (!S.services.length) { el.innerHTML = '<p class="empty">Ainda não há serviços. Adiciona o primeiro em baixo.</p>'; return; }
    var rows = S.services.map(function (s, i) {
      return "<tr><td><strong>" + esc(s.name) + "</strong></td><td>" + esc(s.desc) + "</td>" +
        '<td><input type="number" min="0" step="100" value="' + Number(s.price || 0) + '" data-svc-price="' + i + '" style="width:130px;"> MT' +
        (s.monthly ? " / mês" : "") + "</td>" +
        '<td><button class="btn btn-small" type="button" data-svc-edit="' + i + '">Editar</button> ' +
        '<button class="btn btn-small btn-danger" type="button" data-svc-del="' + i + '">Remover</button></td></tr>';
    }).join("");
    el.innerHTML = '<div class="table-wrap"><table><thead><tr><th>Serviço</th><th>Descrição</th><th>Preço</th><th>Ações</th></tr></thead><tbody>' + rows + "</tbody></table></div>" +
      '<button class="btn btn-primary" type="button" id="servicesSaveBtn">Guardar preços</button>';
    el.querySelectorAll("[data-svc-edit]").forEach(function (b) {
      b.addEventListener("click", function () {
        var idx = Number(b.getAttribute("data-svc-edit"));
        var s = S.services[idx];
        var name = prompt("Nome do serviço:", s.name);
        if (name === null) return;
        var desc = prompt("Descrição do serviço:", s.desc);
        if (desc === null) return;
        s.name = name.trim() || s.name; s.desc = desc.trim() || s.desc;
        if (saveKey("mira_admin_services", S.services)) renderServices();
      });
    });
    el.querySelectorAll("[data-svc-del]").forEach(function (b) {
      b.addEventListener("click", function () {
        var idx = Number(b.getAttribute("data-svc-del"));
        if (!confirm("Remover o serviço “" + S.services[idx].name + "”?")) return;
        S.services.splice(idx, 1);
        if (saveKey("mira_admin_services", S.services)) renderServices();
      });
    });
    $("servicesSaveBtn").addEventListener("click", function () {
      el.querySelectorAll("[data-svc-price]").forEach(function (input) {
        S.services[Number(input.getAttribute("data-svc-price"))].price = Number(input.value || 0);
      });
      if (saveKey("mira_admin_services", S.services)) renderServices();
    });
  }
  $("serviceAddForm").addEventListener("submit", function (e) {
    e.preventDefault();
    S.services.push({
      name: $("serviceAddName").value.trim(),
      desc: $("serviceAddDesc").value.trim(),
      price: Number($("serviceAddPrice").value || 0),
      monthly: $("serviceAddMonthly").checked
    });
    if (saveKey("mira_admin_services", S.services)) { renderServices(); e.target.reset(); }
  });
  function fillContact() {
    $("contactHeading").value = S.contact.heading || "";
    $("whatsapp").value = S.contact.whatsapp || "";
    $("contactNote").value = S.contact.note || "";
  }
  $("contactForm").addEventListener("submit", function (e) {
    e.preventDefault();
    S.contact.heading = $("contactHeading").value.trim();
    S.contact.whatsapp = $("whatsapp").value.trim();
    S.contact.note = $("contactNote").value.trim();
    saveKey("mira_admin_contact", S.contact);
  });

  /* ---------- Chats ---------- */
  function renderChats() {
    var el = $("chatsList");
    var msgs = chatMessages();
    var replies = chatReplies();
    if (!msgs.length) {
      el.innerHTML = '<p class="empty">Ainda não há mensagens. Quando um visitante escrever no chat do site, a conversa aparece aqui. Usa o botão “Mensagem de teste” para ver como fica uma conversa antes de haver mensagens reais.</p>';
      return;
    }
    el.innerHTML = msgs.slice().reverse().map(function (m) {
      var rep = replies[String(m.id)];
      var time = m.time ? new Date(m.time).toLocaleString("pt-PT") : "";
      return '<div class="chat-box"><span class="badge ' + (rep ? "" : "new") + '">' + (rep ? "Respondida" : "Nova") + "</span> " +
        "<strong>" + esc(m.name || "Visitante") + "</strong> <span class=\"help\">" + esc(time) + "</span>" +
        '<p class="chat-msg"><span class="who">Visitante:</span> ' + esc(m.message) + "</p>" +
        (rep ? '<p class="chat-msg reply"><span class="who">Estúdio:</span> ' + esc(rep.text) + "</p>" : "") +
        '<div class="chat-reply-row"><input type="text" data-reply-input="' + m.id + '" placeholder="Escreve a resposta do estúdio…" value="' + esc(rep ? rep.text : "") + '"> ' +
        '<button class="btn btn-primary" type="button" data-reply-send="' + m.id + '">Responder</button> ' +
        '<button class="btn btn-small btn-danger" type="button" data-chat-del="' + m.id + '">Apagar conversa</button></div></div>';
    }).join("");
    el.querySelectorAll("[data-reply-send]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-reply-send");
        var input = el.querySelector('[data-reply-input="' + id + '"]');
        var text = input.value.trim();
        if (!text) { toast("Escreve primeiro a resposta."); return; }
        var r = chatReplies();
        r[id] = { text: text, time: new Date().toISOString() };
        localStorage.setItem("mira_chat_replies", JSON.stringify(r));
        toast("Resposta guardada.");
        renderChats(); renderSummary();
      });
    });
    el.querySelectorAll("[data-chat-del]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = String(b.getAttribute("data-chat-del"));
        var next = chatMessages().filter(function (m) { return String(m.id) !== id; });
        localStorage.setItem("mira_chat_messages", JSON.stringify(next));
        var r = chatReplies(); delete r[id];
        localStorage.setItem("mira_chat_replies", JSON.stringify(r));
        toast("Conversa apagada.");
        renderChats(); renderSummary();
      });
    });
  }
  $("chatTestBtn").addEventListener("click", function () {
    var msgs = chatMessages();
    msgs.push({ id: Date.now(), name: "Visitante de teste", message: "Olá! Queria saber o preço de um website.", time: new Date().toISOString(), test: true });
    localStorage.setItem("mira_chat_messages", JSON.stringify(msgs));
    toast("Mensagem de teste criada. Apaga-a quando já não precisares dela.");
    renderChats(); renderSummary();
  });
  $("chatRefreshBtn").addEventListener("click", function () { renderChats(); renderSummary(); toast("Lista atualizada."); });

  /* ---------- Pedidos, Clientes, Visitantes ---------- */
  function renderOrders() {
    var el = $("ordersTable");
    if (!S.orders.length) { el.innerHTML = '<p class="empty">Ainda não há pedidos. Adiciona o primeiro no formulário em cima.</p>'; return; }
    var rows = S.orders.map(function (o, i) {
      return "<tr><td>" + esc(o.name) + "</td><td>" + esc(o.service) + "</td><td>" + esc(o.date) + "</td>" +
        '<td><select data-order-status="' + i + '"><option value="new"' + (o.status === "new" ? " selected" : "") + ">Novo</option>" +
        '<option value="progress"' + (o.status === "progress" ? " selected" : "") + ">Em curso</option>" +
        '<option value="done"' + (o.status === "done" ? " selected" : "") + ">Concluído</option></select></td>" +
        '<td><button class="btn btn-small btn-danger" type="button" data-order-del="' + i + '">Remover</button></td></tr>';
    }).join("");
    el.innerHTML = '<div class="table-wrap"><table><thead><tr><th>Nome</th><th>Serviço</th><th>Data</th><th>Estado</th><th>Ações</th></tr></thead><tbody>' + rows + "</tbody></table></div>";
    el.querySelectorAll("[data-order-status]").forEach(function (sel) {
      sel.addEventListener("change", function () {
        S.orders[Number(sel.getAttribute("data-order-status"))].status = sel.value;
        saveKey("mira_admin_orders", S.orders);
      });
    });
    el.querySelectorAll("[data-order-del]").forEach(function (b) {
      b.addEventListener("click", function () {
        S.orders.splice(Number(b.getAttribute("data-order-del")), 1);
        if (saveKey("mira_admin_orders", S.orders)) renderOrders();
      });
    });
  }
  $("orderAddForm").addEventListener("submit", function (e) {
    e.preventDefault();
    S.orders.push({ name: $("orderAddName").value.trim(), service: $("orderAddService").value.trim(), date: $("orderAddDate").value, status: "new" });
    if (saveKey("mira_admin_orders", S.orders)) { renderOrders(); e.target.reset(); }
  });
  function renderClients() {
    var el = $("clientsTable");
    if (!S.clients.length) { el.innerHTML = '<p class="empty">Ainda não há clientes. Adiciona o primeiro no formulário em cima.</p>'; return; }
    var rows = S.clients.map(function (c, i) {
      return "<tr><td><strong>" + esc(c.name) + "</strong></td><td>" + esc(c.contact) + "</td><td>" + esc(c.notes) + "</td>" +
        '<td><button class="btn btn-small btn-danger" type="button" data-client-del="' + i + '">Remover</button></td></tr>';
    }).join("");
    el.innerHTML = '<div class="table-wrap"><table><thead><tr><th>Nome</th><th>Contacto</th><th>Notas</th><th>Ações</th></tr></thead><tbody>' + rows + "</tbody></table></div>";
    el.querySelectorAll("[data-client-del]").forEach(function (b) {
      b.addEventListener("click", function () {
        S.clients.splice(Number(b.getAttribute("data-client-del")), 1);
        if (saveKey("mira_admin_clients", S.clients)) renderClients();
      });
    });
  }
  $("clientAddForm").addEventListener("submit", function (e) {
    e.preventDefault();
    S.clients.push({ name: $("clientAddName").value.trim(), contact: $("clientAddContact").value.trim(), notes: $("clientAddNotes").value.trim() });
    if (saveKey("mira_admin_clients", S.clients)) { renderClients(); e.target.reset(); }
  });
  function renderVisitors() {
    $("visitorsList").innerHTML = S.visitors.map(function (v, i) {
      return '<label>Visitas — ' + esc(v.page) + ' <input type="number" min="0" data-visitor="' + i + '" value="' + Number(v.count || 0) + '"></label>';
    }).join("");
  }
  $("visitorsForm").addEventListener("submit", function (e) {
    e.preventDefault();
    $("visitorsList").querySelectorAll("[data-visitor]").forEach(function (input) {
      S.visitors[Number(input.getAttribute("data-visitor"))].count = Number(input.value || 0);
    });
    saveKey("mira_admin_visitors", S.visitors);
  });

  /* ---------- Exportar / Importar ---------- */
  $("exportBtn").addEventListener("click", function () {
    var out = {};
    ["mira_admin_settings", "mira_admin_logos", "mira_admin_marquee", "mira_admin_brands", "mira_admin_fazemos", "mira_admin_texts", "mira_admin_services", "mira_admin_contact", "mira_admin_orders", "mira_admin_clients", "mira_admin_visitors", "mira_chat_messages", "mira_chat_replies"].forEach(function (k) {
      var v = localStorage.getItem(k);
      if (v) { try { out[k] = JSON.parse(v); } catch (e) { /* ignora valor danificado */ } }
    });
    var blob = new Blob([JSON.stringify(out, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "mira-admin-backup.json";
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    toast("Cópia exportada.");
  });
  $("importFile").addEventListener("change", function () {
    var file = this.files[0];
    if (!file) return;
    var r = new FileReader();
    r.onload = function () {
      try {
        var data = JSON.parse(String(r.result));
        Object.keys(data).forEach(function (k) {
          if (k.indexOf("mira_admin_") === 0 || k.indexOf("mira_chat_") === 0) {
            localStorage.setItem(k, JSON.stringify(data[k]));
          }
        });
        toast("Cópia importada. A página vai recarregar.");
        setTimeout(function () { location.reload(); }, 800);
      } catch (e) { toast("Esse ficheiro não é uma cópia válida do painel."); }
    };
    r.readAsText(file);
  });

  /* ---------- Arranque ---------- */
  (function init() {
    var raw = null;
    try { raw = sessionStorage.getItem("mira_admin_session"); } catch (e) { raw = null; }
    if (raw) {
      try {
        var sess = JSON.parse(raw);
        if (sess && sess.email) { startApp(sess.email); return; }
      } catch (e) { /* sessão danificada: volta ao acesso */ }
    }
    $("gate").hidden = false;
    $("app").hidden = true;
    $("topbarActions").hidden = true;
  })();
})();
