'use client'

import Script from 'next/script'
import { useEffect } from 'react'

export default function BuyMeCoffeeButton() {
  useEffect(() => {
    const createButton = () => {
      const btn = document.createElement('div')
      btn.className = 'fixed bottom-4 right-4 z-50'
      btn.innerHTML = `<a href="https://www.buymeacoffee.com/saya8iwasa7" target="_blank">
        <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 40px !important;width: 144px !important;">
      </a>`
      document.body.appendChild(btn)
    }

    createButton()
    return () => {
      const btn = document.querySelector('.bmc-btn')
      if (btn) btn.remove()
    }
  }, [])

  return null
}
