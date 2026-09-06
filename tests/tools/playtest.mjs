// Playtest automatizado de SpaceMania: bot heurístico juega runs reales (tiempo real,
// los power-ups usan setTimeout) y vuelca métricas por run en JSON.
// Uso: node playtest.mjs <perfil:novato|pro> <dificultad> <upgrades:none|all> <runs> <maxMin> <outfile>
import { chromium } from 'playwright';
import fs from 'node:fs';

import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';
const _here = dirname(fileURLToPath(import.meta.url));
const GAME_URL = pathToFileURL(resolve(_here, '../../index.html')).href;
const EXE = process.env.CHROMIUM_PATH || undefined;
const [profile = 'novato', difficulty = 'normal', upg = 'none', runsArg = '3', maxMinArg = '8', outfile = 'out.json'] = process.argv.slice(2);
const RUNS = parseInt(runsArg, 10), MAX_MS = parseFloat(maxMinArg) * 60000;
const URL = GAME_URL;
const LS = 'retro-game-mania.spacemania.';

const PROFILES = {
  novato: { look: 30, hit: 22, every: 6, freeze: 0.06 },
  pro:    { look: 75, hit: 20, every: 1, freeze: 0.0 },
};
const P = PROFILES[profile];

const BOT = `(()=>{
  const P=${JSON.stringify(P)};
  window.__m={syn:0,synNames:{},deaths:[],pu:0,frames0:frame,t0:Date.now(),hitsTaken:0};
  const _ck=checkAndApplySynergy; checkAndApplySynergy=function(){ const b=activeSynergy; _ck(); if(activeSynergy&&activeSynergy!==b){ __m.syn++; __m.synNames[activeSynergy]=(__m.synNames[activeSynergy]||0)+1; } };
  const _fe=finishExplosion; finishExplosion=function(){ __m.deaths.push({cycle,wave:(waveIdx%WAVE_COUNT)+1,boss:isBossWave,score}); _fe(); };
  const _ap=activatePowerup; activatePowerup=function(t){ __m.pu++; _ap(t); };
  const _ph=playerHit; playerHit=function(){ if(!playerExploding) __m.hitsTaken++; _ph(); };
  let tick=0, target=null, frozen=0;
  function threats(){ const th=[]; enemies.forEach(e=>e.ebullets.forEach(b=>th.push(b))); if(boss&&boss.alive){ boss.ebullets.forEach(b=>th.push(b)); bossMinions.forEach(m=>m.ebullets.forEach(b=>th.push(b))); } return th; }
  function danger(x,th){ let d=0; const py=player.y;
    for(const b of th){ if(b.vy<=0) continue; const t=(py-b.y)/b.vy; if(t<-4||t>P.look) continue; const bx=b.x+b.vx*Math.max(0,t); const dx=Math.abs(bx-x); if(dx<P.hit) d+=(1.2-t/P.look)*(1+(P.hit-dx)/P.hit); }
    for(const e of enemies){ if(!e.alive) continue; if(e.y>py-70&&Math.abs(e.x-x)<e.size+20) d+=3; }
    if(boss&&boss.alive&&boss.y>py-90&&Math.abs(boss.x-x)<boss.size+20) d+=3;
    return d; }
  function pickGoal(th){
    const drops=[]; powerups.forEach(p=>{ if(p.y>60) drops.push(p.x); }); if(shieldDrop&&shieldDrop.y>60) drops.push(shieldDrop.x); miniFrags.forEach(m=>{ if(m.y>120) drops.push(m.x); });
    if(drops.length){ let best=null,bd=1e9; for(const x of drops){ const dd=Math.abs(x-player.x); if(dd<bd){bd=dd;best=x;} } return best; }
    if(boss&&boss.alive) return boss.x;
    let best=null,bd=1e9; for(const e of enemies){ if(!e.alive) continue; const px=predict(e); const dd=Math.abs(px-player.x)+(e.y*0.3); if(dd<bd){bd=dd;best=px;} } return best;
  }
  function predict(e){ const vx=e.__vx||0; const tf=(player.y-18-e.y)/9; return Math.max(22,Math.min(W-22,e.x+vx*tf)); }
  function aligned(){
    if(boss&&boss.alive&&Math.abs(boss.x-player.x)<boss.size*0.7) return true;
    for(const m of bossMinions){ if(m.alive&&Math.abs(m.x-player.x)<m.size*0.6) return true; }
    for(const e of enemies){ if(e.alive&&Math.abs(predict(e)-player.x)<e.size*0.9) return true; }
    return false;
  }
  function step(){
    if(state!=='playing'||paused||playerExploding){ keys['ArrowLeft']=false; keys['ArrowRight']=false; return; }
    if(aligned()) fireBullet();
    tick++;
    if(frozen>0){ frozen--; return; }
    if(Math.random()<P.freeze/6) frozen=8;
    if(tick%P.every===0||target===null){
      const th=threats(); const goal=pickGoal(th); const spd=player.speed*(activePowerups.speed?1.9:1);
      let bestX=player.x, bestS=1e9;
      for(let x=22;x<=W-22;x+=8){
        const tt=Math.abs(x-player.x)/spd;
        let s=danger(x,th)*3 + 0.35*danger(player.x,th)*Math.min(1,tt/20) + tt*0.01;
        if(goal!==null) s+=Math.abs(x-goal)*0.02;
        if(s<bestS){bestS=s;bestX=x;}
      }
      target=bestX;
    }
    const dx=target-player.x;
    keys['ArrowLeft']=dx<-3; keys['ArrowRight']=dx>3;
  }
  function post(){ enemies.forEach(e=>{ e.__vx=(e.__lx===undefined)?0:e.x-e.__lx; e.__lx=e.x; }); }
  const _raf=window.requestAnimationFrame; window.requestAnimationFrame=cb=>_raf(t=>{ try{step();}catch(e){} cb(t); try{post();}catch(e){} });
})();`;

