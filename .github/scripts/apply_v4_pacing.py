from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

assert 'Versión: 4.0.0' in s, 'Unexpected game version'

css_anchor = '/* ── v3.0 · META-PROGRESIÓN / HANGAR ── */'
css_insert = '''/* ── v4 · PACING / DIRECTOR HUD ── */
#director-hud{font-size:8px;color:#4f6b88;letter-spacing:1px;text-align:right;min-height:12px;opacity:.9;}
#director-hud.signal{color:#ff6;text-shadow:0 0 6px rgba(255,238,102,.45);}
#director-hud.hot{color:#f84;text-shadow:0 0 6px rgba(255,132,68,.4);}
@keyframes directorPulse{0%,100%{opacity:.45}50%{opacity:1}}
#director-hud.signal{animation:directorPulse 1s infinite;}
body.rm #director-hud{animation:none!important;}
'''
assert css_anchor in s
s = s.replace(css_anchor, css_insert + css_anchor, 1)

html_anchor = '<div id="wave-name">WAVE 1 · SMARTPHONES</div>'
html_insert = html_anchor + '\n      <div id="director-hud" aria-live="polite"></div>'
assert html_anchor in s
s = s.replace(html_anchor, html_insert, 1)

js_anchor = 'const V4_DEBUG=false;'
js_insert = r'''const V4_DEBUG=false;

// ── V4 · PACING POLISH ─────────────────────────────────────
// La dirección no solo decide eventos: hace perceptible la intención de la wave.
// Se anuncia el estado del ciclo, pero el evento concreto permanece oculto hasta
// su telegraph. Así se crea anticipación sin convertir la partida en un guion.
const V4_PACING={
  intro:{text:'SEÑAL ESTABLE',tone:'calm'},
  mastery:{text:'MANTÉN EL RITMO',tone:'calm'},
  escalation:{text:'PRESIÓN EN AUMENTO',tone:'warm'},
  event:{text:'SEÑAL INESTABLE',tone:'signal'},
  combination:{text:'LA SEÑAL SE RAMIFICA',tone:'signal'},
  relief:{text:'VENTANA DE CALMA',tone:'calm'},
  climax:{text:'ALGO VIENE',tone:'hot'},
  pre_boss:{text:'PRESENCIA DETECTADA',tone:'hot'},
};
function pacingBeatForWave(){ return V4_PACING[currentWaveRole()]||null; }
function showPacingBeat(){
  const d=eventDirector;
  if(!d||state!=='playing'||d.pacingWave===waveIdx) return;
  d.pacingWave=waveIdx;
  const beat=pacingBeatForWave();
  const el=document.getElementById('director-hud');
  if(el){el.textContent=beat?beat.text:'';el.className=beat?beat.tone:'';}
  if(!beat|| (beat.tone!=='signal'&&beat.tone!=='hot')) return;
  showAnnounce('wave',beat.text,beat.tone==='hot'?'#f84':'#ff6');
  announce(beat.text);
}
function updateDirectorHud(){
  const d=eventDirector,el=document.getElementById('director-hud');
  if(!d||!el) return;
  const a=d.active;
  if(a&&a.phase==='telegraph'){
    el.textContent=(a.def.kind==='threat'?'⚠ ':'')+'SIGNAL // '+a.def.kind.toUpperCase();
    el.className=a.def.kind==='threat'?'hot':'signal';
    return;
  }
  if(a&&a.phase==='armed'){
    el.textContent='SIGNAL // ?  '+(a.timer/60<1.1?'IMMINENTE':'DETECTADA');
    el.className='signal';
    return;
  }
  const beat=pacingBeatForWave();
  el.textContent=beat?beat.text:'';
  el.className=beat?beat.tone:'';
}
function drawDirectorAtmosphere(){
  const d=eventDirector;
  if(!d||!d.active||d.active.phase!=='armed') return;
  const p=reducedMotion?0.12:0.18+0.12*Math.sin(frame*0.11);
  cx.save();cx.globalAlpha=p;cx.strokeStyle='#ff6';cx.lineWidth=1;
  cx.beginPath();cx.moveTo(W*0.35,7);cx.lineTo(W*0.65,7);cx.stroke();cx.restore();
}
'''
assert js_anchor in s
s = s.replace(js_anchor, js_insert, 1)

old = "const p=Math.min(0.82,(0.18+0.14*d.wavesSinceEvent)*currentRoute().eventBias);"
new = "const role=currentWaveRole(); const baseByRole={event:0.52,climax:0.36,combination:0.28,escalation:0.18,relief:0.10}; const base=baseByRole[role]??0.14; const p=Math.min(0.88,(base+0.10*d.wavesSinceEvent)*currentRoute().eventBias);"
assert old in s
s = s.replace(old,new,1)

old='const bySecret=d.routeFlags.transmissions>=3;'
new='const bySecret=d.routeFlags.transmissions>=2;'
assert old in s
s=s.replace(old,new,1)
old='const bySkill=maxComboRun>=18||d.routeFlags.nearStreakBest>=12;'
new='const bySkill=maxComboRun>=14||d.routeFlags.nearStreakBest>=8;'
assert old in s
s=s.replace(old,new,1)

old="d.active={ def, phase:'armed', timer:delay||0, data:{}, telegraphed:false };"
new="d.active={ def, phase:'armed', timer:delay||0, data:{}, telegraphed:false }; d.forecast={kind:def.kind,tags:def.tags||[]};"
assert old in s
s=s.replace(old,new,1)

old='  a.telegraphed=true;\n'
new='  a.telegraphed=true;\n  if(eventDirector) eventDirector.forecast=null;\n'
assert old in s
s=s.replace(old,new,1)

old="  d.active=null;\n  if(V4_DEBUG) console.debug('[V4 EVENT] resolve'"
new="  d.active=null; d.forecast=null; d.lastOutcome=outcome;\n  if(V4_DEBUG) console.debug('[V4 EVENT] resolve'"
assert old in s
s=s.replace(old,new,1)

old="  const d=eventDirector; if(!d||state!=='playing') return;\n  d.sampleAcc+=dt;"
new="  const d=eventDirector; if(!d||state!=='playing') return;\n  showPacingBeat();\n  updateDirectorHud();\n  d.sampleAcc+=dt;"
assert old in s
s=s.replace(old,new,1)

old="  drawEventTelegraph();   // v4: la señal se dibuja sobre la escena, bajo el jugador\n"
new="  drawEventTelegraph();   // v4: la señal se dibuja sobre la escena, bajo el jugador\n  drawDirectorAtmosphere();\n"
assert old in s
s=s.replace(old,new,1)

old='v4.0.0: Event Director. Una capa de decisión sobre las oleadas con\n'
new='v4.0.0: Event Director + pacing director. Una capa de decisión sobre las oleadas con\n'
assert old in s
s=s.replace(old,new,1)

p.write_text(s,encoding='utf-8')
print('SpaceMania v4 pacing polish applied successfully')