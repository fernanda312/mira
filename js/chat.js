/* MIRA Chat — botão e painel de chat do site.
   COMO LIGAR AO SITE (passo único, a fazer depois, sem mexer no resto):
   - Junta esta linha mesmo antes de </body> na página do site:
       <script src="js/chat.js" defer></script>
   - Não é preciso mais nada: o botão aparece sozinho no canto inferior direito.
   COMO FUNCIONA:
   - O visitante escreve o nome e a mensagem e carrega em Enviar.
   - A mensagem fica guardada neste navegador em localStorage, na chave
     mira_chat_messages, com nome, mensagem e hora.
   - As respostas do estúdio, escritas no painel de administração, ficam em
     mira_chat_replies e aparecem na conversa como resposta do estúdio.
   - Para mensagens ao vivo entre vários dispositivos é preciso o Supabase
     (ver o painel de administração, secção Início). Até lá, as mensagens
     vivem no navegador de quem escreveu.
   - Não há nenhum email, número ou contacto inventado neste ficheiro. */
(function () {
  "use strict";
  var MSG_KEY = "mira_chat_messages";
  var REP_KEY = "mira_chat_replies";
  function load(key, fallback) {
    try {
      var v = JSON.parse(localStorage.getItem(key) || "");
      return v == null ? fallback : v;
    } catch (e) { return fallback; }
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function render(list) {
    var msgs = load(MSG_KEY, []);
    var reps = load(REP_KEY, {});
    if (!msgs.length) {
      list.innerHTML = '<p style="color:#bdbdbd;">Olá! Escreve a tua mensagem e o estúdio responde aqui.</p>';
      return;
    }
    list.innerHTML = msgs.map(function (m) {
      var rep = reps[String(m.id)];
      var time = m.time ? new Date(m.time).toLocaleString("pt-PT") : "";
      return '<div style="margin:.6rem 0;"><strong>' + esc(m.name || "Visitante") + '</strong> ' +
        '<span style="color:#bdbdbd;font-size:.85rem;">' + esc(time) + '</span>' +
        '<p style="margin:.2rem 0;">' + esc(m.message) + '</p>' +
        (rep ? '<p style="margin:.2rem 0 0 1rem;"><strong>Estúdio:</strong> ' + esc(rep.text) + '</p>' : "") + '</div>';
    }).join("");
    list.scrollTop = list.scrollHeight;
  }
  function init() {
    var style = document.createElement("style");
    style.textContent =
      "#mira-chat-btn{position:fixed;right:1rem;bottom:1rem;z-index:9999;background:#0b3d2e;color:#fff;border:1px solid #0b3d2e;border-radius:999px;padding:.8rem 1.4rem;font:700 1rem Inter,system-ui,sans-serif;cursor:pointer;box-shadow:0 8px 30px rgba(0,0,0,.5);}" +
      "#mira-chat-btn:hover{background:#145a44;}" +
      "#mira-chat-panel{position:fixed;right:1rem;bottom:4.5rem;z-index:9999;width:min(360px,92vw);background:#121212;color:#fff;border:1px solid #2b2b2b;border-radius:16px;padding:1rem;font:1rem Inter,system-ui,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.6);}" +
      "#mira-chat-list{max-height:280px;overflow-y:auto;margin:.5rem 0;}" +
      "#mira-chat-panel input,#mira-chat-panel textarea{width:100%;background:#000;color:#fff;border:1px solid #2b2b2b;border-radius:10px;padding:.6rem .8rem;font:inherit;margin:.3rem 0;box-sizing:border-box;}" +
      "#mira-chat-send{background:#0b3d2e;color:#fff;border:1px solid #0b3d2e;border-radius:999px;padding:.65rem 1.3rem;font:700 1rem Inter,system-ui,sans-serif;cursor:pointer;width:100%;}" +
      "#mira-chat-send:hover{background:#145a44;}";
    document.head.appendChild(style);

    var btn = document.createElement("button");
    btn.id = "mira-chat-btn";
    btn.type = "button";
    btn.textContent = "Falar connosco";
    var panel = document.createElement("div");
    panel.id = "mira-chat-panel";
    panel.hidden = true;
    panel.innerHTML =
      "<strong>Falar com a MIRA</strong>" +
      '<div id="mira-chat-list"></div>' +
      '<label for="mira-chat-name" style="font-weight:700;">O teu nome</label>' +
      '<input id="mira-chat-name" type="text" placeholder="O teu nome">' +
      '<label for="mira-chat-text" style="font-weight:700;">Mensagem</label>' +
      '<textarea id="mira-chat-text" rows="3" placeholder="Escreve a tua mensagem…"></textarea>' +
      '<button id="mira-chat-send" type="button">Enviar mensagem</button>' +
      '<p style="color:#bdbdbd;font-size:.85rem;">A tua mensagem fica guardada para o estúdio responder.</p>';
    document.body.appendChild(btn);
    document.body.appendChild(panel);
    var list = panel.querySelector("#mira-chat-list");
    btn.addEventListener("click", function () {
      panel.hidden = !panel.hidden;
      if (!panel.hidden) render(list);
    });
    panel.querySelector("#mira-chat-send").addEventListener("click", function () {
      var name = panel.querySelector("#mira-chat-name").value.trim();
      var text = panel.querySelector("#mira-chat-text").value.trim();
      if (!text) return;
      var msgs = load(MSG_KEY, []);
      msgs.push({ id: Date.now(), name: name || "Visitante", message: text, time: new Date().toISOString() });
      try { localStorage.setItem(MSG_KEY, JSON.stringify(msgs)); } catch (e) { /* armazenamento cheio */ }
      panel.querySelector("#mira-chat-text").value = "";
      render(list);
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }
})();
