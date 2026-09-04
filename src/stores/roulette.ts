import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { formatMoney } from '../utils/currency'

export type RoundStage = 'desire' | 'chance' | 'amount' | 'result'
export type RoundStatus = 'won' | 'lost'

export interface Desire {
  id: string
  title: string
  emoji: string
  baseProbability: number
}

export interface PlayRecord {
  id: string
  desireId: string
  desireTitle: string
  emoji: string
  date: string
  status: RoundStatus
  chance: number
  amount?: number
  minAmount?: number
  maxAmount?: number
}

export interface RoundResult {
  kind: 'chance' | 'amount'
  won: boolean
  chance: number
  amount?: number
}

const STORAGE_KEY = 'food-roulette-state'

const defaultDesires: Desire[] = [
  { id: 'street-food', title: 'Comer en la calle', emoji: '🌮', baseProbability: 33 },
  { id: 'movie-night', title: 'Noche de cine', emoji: '🎬', baseProbability: 28 },
  { id: 'weekend-trip', title: 'Escapada de fin de semana', emoji: '🧳', baseProbability: 18 },
]

function readState() {
  if (typeof window === 'undefined') return null

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

function isThisMonth(date: string) {
  const value = new Date(date)
  const now = new Date()
  return value.getFullYear() === now.getFullYear() && value.getMonth() === now.getMonth()
}

export const useRouletteStore = defineStore('roulette', () => {
  const saved = readState()
  const desires = ref<Desire[]>(Array.isArray(saved?.desires) ? saved.desires : structuredClone(defaultDesires))
  const monthlyBudget = ref<number>(typeof saved?.monthlyBudget === 'number' ? saved.monthlyBudget : 150)
  const records = ref<PlayRecord[]>(Array.isArray(saved?.records) ? saved.records : [])

  const stage = ref<RoundStage>('desire')
  const selectedDesireId = ref<string | null>(null)
  const lastResult = ref<RoundResult | null>(null)
  const draftMinAmount = ref(10)
  const draftMaxAmount = ref(45)
  const isSpinning = ref(false)

  const monthlyRecords = computed(() => records.value.filter((record) => isThisMonth(record.date)))
  const successfulThisMonth = computed(() => monthlyRecords.value.filter((record) => record.status === 'won').length)
  const spentThisMonth = computed(() =>
    monthlyRecords.value.reduce((total, record) => total + (record.status === 'won' ? record.amount ?? 0 : 0), 0),
  )
  const remainingBudget = computed(() => Math.max(0, monthlyBudget.value - spentThisMonth.value))
  const budgetUsedPercent = computed(() => {
    if (monthlyBudget.value <= 0) return 100
    return Math.min(100, Math.round((spentThisMonth.value / monthlyBudget.value) * 100))
  })
  const isBudgetExhausted = computed(() => monthlyBudget.value <= 0 || spentThisMonth.value >= monthlyBudget.value)
  const canPlay = computed(() => desires.value.length > 0 && !isBudgetExhausted.value && !isSpinning.value)
  const selectedDesire = computed(() => desires.value.find((desire) => desire.id === selectedDesireId.value) ?? null)
  const recentRecords = computed(() => [...records.value].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4))

  function getDesireStats(desireId: string) {
    const desireRecords = monthlyRecords.value.filter((record) => record.desireId === desireId)
    const wins = desireRecords.filter((record) => record.status === 'won').length
    const losses = desireRecords.filter((record) => record.status === 'lost').length
    const desire = desires.value.find((item) => item.id === desireId)
    const budgetPenalty = Math.round(budgetUsedPercent.value * 0.12)
    const historyPenalty = wins * 8 + losses * 2
    const effectiveChance = Math.max(5, Math.min(95, Math.round((desire?.baseProbability ?? 33) - historyPenalty - budgetPenalty)))

    return {
      attempts: desireRecords.length,
      wins,
      losses,
      effectiveChance,
      historyPenalty,
      budgetPenalty,
    }
  }

  function persist() {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      desires: desires.value,
      monthlyBudget: monthlyBudget.value,
      records: records.value,
    }))
  }

  watch([desires, monthlyBudget, records], persist, { deep: true })

  function startRound(desireId: string) {
    if (!canPlay.value || !desires.value.some((desire) => desire.id === desireId)) return
    selectedDesireId.value = desireId
    lastResult.value = null
    stage.value = 'chance'
  }

  function spinChance() {
    if (stage.value !== 'chance' || !selectedDesire.value || !canPlay.value) return

    isSpinning.value = true
    const desire = selectedDesire.value
    const chance = getDesireStats(desire.id).effectiveChance

    window.setTimeout(() => {
      const won = Math.random() * 100 < chance
      lastResult.value = { kind: 'chance', won, chance }
      isSpinning.value = false

      if (won) {
        stage.value = 'amount'
        return
      }

      records.value.push({
        id: crypto.randomUUID(),
        desireId: desire.id,
        desireTitle: desire.title,
        emoji: desire.emoji,
        date: new Date().toISOString(),
        status: 'lost',
        chance,
      })
      stage.value = 'result'
    }, 1100)
  }

  function spinAmount() {
    if (stage.value !== 'amount' || !selectedDesire.value || !lastResult.value?.won || isSpinning.value) return

    const min = Math.max(0, Math.round(Number(draftMinAmount.value) || 0))
    const max = Math.max(min, Math.round(Number(draftMaxAmount.value) || min))
    draftMinAmount.value = min
    draftMaxAmount.value = max
    isSpinning.value = true

    window.setTimeout(() => {
      const amount = Math.floor(Math.random() * (max - min + 1)) + min
      const desire = selectedDesire.value
      if (!desire) return

      lastResult.value = { kind: 'amount', won: true, chance: lastResult.value?.chance ?? 0, amount }
      records.value.push({
        id: crypto.randomUUID(),
        desireId: desire.id,
        desireTitle: desire.title,
        emoji: desire.emoji,
        date: new Date().toISOString(),
        status: 'won',
        chance: lastResult.value.chance,
        amount,
        minAmount: min,
        maxAmount: max,
      })
      isSpinning.value = false
      stage.value = 'result'
    }, 1100)
  }

  function finishRound() {
    stage.value = 'desire'
    selectedDesireId.value = null
    lastResult.value = null
  }

  function addDesire(title: string, emoji: string, baseProbability: number) {
    const cleanTitle = title.trim()
    if (!cleanTitle) return false

    desires.value.push({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title: cleanTitle,
      emoji: emoji.trim() || '✨',
      baseProbability: Math.max(5, Math.min(95, Math.round(baseProbability || 33))),
    })
    return true
  }

  function removeDesire(desireId: string) {
    desires.value = desires.value.filter((desire) => desire.id !== desireId)
    if (selectedDesireId.value === desireId) finishRound()
  }

  function resetAll() {
    desires.value = structuredClone(defaultDesires)
    monthlyBudget.value = 150
    records.value = []
    finishRound()
  }

  return {
    desires,
    monthlyBudget,
    records,
    monthlyRecords,
    successfulThisMonth,
    spentThisMonth,
    remainingBudget,
    budgetUsedPercent,
    isBudgetExhausted,
    canPlay,
    stage,
    selectedDesire,
    lastResult,
    draftMinAmount,
    draftMaxAmount,
    isSpinning,
    recentRecords,
    getDesireStats,
    formatMoney,
    startRound,
    spinChance,
    spinAmount,
    finishRound,
    addDesire,
    removeDesire,
    resetAll,
  }
})
