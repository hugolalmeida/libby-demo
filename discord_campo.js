// discord_campo.js — seletor de webhook e de menções do Discord.
// Usado pela tela da automação (_campo_auto.html) e pela tela do FGTS.
// Discord: o backend continua recebendo 'discord_webhook' (URL) e
// 'discord_mentions' (string '<@&id> <@id>') — a lista e as caixas são só a
// forma de escolher.
function whTroca(){
  var sel = document.getElementById('whSel'), novo = document.getElementById('whNovo');
  if(!sel || !novo) return;
  var outro = sel.value === '__outro__';
  novo.style.display = outro ? '' : 'none';
  novo.disabled = !outro;
  novo.name = outro ? sel.name : sel.name + '_novo';
  sel.disabled = outro;
  if(outro) novo.focus();
}
function mnJunta(){
  var hid = document.getElementById('mnHid');
  if(!hid) return;
  var v = [], nomes = [];
  document.querySelectorAll('.mnChk:checked').forEach(function(c){
    v.push(c.value); nomes.push((c.parentNode.textContent || '').trim());
  });
  hid.value = v.join(' ');
  var r = document.getElementById('mnResumo');
  if(r){
    r.textContent = nomes.length ? nomes.join(', ') : '— não marcar ninguém —';
    r.style.opacity = nomes.length ? '' : '.6';
  }
}
// A lista é position:fixed, então quem a posiciona é este código. Antes era
// absolute e o card recortava o popup: a seção "Pessoas", que vem depois
// dos cargos, ficava fora da área visível e não havia como marcá-la.
// Aqui a altura sai do espaço livre na tela e a lista abre para cima
// quando o campo está perto do rodapé.
function mnPosiciona(){
  var l = document.getElementById('mnLista'), b = document.getElementById('mnBtn');
  if(!l || !b || l.style.display === 'none') return;
  var r = b.getBoundingClientRect(), folga = 12;
  var abaixo = window.innerHeight - r.bottom - folga, acima = r.top - folga;
  var paraCima = abaixo < 220 && acima > abaixo;
  l.style.left = r.left + 'px';
  l.style.width = r.width + 'px';
  l.style.maxHeight = Math.max(160, Math.min(420, paraCima ? acima : abaixo)) + 'px';
  if(paraCima){ l.style.top = ''; l.style.bottom = (window.innerHeight - r.top + 3) + 'px'; }
  else { l.style.bottom = ''; l.style.top = (r.bottom + 3) + 'px'; }
}
function mnAbre(ev){
  var l = document.getElementById('mnLista');
  if(!l) return;
  ev.stopPropagation();
  var abrindo = l.style.display === 'none';
  l.style.display = abrindo ? '' : 'none';
  if(abrindo){
    mnPosiciona();
    var busca = document.getElementById('mnBusca');
    if(busca) busca.focus();
  }
}
// Filtra por nome. Um cabeçalho de grupo só aparece se sobrou alguém nele —
// senão a lista mostra "Cargos" com nada embaixo.
function mnFiltra(){
  var busca = document.getElementById('mnBusca');
  if(!busca) return;
  var t = busca.value.trim().toLowerCase(), achou = 0;
  var vistos = {c:0, p:0};
  document.querySelectorAll('.mnItem').forEach(function(it){
    var ok = !t || (it.dataset.nome || '').indexOf(t) >= 0;
    it.style.display = ok ? '' : 'none';
    if(ok){ achou++; vistos[it.querySelector('.mnChk').value.indexOf('<@&') === 0 ? 'c' : 'p']++; }
  });
  document.querySelectorAll('.mnGrupo').forEach(function(g){
    g.style.display = vistos[g.dataset.grupo] ? '' : 'none';
  });
  var vazio = document.getElementById('mnVazio');
  if(vazio) vazio.style.display = achou ? 'none' : '';
}
document.addEventListener('click', function(ev){
  var l = document.getElementById('mnLista');
  if(l && l.style.display !== 'none' && !l.contains(ev.target)) l.style.display = 'none';
});
// Rolar ou redimensionar move o botão; a lista fixa precisa acompanhar.
window.addEventListener('scroll', mnPosiciona, true);
window.addEventListener('resize', mnPosiciona);
document.addEventListener('keydown', function(ev){
  if(ev.key !== 'Escape') return;
  var l = document.getElementById('mnLista');
  if(l && l.style.display !== 'none'){ l.style.display = 'none'; ev.stopPropagation(); }
});
