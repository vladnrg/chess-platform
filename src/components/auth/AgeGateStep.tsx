import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface Props {
  onComplete: (birthYear: number | null, parentalEmail: string | null) => void
}

export function AgeGateStep({ onComplete }: Props) {
  const [birthYear, setBirthYear] = useState('')
  const [parentalEmail, setParentalEmail] = useState('')
  const [step, setStep] = useState<'age' | 'parental'>('age')

  const currentYear = new Date().getFullYear()
  const age = birthYear ? currentYear - parseInt(birthYear) : null
  const isMinor = age !== null && age < 14

  function handleAgeSubmit() {
    const year = parseInt(birthYear)
    if (!year || year < 1900 || year > currentYear) return
    if (isMinor) {
      setStep('parental')
    } else {
      onComplete(year, null)
    }
  }

  function handleParentalSubmit() {
    if (!parentalEmail.includes('@')) return
    onComplete(parseInt(birthYear), parentalEmail)
  }

  if (step === 'parental') {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-[rgba(226,179,64,0.08)] border border-[rgba(226,179,64,0.3)] p-4">
          <p className="text-sm text-[#E2B340] font-semibold mb-1">Cont pentru minori</p>
          <p className="text-xs text-[#A0A0A0]">
            Deoarece ai sub 14 ani, contul tău necesită aprobarea unui părinte sau tutore.
            Vom trimite un email de confirmare la adresa introdusă mai jos.
          </p>
        </div>

        <div>
          <label className="text-xs text-[#6B6B6B] block mb-1.5">Email părinte / tutore</label>
          <Input
            type="email"
            placeholder="parinte@exemplu.com"
            value={parentalEmail}
            onChange={e => setParentalEmail(e.target.value)}
          />
        </div>

        <Button className="w-full" onClick={handleParentalSubmit} disabled={!parentalEmail.includes('@')}>
          Trimite cererea de aprobare
        </Button>

        <p className="text-xs text-[#6B6B6B] text-center">
          Contul va fi activat după ce părintele confirmă prin email.
        </p>
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

      <Button
        className="w-full"
        onClick={handleAgeSubmit}
        disabled={!birthYear || parseInt(birthYear) < 1940 || parseInt(birthYear) > currentYear}
      >
        Continuă
      </Button>
    </div>
  )
}
