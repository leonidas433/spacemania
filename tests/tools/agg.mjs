import fs from 'node:fs';
for (const f of process.argv.slice(2)) {
  const rs = JSON.parse(fs.readFileSync(f, 'utf8'));
  const avg = k => (rs.reduce((s, r) => s + (r[k] || 0), 0) / rs.length).toFixed(1);
  const r0 = rs[0];
  console.log(`\n== ${f} (${rs.length} runs) ${r0.profile}/${r0.difficulty}/${r0.upgrades}`);
  console.log(`cycle avg ${avg('cycle')} | wave avg ${avg('wave')} | waves abs ${avg('waveIdxAbs')} | reached cycle2: ${rs.filter(r => r.cycle >= 2).length}/${rs.length} | timedOut: ${rs.filter(r => r.timedOut).length}`);
  console.log(`score ${avg('score')} | frags ${avg('frags')} | kills ${avg('kills')} | bosses ${avg('bosses')} | asc ${avg('ascensions')} | nearMiss ${avg('nearMisses')} | maxCombo ${avg('maxCombo')} | pu ${avg('pu')} | syn ${avg('syn')} | hits ${avg('hitsTaken')} | sec ${avg('elapsedSec')} | fps ${avg('fps')}`);
  const deaths = rs.flatMap(r => r.deaths.map(d => `c${d.cycle}w${d.wave}${d.boss ? 'B' : ''}`));
  const cnt = {}; deaths.forEach(d => cnt[d] = (cnt[d] || 0) + 1);
  console.log('deaths:', Object.entries(cnt).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}x${v}`).join(' '));
  const syn = {}; rs.forEach(r => Object.entries(r.synNames).forEach(([k, v]) => syn[k] = (syn[k] || 0) + v));
  console.log('synergies:', JSON.stringify(syn), '| modifiers:', rs.map(r => r.modifier).join(','));
  rs.forEach(r => console.log(`  run${r.run}: c${r.cycle} w${r.wave} score ${r.score} frags ${r.frags} asc ${r.ascensions} lives ${r.lives} ${r.timedOut ? 'TIMEOUT' : ''} breakdown ${JSON.stringify(r.breakdown)}`));
}
