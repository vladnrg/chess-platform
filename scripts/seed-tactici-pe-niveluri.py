"""Umple banca de puzzle-uri pentru fiecare (categorie × nivel) din aplicaţie.

Diferenţa faţă de `seed_tactics_csv.py`: acela colecta pe TEMĂ Lichess şi pe
benzi de ELO inventate (0-1000-1400-1800-3500), care nu sunt benzile din
aplicaţie. Aici se colectează exact pe perechile care se văd în interfaţă —
categoriile din `src/data/tactics.ts` × nivelurile din `src/lib/tactics-path.ts`
— ca fiecare cufăr să aibă cel puţin TARGET exerciţii la fiecare tactică.

Rulează: python scripts/seed-tactici-pe-niveluri.py
Scrie:   supabase/migrations/088_tactici_pe_niveluri.sql
"""
import urllib.request, zstandard, io, csv, os, sys, time

URL = "https://database.lichess.org/lichess_db_puzzle.csv.zst"
OUT = os.path.join(os.path.dirname(__file__), "..", "supabase", "migrations",
                   "088_tactici_pe_niveluri.sql")

# Nivelurile din src/lib/tactics-path.ts (limita de sus e exclusivă)
TIERS = [
    ("incepator", 400, 1000),
    ("intermediar", 1000, 1600),
    ("avansat", 1600, 2200),
    ("master", 2200, 2600),
]

# Categoriile din src/data/tactics.ts, cu temele lor Lichess
CATEGORIES = [
    ("fork", ["fork"]),
    ("pin", ["pin"]),
    ("discovered", ["discoveredAttack", "doubleCheck"]),
    ("attraction", ["attraction", "deflection"]),
    ("remove-defender", ["capturingDefender"]),
    ("skewer", ["skewer", "xRayAttack"]),
    ("trapped", ["trappedPiece"]),
    ("mate", ["mateIn1", "mateIn2", "mateIn3", "smotheredMate", "backRankMate"]),
    ("forced-draws", ["defensiveMove"]),
    ("zwischenzug", ["intermezzo", "interference"]),
    ("sacrifice", ["sacrifice"]),
    ("subscribers", ["clearance", "quietMove", "zugzwang",
                     "middlegame", "endgame", "exposedKing",
                     "crushing", "equality", "advantage"]),
]

TARGET = 26              # cerinţa e „măcar 20"; 26 lasă marjă
MIN_PIECES_DENSE = 12    # poziţii cu piese, nu schelete de trei figuri
MIN_PIECES_ENDGAME = 8   # temele de final au firesc mai puţine
ENDGAME_THEMES = {"mateIn1", "mateIn2", "mateIn3", "smotheredMate", "backRankMate",
                  "zugzwang", "trappedPiece", "endgame", "defensiveMove"}
MAX_ROWS = 6_000_000

# nevoi[(cat, tier)] = câte mai trebuie
need = {(c, t): TARGET for c, _ in CATEGORIES for t, _, _ in TIERS}
chosen = {}  # id -> rând


def piece_count(fen):
    return sum(c.isalpha() for c in fen.split(" ", 1)[0])


def tier_of(rating):
    for tid, lo, hi in TIERS:
        if lo <= rating < hi:
            return tid
    return None


def main():
    t0 = time.time()
    dctx = zstandard.ZstdDecompressor()
    req = urllib.request.Request(URL, headers={"User-Agent": "chess-platform-seed"})
    seen = 0
    with urllib.request.urlopen(req) as resp:
        text = io.TextIOWrapper(dctx.stream_reader(resp), encoding="utf-8", newline="")
        rdr = csv.reader(text)
        next(rdr)  # PuzzleId,FEN,Moves,Rating,RatingDeviation,Popularity,NbPlays,Themes,GameUrl,OpeningTags
        for row in rdr:
            seen += 1
            if seen > MAX_ROWS:
                break
            if seen % 250_000 == 0:
                lipsa = sum(1 for v in need.values() if v > 0)
                print(f"...{seen:,} rânduri, păstrate {len(chosen)}, perechi neacoperite {lipsa}/{len(need)}"
                      f" ({time.time()-t0:.0f}s)", file=sys.stderr)
            if len(row) < 9:
                continue
            pid, fen, moves = row[0], row[1], row[2]
            try:
                rating = int(row[3])
            except ValueError:
                continue
            tid = tier_of(rating)
            if tid is None or pid in chosen:
                continue
            themes = row[7].split()
            tset = set(themes)

            # categoriile pentru care rândul ăsta mai e nevoie, la nivelul lui
            vrute = [c for c, th in CATEGORIES
                     if need[(c, tid)] > 0 and tset.intersection(th)]
            if not vrute:
                continue

            prag = MIN_PIECES_ENDGAME if tset & ENDGAME_THEMES else MIN_PIECES_DENSE
            if piece_count(fen) < prag:
                continue

            chosen[pid] = (pid, fen, moves, rating, themes, row[8])
            for c in vrute:
                need[(c, tid)] -= 1

            if all(v <= 0 for v in need.values()):
                print("toate perechile acoperite", file=sys.stderr)
                break

    # raport pe perechi
    print(f"\n{'categorie':16} " + " ".join(f"{t:>11}" for t, _, _ in TIERS), file=sys.stderr)
    for c, _ in CATEGORIES:
        line = f"{c:16} "
        for t, _, _ in TIERS:
            line += f"{TARGET - need[(c, t)]:>11} "
        print(line, file=sys.stderr)
    lipsa = [(c, t) for (c, t), v in need.items() if v > 0]
    if lipsa:
        print(f"\nneacoperite complet: {lipsa}", file=sys.stderr)

    def esc(s):
        return s.replace("'", "''")

    vals = []
    for pid, fen, moves, rating, themes, url in sorted(chosen.values()):
        tarr = "ARRAY[" + ",".join(f"'{esc(x)}'" for x in themes) + "]::text[]"
        vals.append(f"  ('{esc(pid)}','{esc(fen)}','{esc(moves)}',{rating},{tarr},'{esc(url)}')")

    antet = (
        "-- ============================================================\n"
        "-- Exerciţii pentru fiecare tactică, la fiecare nivel\n"
        "-- ============================================================\n"
        "-- Generat de scripts/seed-tactici-pe-niveluri.py din baza oficială Lichess.\n"
        "--\n"
        f"-- {len(chosen)} puzzle-uri noi, alese ca fiecare pereche (categorie × nivel)\n"
        f"-- din interfaţă să aibă cel puţin {TARGET} exerciţii. Seed-ul de dinainte\n"
        "-- (017) colecta pe temă Lichess şi pe benzi de ELO care nu erau benzile\n"
        "-- aplicaţiei, aşa că unele cufere rămâneau aproape goale.\n"
        "--\n"
        "-- Nu şterge nimic: puzzle-urile existente rămân, iar cele deja prezente\n"
        "-- sunt sărite (ON CONFLICT DO NOTHING), ca să nu se piardă tentativele.\n\n"
    )
    sql = (antet
           + "INSERT INTO public.puzzles (id, fen, moves, rating, themes, game_url) VALUES\n"
           + ",\n".join(vals)
           + "\nON CONFLICT (id) DO NOTHING;\n")
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(sql)
    print(f"\nSCRIS {len(chosen)} puzzle-uri -> {os.path.abspath(OUT)} ({time.time()-t0:.0f}s)",
          file=sys.stderr)


main()
