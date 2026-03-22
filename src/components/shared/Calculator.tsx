'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Delete } from 'lucide-react'

interface Props {
  onClose: () => void
}

type Operator = '+' | '-' | '×' | '÷' | null

export default function Calculator({ onClose }: Props) {
  const [display,           setDisplay]           = useState('0')
  const [previous,          setPrevious]          = useState<number | null>(null)
  const [operator,          setOperator]          = useState<Operator>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const [splitResult,       setSplitResult]       = useState<string | null>(null)

  const currentValue = parseFloat(display)

  const inputDigit = (digit: string) => {
    setSplitResult(null)
    if (waitingForOperand) {
      setDisplay(digit)
      setWaitingForOperand(false)
    } else {
      setDisplay(display === '0' ? digit : display + digit)
    }
  }

  const inputDecimal = () => {
    setSplitResult(null)
    if (waitingForOperand) { setDisplay('0.'); setWaitingForOperand(false); return }
    if (!display.includes('.')) setDisplay(display + '.')
  }

  const clear = () => {
    setDisplay('0'); setPrevious(null); setOperator(null)
    setWaitingForOperand(false); setSplitResult(null)
  }

  const backspace = () => {
    setSplitResult(null)
    if (display.length === 1 || (display.length === 2 && display[0] === '-')) {
      setDisplay('0')
    } else {
      setDisplay(display.slice(0, -1))
    }
  }

  const toggleSign = () => {
    setSplitResult(null)
    setDisplay(String(currentValue * -1))
  }

  const percent = () => {
    setSplitResult(null)
    setDisplay(String(currentValue / 100))
  }

  const handleOperator = (op: Operator) => {
    setSplitResult(null)
    if (operator && !waitingForOperand) {
      const result = calculate(previous!, currentValue, operator)
      setDisplay(formatResult(result))
      setPrevious(result)
    } else {
      setPrevious(currentValue)
    }
    setOperator(op)
    setWaitingForOperand(true)
  }

  const calculate = (a: number, b: number, op: Operator): number => {
    switch (op) {
      case '+': return a + b
      case '-': return a - b
      case '×': return a * b
      case '÷': return b !== 0 ? a / b : 0
      default:  return b
    }
  }

  const formatResult = (n: number): string => {
    if (!isFinite(n)) return '0'
    const s = String(parseFloat(n.toFixed(10)))
    return s.length > 12 ? parseFloat(n.toPrecision(8)).toString() : s
  }

  const equals = () => {
    setSplitResult(null)
    if (!operator || previous === null) return
    const result = calculate(previous, currentValue, operator)
    setDisplay(formatResult(result))
    setPrevious(null); setOperator(null); setWaitingForOperand(true)
  }

  const splitBy7 = () => {
    const val = waitingForOperand && previous !== null ? previous : currentValue
    const split = val / 7
    setSplitResult(formatResult(split))
  }

  // Keyboard support
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key >= '0' && e.key <= '9') inputDigit(e.key)
    else if (e.key === '.') inputDecimal()
    else if (e.key === '+') handleOperator('+')
    else if (e.key === '-') handleOperator('-')
    else if (e.key === '*') handleOperator('×')
    else if (e.key === '/') { e.preventDefault(); handleOperator('÷') }
    else if (e.key === 'Enter' || e.key === '=') equals()
    else if (e.key === 'Backspace') backspace()
    else if (e.key === 'Escape') onClose()
    else if (e.key === 'c' || e.key === 'C') clear()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [display, previous, operator, waitingForOperand])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  const BTN_BASE = 'flex items-center justify-center rounded-2xl text-lg font-semibold h-14 w-full transition-all active:scale-95 select-none cursor-pointer'

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-xs bg-surface border border-subtle rounded-3xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <span className="text-sm font-heading font-bold text-muted">Calculator</span>
          <button onClick={onClose} className="p-2 text-muted hover:text-foreground transition-colors rounded-lg" aria-label="Close calculator">
            <X size={18} />
          </button>
        </div>

        {/* Display */}
        <div className="px-4 pb-3">
          <div className="bg-subtle/40 rounded-2xl p-4 text-right">
            {operator && (
              <p className="text-xs text-muted mb-1 font-mono">
                {previous} {operator}
              </p>
            )}
            <p className={`font-mono font-bold text-foreground break-all leading-none ${display.length > 10 ? 'text-xl' : 'text-4xl'}`}>
              {display}
            </p>
            {splitResult !== null && (
              <div className="mt-2 border-t border-primary/30 pt-2">
                <p className="text-xs text-primary font-medium">÷ 7 each person gets</p>
                <p className="text-2xl font-heading font-bold text-primary">₹ {splitResult}</p>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-4 gap-2 px-4 pb-4">
          {/* Row 1 */}
          <button onClick={clear}       className={`${BTN_BASE} bg-danger/20 text-danger hover:bg-danger/30`}>AC</button>
          <button onClick={toggleSign}  className={`${BTN_BASE} bg-subtle text-muted hover:bg-subtle/80`}>+/-</button>
          <button onClick={percent}     className={`${BTN_BASE} bg-subtle text-muted hover:bg-subtle/80`}>%</button>
          <button onClick={() => handleOperator('÷')} className={`${BTN_BASE} ${operator === '÷' ? 'bg-foreground text-base' : 'bg-warning/20 text-warning hover:bg-warning/30'}`}>÷</button>

          {/* Row 2 */}
          <button onClick={() => inputDigit('7')} className={`${BTN_BASE} bg-base/60 text-foreground hover:bg-base`}>7</button>
          <button onClick={() => inputDigit('8')} className={`${BTN_BASE} bg-base/60 text-foreground hover:bg-base`}>8</button>
          <button onClick={() => inputDigit('9')} className={`${BTN_BASE} bg-base/60 text-foreground hover:bg-base`}>9</button>
          <button onClick={() => handleOperator('×')} className={`${BTN_BASE} ${operator === '×' ? 'bg-foreground text-base' : 'bg-warning/20 text-warning hover:bg-warning/30'}`}>×</button>

          {/* Row 3 */}
          <button onClick={() => inputDigit('4')} className={`${BTN_BASE} bg-base/60 text-foreground hover:bg-base`}>4</button>
          <button onClick={() => inputDigit('5')} className={`${BTN_BASE} bg-base/60 text-foreground hover:bg-base`}>5</button>
          <button onClick={() => inputDigit('6')} className={`${BTN_BASE} bg-base/60 text-foreground hover:bg-base`}>6</button>
          <button onClick={() => handleOperator('-')} className={`${BTN_BASE} ${operator === '-' ? 'bg-foreground text-base' : 'bg-warning/20 text-warning hover:bg-warning/30'}`}>−</button>

          {/* Row 4 */}
          <button onClick={() => inputDigit('1')} className={`${BTN_BASE} bg-base/60 text-foreground hover:bg-base`}>1</button>
          <button onClick={() => inputDigit('2')} className={`${BTN_BASE} bg-base/60 text-foreground hover:bg-base`}>2</button>
          <button onClick={() => inputDigit('3')} className={`${BTN_BASE} bg-base/60 text-foreground hover:bg-base`}>3</button>
          <button onClick={() => handleOperator('+')} className={`${BTN_BASE} ${operator === '+' ? 'bg-foreground text-base' : 'bg-warning/20 text-warning hover:bg-warning/30'}`}>+</button>

          {/* Row 5 */}
          <button onClick={() => inputDigit('0')} className={`${BTN_BASE} bg-base/60 text-foreground hover:bg-base`}>0</button>
          <button onClick={inputDecimal}          className={`${BTN_BASE} bg-base/60 text-foreground hover:bg-base`}>.</button>
          <button onClick={backspace}             className={`${BTN_BASE} bg-base/60 text-muted hover:bg-base`}><Delete size={16} /></button>
          <button onClick={equals}                className={`${BTN_BASE} bg-primary text-primary-fg hover:bg-primary-dark`}>=</button>

          {/* Split by 7 */}
          <button
            onClick={splitBy7}
            className={`${BTN_BASE} col-span-4 bg-primary/15 border border-primary/40 text-primary hover:bg-primary/25 text-base gap-2`}
          >
            <span>÷ 7</span>
            <span className="text-xs text-primary/70 font-normal">Split among 7 log</span>
          </button>
        </div>
      </div>
    </div>
  )
}
