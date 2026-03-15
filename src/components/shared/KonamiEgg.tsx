'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']

const EASTER_EGG_MESSAGES = [
  '🎮 Bhai tu bhi gamer nikla! Secret unlocked. Free chai for you at the trip.',
  '🕵️ Kya hacker hai yaar! Admin tujhse darta hai ab.',
  '🎯 Konami code? Really? Ok fine, respect. Have a virtual pani puri. 🥟',
  '🎉 Easter egg found! Achievement unlocked: "Probably overthinking this trip"',
  '🤓 7 Log Certified Nerd detected. Your nickname is now "Konami Bhai".',
]

export default function KonamiEgg() {
  const [, setKeys] = useState<string[]>([])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      setKeys((prev) => {
        const next = [...prev, e.key].slice(-KONAMI.length)
        if (next.join(',') === KONAMI.join(',')) {
          const msg = EASTER_EGG_MESSAGES[Math.floor(Math.random() * EASTER_EGG_MESSAGES.length)]
          toast(msg, { duration: 6000, icon: '🎮', style: { maxWidth: '400px' } })
          return []
        }
        return next
      })
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return null
}
