set -e
cd /c/Users/STRIX/Documents/Projects/chess-platform
[ -f scripts/variante/date/cc-pas.json ] && node scripts/variante/date/pas.mjs aplica scripts/variante/date/cc-pas.json && rm scripts/variante/date/cc-pas.json
node scripts/variante/date/pas.mjs fens
node scripts/variante/date/gen-cc.mjs scripts/variante/date/in-pas.json cc-pas.json 6