const browser = await chromium.launch({ headless: true, executablePath: EXE, args: ['--autoplay-policy=no-user-gesture-required'] });
const results = [];

async function oneRun(i) {
  const ctx = await browser.newContext({ viewport: { width: 1000, height: 700 } });
  const page = await ctx.newPage();
  await page.addInitScript(({ LS, upg, difficulty }) => {
    localStorage.setItem(LS + 'firstgame', '0');
    localStorage.setItem(LS + 'fragments', '0');
    if (upg === 'all') localStorage.setItem(LS + 'upgrades', JSON.stringify({ hull: 2, reactor: 3, magnet: 2, combo_fuel: 3, start_shield: 1, fragment_boost: 2, spare_life: 1 }));
    else localStorage.removeItem(LS + 'upgrades');
  }, { LS, upg, difficulty });
  await page.goto(GAME_URL);
  await page.waitForFunction(() => typeof startGame === 'function');
  await page.evaluate(BOT);
  await page.evaluate((d) => { selectDiff(d); startGame(false); }, difficulty);
  const t0 = Date.now();
  let timedOut = false;
  while (true) {
    await page.waitForTimeout(2000);
    const st = await page.evaluate(() => state);
    if (st === 'gameover') break;
    if (Date.now() - t0 > MAX_MS) { timedOut = true; break; }
  }
  const m = await page.evaluate(() => ({
    score, cycle: maxCycleReached, wave: maxWaveReached, waveIdxAbs: waveIdx, kills: totalKills, bosses: bossesKilled,
    ascensions: ascensionsThisRun, nearMisses, maxCombo: maxComboRun, frags: calcRunFragments(),
    breakdown: fragmentBreakdown(), modifier: runModifier ? runModifier.id : null,
    lives, shipHp, pu: __m.pu, syn: __m.syn, synNames: __m.synNames, deaths: __m.deaths, hitsTaken: __m.hitsTaken,
    fps: Math.round((frame - __m.frames0) / ((Date.now() - __m.t0) / 1000) * 10) / 10,
  }));
  m.elapsedSec = Math.round((Date.now() - t0) / 1000); m.timedOut = timedOut; m.run = i;
  m.profile = profile; m.difficulty = difficulty; m.upgrades = upg;
  results.push(m);
  console.log(JSON.stringify(m));
  await ctx.close();
}

await Promise.all(Array.from({ length: RUNS }, (_, i) => oneRun(i)));
fs.writeFileSync(outfile, JSON.stringify(results, null, 1));
await browser.close();
