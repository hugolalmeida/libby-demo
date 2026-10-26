/* Libby — modo demonstração (site estático, sem servidor).
 *
 * As telas são a Libby de verdade, renderizadas com dados fictícios. Este
 * arquivo faz o papel do servidor: leva cada link ao arquivo certo, simula a
 * rodada "ao vivo" quando alguém clica em Executar e avisa quando uma ação
 * não existe aqui (nada é salvo nem enviado). Config em window.__DEMO,
 * escrita pelo gerador em cada página.
 */
(function () {
  var D = window.__DEMO || {mapa: {}, fetch: {}, aovivo: {}};

  // ---- aparência: selo de demonstração + aviso flutuante ------------------
  var css = document.createElement('style');
  css.textContent =
    '.demo-tag{font-size:12px;font-weight:700;color:var(--amber-ink);background:var(--amber-soft);' +
    'border:1px solid var(--aviso-line, var(--line));border-radius:999px;padding:4px 11px;margin-right:12px;white-space:nowrap}' +
    '.demo-toast{position:fixed;left:50%;bottom:calc(22px + env(safe-area-inset-bottom,0px));transform:translateX(-50%) translateY(20px);' +
    'background:var(--navy);color:var(--ink-inv,#fff);padding:11px 18px;border-radius:10px;font-size:13.5px;' +
    'box-shadow:0 10px 30px -10px rgba(0,0,0,.45);opacity:0;transition:opacity .2s,transform .2s;z-index:9999;max-width:min(520px,calc(100% - 32px))}' +
    '.demo-toast.on{opacity:1;transform:translateX(-50%) translateY(0)}';
  document.head.appendChild(css);
  var top = document.querySelector('.top .sp');
  if (top) {
    var tag = document.createElement('span');
    tag.className = 'demo-tag';
    tag.textContent = 'Demonstração · dados fictícios';
    tag.title = 'Sistema interno reproduzido com empresas, pessoas e números inventados.';
    top.parentNode.insertBefore(tag, top.nextSibling);
  }
  var toastEl, toastT;
  function avisa(msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'demo-toast';
      toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('on'); }, 3200);
  }

  // ---- login: qualquer senha entra ---------------------------------------
  if (D.pagina === '/login') {
    var senha = document.querySelector('input[type=password]');
    if (senha) { senha.value = 'demo'; senha.placeholder = 'qualquer senha'; }
    setTimeout(function () { avisa('Demonstração: escolha um setor e entre. Qualquer senha funciona.'); }, 400);
  }

  // ---- links que não foram gerados ----------------------------------------
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('[data-demo-fora]');
    if (!a) return;
    ev.preventDefault();
    var alvo = a.getAttribute('data-demo-fora') || '';
    if (/\/baixar$/.test(alvo)) avisa('Na demonstração os relatórios não são baixados.');
    else if (/^\/execucao\/\d+$/.test(alvo)) avisa('Na demonstração, só as execuções mais recentes têm o log completo.');
    else avisa('Esta parte não está na demonstração: no sistema real ela mexe em dados internos.');
  }, true);

  // ---- formulários ----------------------------------------------------------
  function chaveDe(path, params) {
    var alvo = params.filter(function (p) { return p[1]; }).sort().join('&');
    for (var u in D.mapa) {
      var i = u.indexOf('?'), p = i < 0 ? u : u.slice(0, i), q = i < 0 ? '' : u.slice(i + 1);
      if (p !== path) continue;
      var lista = q ? q.split('&').map(function (kv) { var s = kv.split('=');
        return [decodeURIComponent(s[0]), decodeURIComponent((s[1] || '').replace(/\+/g, ' '))]; }) : [];
      if (lista.filter(function (p) { return p[1]; }).sort().join('&') === alvo) return D.mapa[u];
    }
    return null;
  }
  document.addEventListener('submit', function (ev) {
    var f = ev.target, acao = f.getAttribute('data-demo-acao');
    if (acao === null) return;
    ev.preventDefault(); ev.stopImmediatePropagation();
    if (acao === '/login') { location.href = D.mapa['/'] || 'dashboard.html'; return; }
    if (/^\/automacao\/[^/]+\/executar$/.test(acao)) {
      if (D.aovivo && D.aovivo.destino) { location.href = D.aovivo.destino + '#aovivo'; return; }
      avisa('Esta automação não tem uma rodada de exemplo na demonstração.'); return;
    }
    if ((f.getAttribute('method') || 'get').toLowerCase() === 'get') {
      var params = [];
      new FormData(f).forEach(function (v, k) { if (typeof v === 'string') params.push([k, v]); });
      var arq = chaveDe(acao.split('?')[0], params);
      if (arq) { location.href = arq; return; }
      avisa('Na demonstração, só algumas combinações de filtro foram geradas.'); return;
    }
    avisa('Demonstração: nada é salvo nem enviado.');
  }, true);

  // ---- servidor de mentira: fetch e htmx ----------------------------------
  var vivo = null;
  var fetchReal = window.fetch;
  window.fetch = function (url) {
    var u = String(url).split('?')[0];
    if (vivo && /\/progresso$/.test(u)) return Promise.resolve(jsonResp(vivo.progresso()));
    if (D.fetch && D.fetch[u]) return Promise.resolve(jsonResp(D.fetch[u]));
    if (/^https?:/.test(u) && fetchReal) return fetchReal.apply(window, arguments);
    return Promise.reject(new Error('demo: sem servidor'));
  };
  function jsonResp(o) { return {ok: true, status: 200, json: function () { return Promise.resolve(o); },
    text: function () { return Promise.resolve(JSON.stringify(o)); }}; }
  window.htmx = {ajax: function () { avisa('Esta parte não está na demonstração.'); return Promise.resolve(); },
                 process: function () {}, on: function () {}, trigger: function () {}};
  window.confirm = function () { return true; };

  // ---- rodada "ao vivo" -----------------------------------------------------
  // A tela de uma execução já concluída, tocada como se começasse agora: o log
  // entra linha a linha, a barra anda pelo [n/total] e o cronômetro acompanha.
  if (location.hash === '#aovivo') {
    var box = document.getElementById('logbox');
    var linhas = box ? [].slice.call(box.querySelectorAll('.ll')) : [];
    var fimEl = box && [].slice.call(box.children).filter(function (x) { return /— fim/.test(x.textContent); })[0];
    var chip = document.getElementById('stbadge');
    var base = (D.fetch && D.fetch[Object.keys(D.fetch)[0]]) || {};
    if (linhas.length && chip) {
      var final = {html: chip.innerHTML, cls: chip.className};
      var reduz = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      linhas.forEach(function (l) { l.hidden = true; });
      if (fimEl) fimEl.hidden = true;
      chip.className = 'chip run'; chip.innerHTML = '<span class="cdot"></span>executando';
      var total = Math.min(16000, Math.max(6000, linhas.length * 220)), t0 = Date.now(), atual = 0, tot = 0, i = 0;
      vivo = {progresso: function () {
        var frac = Math.min(1, (Date.now() - t0) / total), acabou = i >= linhas.length;
        var dec = Math.round((base.decorrido || 60) * frac);
        return acabou ? base : {status: 'executando', decorrido: dec, atual: atual, total: tot,
          pct: tot ? Math.round(1000 * atual / tot) / 10 : null,
          restante: tot && atual ? Math.round(dec / atual * (tot - atual)) : null,
          tipico: base.tipico, amostras: base.amostras};
      }};
      var passo = function () {
        if (i >= linhas.length) {
          chip.className = final.cls; chip.innerHTML = final.html;
          if (fimEl) fimEl.hidden = false;
          avisa('Rodada de demonstração concluída. No sistema real, o aviso sai no Discord.');
          return;
        }
        var l = linhas[i++]; l.hidden = false;
        var m = /\[(\d+)\/(\d+)\]/.exec(l.textContent); if (m) { atual = +m[1]; tot = +m[2]; }
        var cb = document.getElementById('autoscroll');
        if (!cb || cb.checked || true) box.scrollTop = box.scrollHeight;
        if (reduz) passo(); else setTimeout(passo, total / linhas.length);
      };
      avisa('Rodada simulada: o log abaixo é tocado como se a automação estivesse rodando agora.');
      passo();
    }
  }
})();
