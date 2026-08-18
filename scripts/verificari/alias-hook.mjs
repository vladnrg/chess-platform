// Rezolvă aliasul `@/` din tsconfig şi adaugă extensia `.ts` acolo unde codul
// sursă o omite (cum face Vite), ca scripturile de verificare să poată importa
// direct din src fără să treacă prin bundler.
import { pathToFileURL } from 'node:url'
import { resolve as caleAbs } from 'node:path'
import { existsSync } from 'node:fs'

const SRC = caleAbs(process.cwd(), 'src')

export function resolve(specifier, context, nextResolve) {
  let s = specifier
  if (s.startsWith('@/')) s = pathToFileURL(caleAbs(SRC, s.slice(2))).href
  if (/^(file:|\.)/.test(s) && !/\.[a-z]+$/i.test(s)) {
    const baza = s.startsWith('file:')
      ? new URL(s).pathname.replace(/^\/([A-Za-z]:)/, '$1')
      : caleAbs(new URL(context.parentURL).pathname.replace(/^\/([A-Za-z]:)/, '$1'), '..', s)
    for (const ext of ['.ts', '.tsx', '.js']) {
      if (existsSync(baza + ext)) return nextResolve(pathToFileURL(baza + ext).href, context)
    }
  }
  return nextResolve(s, context)
}
