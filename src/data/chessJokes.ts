// Mesaje motivaționale / amuzante din lumea șahului.
// Apar sus pe pagină la începutul fiecărei sesiuni (pool randomizat).

export const CHESS_QUIPS: string[] = [
  'Singura mutare greșită e cea pe care n-o calculezi. Hai pe tablă!',
  'Pionii sunt sufletul jocului — și azi ai șansa să le dai voce.',
  'Un mare jucător pierde mii de partide. Apoi câștigă singura care contează.',
  'Tactica e ce faci când ai ceva de făcut. Strategia e ce faci când n-ai. Azi avem amândouă.',
  'Nu juca cea mai bună mutare. Joacă mutarea care-l face pe adversar să transpire.',
  'Regele se mișcă încet, dar ajunge oriunde. La fel și progresul tău.',
  'Cine controlează centrul, controlează partida. Cine rezolvă puzzle-uri, controlează ELO-ul.',
  'Fiecare maestru a fost cândva un dezastru care a refuzat să renunțe.',
  'Calul sare peste obstacole. Fă și tu la fel azi.',
  'O furculiță bună valorează cât o mie de explicații. Hai s-o găsim pe a ta.',
  'Șahul e 99% tactică. Restul de 1%... tot tactică e.',
  'Adversarul tău speră că nu vezi mutarea. Dezamăgește-l.',
  'Damele cad, regii fug, dar un plan bun rămâne. Construiește-l azi.',
  'Nu pierzi niciodată la șah. Ori câștigi, ori înveți. Azi facem din ambele.',
  'Cea mai puternică piesă de pe tablă ești tu, când gândești două mutări în avans.',
]

export function randomQuip(): string {
  return CHESS_QUIPS[Math.floor(Math.random() * CHESS_QUIPS.length)]
}
