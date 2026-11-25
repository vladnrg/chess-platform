// Porneşte culegerea Lichess în pagină, în fundal (window.__li); se verifică apoi cu stare-li.js şi se descarcă cu descarca-li.js.
import { writeFileSync } from 'node:fs'
const D = 'C:/Users/STRIX/Documents/Projects/chess-platform/'
writeFileSync('scripts/variante/date/explorer-li.js', `async (page) => {
  await page.route('https://lichess.org/__lista__', r => r.fulfill({ path: '${D}scripts/variante/date/in-rating-li.json', contentType: 'application/json' }));
  await page.evaluate(async () => {
    const P = await (await fetch('/__lista__')).json();
    window.__li = { gata: 0, total: P.length, out: {}, terminat: false };
    (async () => {
      const B = [400, 1000, 1200, 1400, 1600, 1800, 2000, 2200];
      const pauza = ms => new Promise(r => setTimeout(r, ms));
      for (const fen of P) {
        const o = {};
        for (const b of B) {
          let j = null;
          for (let k = 0; k < 6 && !j; k++) {
            try {
              const r = await fetch('https://explorer.lichess.org/lichess?variant=standard&speeds=rapid,blitz&moves=30&ratings=' + b + '&fen=' + encodeURIComponent(fen), { credentials: 'include' });
              if (r.status === 429) { await pauza(60000); continue }
              if (r.ok) j = await r.json(); else await pauza(2000);
            } catch { await pauza(3000) }
          }
          await pauza(300);
          o[b] = j ? { tot: j.white + j.draws + j.black, m: Object.fromEntries(j.moves.map(x => [x.san, x.white + x.draws + x.black])) } : null;
        }
        window.__li.out[fen] = o; window.__li.gata++;
      }
      window.__li.terminat = true;
    })();
  });
  await page.unroute('https://lichess.org/__lista__');
  return 'pornit';
}
`)
writeFileSync('scripts/variante/date/descarca-li.js', `async (page) => {
  const [dl] = await Promise.all([page.waitForEvent('download'), page.evaluate(() => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(window.__li.out)], { type: 'application/json' }));
    a.download = 'li.json'; document.body.appendChild(a); a.click(); a.remove();
  })]);
  await dl.saveAs('${D}scripts/variante/date/li-rating.json');
  return 'salvat';
}
`)
console.log('ok')
