# Verificări care rulează logica adevărată

Scripturi care importă **codul aplicaţiei**, nu o copie a lui, şi îl pun la
încercare pe banca live de puzzle-uri. Rostul lor e să prindă greşelile care nu
se văd la compilare: o probă care iese goală, un nivel calculat pe dos, o
repetiţie care se declanşează prea devreme.

Amândouă bug-urile din prima rulare au fost prinse aşa, nu din citit codul.

## Cum se rulează

```
node --experimental-strip-types --import ./scripts/verificari/register.mjs scripts/verificari/tactici.mjs
```

`register.mjs` + `alias-hook.mjs` rezolvă aliasul `@/` şi extensiile lipsă, ca
Node să poată importa direct din `src/` fără bundler.

## Ce acoperă `tactici.mjs`

- ce cartonaşe arată fiecare cufăr, şi că la master nu mai apare nicio temă cu nume;
- proba: zece poziţii, fără repetiţii, aceleaşi între rulări (ca progresul să se poată deduce);
- formatele de la master umplu traseul;
- harta punctelor slabe, pe încercări simulate din aceeaşi bandă de dificultate;
- repetiţia la interval: pragurile de 3 / 10 / 30 de zile;
- tema zilei: stabilă în aceeaşi zi, alta mâine, şi XP-ul dublu.
