// node gen-cc.mjs intrare.json iesire.json [top] → explorer-cc.js; lista se citeşte de pe disc (page.route), nu e lipită în cod.
import { writeFileSync } from 'node:fs'
const [, , inF, outF, top = '10'] = process.argv
const D = 'C:/Users/STRIX/Documents/Projects/chess-platform/'
writeFileSync('scripts/variante/date/explorer-cc.js', `async (page) => {
  await page.route('https://www.chess.com/__lista__', r => r.fulfill({ path: '${D}${inF}', contentType: 'application/json' }));
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 0 }), page.evaluate(async (TOP) => {
    const P = await (await fetch('/__lista__')).json();
    const url = '/service/all-games-explorer/chesscom.all_games_explorer.v1.AllGamesExplorerService/Explore';
    const pauza = ms => new Promise(r => setTimeout(r, ms));
    const out = {};
    for (const [id, fen, color, B] of P) {
      out[id] = {};
      for (const [mn, mx] of B) {
        let j = null;
        for (let k = 0; k < 4 && !j; k++) {
          try {
            const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ fen, color, ratingBand: { minRating: mn, maxRating: mx }, timeClasses: ['TIME_CLASS_RAPID', 'TIME_CLASS_BLITZ'] }) });
            if (r.ok) j = await r.json(); else await pauza(3000);
          } catch { await pauza(3000) }
        }
        if (!j) { out[id][mn] = null; continue }
        const m = (j.perMoveResponse || []).map(x => [x.moveSan, Number(x.numGamesPlayed || 0)]).sort((a, b) => b[1] - a[1]);
        out[id][mn] = { tot: m.reduce((s, x) => s + x[1], 0), m: m.slice(0, TOP) };
      }
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(out)], { type: 'application/json' }));
    a.download = 'x.json'; document.body.appendChild(a); a.click(); a.remove();
  }, ${Number(top)})]);
  await dl.saveAs('${D}scripts/variante/date/${outF}');
  await page.unroute('https://www.chess.com/__lista__');
  return 'salvat';
}
`)
console.log('ok')
