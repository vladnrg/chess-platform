import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { areNevoieDeAcord, VARSTA_ACORD_PARINTE } from '@/lib/varsta'

interface Props {
  onComplete: (birthYear: number, parentalEmail: string | null) => void
  /** Cât timp se salvează; butoanele stau inactive, ca să nu plece două cereri. */
  loading?: boolean
}

export function AgeGateStep({ onComplete, loading = false }: Props) {
  const [birthYear, setBirthYear] = useState('')
  const [parentalEmail, setParentalEmail] = useState('')
  const [step, setStep] = useState<'age' | 'parental'>('age')

  const currentYear = new Date().getFullYear()
  const year = parseInt(birthYear)
  const yearValid = !!year && year >= 1940 && year <= currentYear

  function handleAgeSubmit() {
    if (!yearValid) return
    if (areNevoieDeAcord(year)) {
      setStep('parental')
    } else {
      onComplete(year, null)
    }
  }

  function handleParentalSubmit() {
    if (!parentalEmail.includes('@')) return
    onComplete(year, parentalEmail.trim())
  }

  if (step === 'parental') {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-[rgba(226,179,64,0.08)] border border-[rgba(226,179,64,0.3)] p-4">
          <p className="text-sm text-[#E2B340] font-semibold mb-1">E nevoie de acordul unui părinte</p>
          <p className="text-xs text-[#A0A0A0]">
            Pentru că ai sub {VARSTA_ACORD_PARINTE} ani, legea cere ca un părinte sau tutore să fie de acord
            înainte să-ți putem folosi contul. Îi trimitem un email cu un buton de confirmare.
          </p>
        </div>

        <div>
          <label className="text-xs text-[#6B6B6B] block mb-1.5">Emailul părintelui sau tutorelui</label>
          <Input
            type="email"
            placeholder="parinte@exemplu.com"
            value={parentalEmail}
            onChange={e => setParentalEmail(e.target.value)}
          />
        </div>

        <Button
          className="w-full"
          onClick={handleParentalSubmit}
          loading={loading}
          disabled={loading || !parentalEmail.includes('@')}
        >
          Trimite cererea de acord
        </Button>

        <button
          type="button"
          onClick={() => setStep('age')}
          className="w-full text-xs text-[#6B6B6B] hover:text-[#F0F0F0]"
        >
          Înapoi: am greșit anul
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-[#6B6B6B] block mb-1.5">Anul nașterii</label>
        <Input
          type="number"
          placeholder="ex: 2012"
          min={1940}
          max={currentYear}
          value={birthYear}
          onChange={e => setBirthYear(e.target.value)}
        />
      </div>

      <Button className="w-full" onClick={handleAgeSubmit} loading={loading} disabled={loading || !yearValid}>
        Continuă
      </Button>
    </div>
  )
}
