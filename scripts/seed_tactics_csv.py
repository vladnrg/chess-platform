"""Seed real, dense tactics puzzles from the official Lichess puzzle database.
Streams the .zst CSV (no full download to disk), filters dense positions,
collects a rating spread per theme, writes supabase/migrations/017_real_tactics.sql.
Run: python scripts/seed_tactics_csv.py
"""
import urllib.request, zstandard, io, csv, os, sys

URL = "https://database.lichess.org/lichess_db_puzzle.csv.zst"
OUT = os.path.join(os.path.dirname(__file__), "..", "supabase", "migrations", "017_real_tactics.sql")

# Chei de temă VALIDE în Lichess, aliniate la categoriile din src/data/tactics.ts
THEMES = [
    "fork","pin","discoveredAttack","doubleCheck","attraction","deflection",
    "capturingDefender","skewer","xRayAttack","trappedPiece",
    "mateIn1","mateIn2","mateIn3","smotheredMate","backRankMate",
    "intermezzo","interference","sacrifice","clearance","quietMove",
    "zugzwang","defensiveMove","exposedKing","hangingPiece",
    "crushing","equality","advantage",
]
ENDGAME_LOW = {"mateIn1","mateIn2","mateIn3","smotheredMate","backRankMate",
               "zugzwang","trappedPiece"}

BUCKETS = [(0,1000),(1000,1400),(1400,1800),(1800,3500)]
PER_BUCKET = 6           # 6 × 4 buckets = până la 24/temă (spread pe ELO)
MIN_PIECES_DENSE = 14
MIN_PIECES_ENDGAME = 10
MAX_ROWS = 1_600_000     # plafon de siguranță

def piece_count(fen):
    return sum(c.isalpha() for c in fen.split(" ", 1)[0])

# colectate[theme][bucket_idx] = list de randuri
collected = {t: [[] for _ in BUCKETS] for t in THEMES}
chosen = {}  # id -> row (dedup global)

def theme_done(t):
    return all(len(collected[t][b]) >= PER_BUCKET for b in range(len(BUCKETS)))

def bucket_idx(r):
    for i,(lo,hi) in enumerate(BUCKETS):
        if lo <= r < hi: return i
    return len(BUCKETS)-1

def main():
    dctx = zstandard.ZstdDecompressor()
    req = urllib.request.Request(URL, headers={"User-Agent":"chess-platform-seed"})
    rows_seen = 0
    kept = 0
    with urllib.request.urlopen(req) as resp:
        reader = dctx.stream_reader(resp)
        text = io.TextIOWrapper(reader, encoding="utf-8", newline="")
        rdr = csv.reader(text)
        header = next(rdr)  # PuzzleId,FEN,Moves,Rating,RatingDeviation,Popularity,NbPlays,Themes,GameUrl,OpeningTags
        for row in rdr:
            rows_seen += 1
            if rows_seen > MAX_ROWS: break
            if rows_seen % 200000 == 0:
                done = sum(theme_done(t) for t in THEMES)
                print(f"...{rows_seen} rows, kept {kept}, themes done {done}/{len(THEMES)}", file=sys.stderr)
            if len(row) < 9: continue
            pid, fen, moves, rating = row[0], row[1], row[2], row[3]
            themes = row[7].split()
            try: rating = int(rating)
            except: continue
            pc = piece_count(fen)
            bi = bucket_idx(rating)
            # temele relevante ale acestui puzzle care încă au nevoie în bucket-ul lui
            relevant = [t for t in themes if t in collected and len(collected[t][bi]) < PER_BUCKET]
            if not relevant: continue
            # densitate (prag mai mic dacă e temă de final)
            min_pc = MIN_PIECES_ENDGAME if any(t in ENDGAME_LOW for t in relevant) else MIN_PIECES_DENSE
            if pc < min_pc: continue
            if pid in chosen: continue
            chosen[pid] = (pid, fen, moves, rating, themes, row[8])
            kept += 1
            for t in relevant:
                collected[t][bi].append(pid)
            if all(theme_done(t) for t in THEMES):
                print("all themes satisfied early", file=sys.stderr); break

    # raport
    for t in THEMES:
        tot = sum(len(collected[t][b]) for b in range(len(BUCKETS)))
        print(f"{t}: {tot}", file=sys.stderr)

    rows = list(chosen.values())
    def esc(s): return s.replace("'","''")
    vals = []
    for pid, fen, moves, rating, themes, url in rows:
        tarr = "ARRAY[" + ",".join(f"'{esc(x)}'" for x in themes) + "]::text[]"
        vals.append(f"  ('{esc(pid)}','{esc(fen)}','{esc(moves)}',{rating},{tarr},'{esc(url)}')")
    sql = (
        "-- Migration 017: puzzle-uri tactice REALE și dense din baza Lichess (poziții cu multe piese)\n"
        f"-- Generat din scripts/seed_tactics_csv.py ({len(rows)} puzzle-uri)\n\n"
        "DELETE FROM public.puzzles WHERE id LIKE 'seed_%';\n\n"
        "INSERT INTO public.puzzles (id, fen, moves, rating, themes, game_url) VALUES\n"
        + ",\n".join(vals)
        + "\nON CONFLICT (id) DO UPDATE SET\n"
        "  fen = EXCLUDED.fen, moves = EXCLUDED.moves, rating = EXCLUDED.rating,\n"
        "  themes = EXCLUDED.themes, game_url = EXCLUDED.game_url;\n"
    )
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(sql)
    print(f"\nWROTE {len(rows)} puzzles -> {os.path.abspath(OUT)}", file=sys.stderr)

main()
