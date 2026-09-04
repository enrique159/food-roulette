<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useRouletteStore } from '../stores/roulette'
import { formatDate } from '../utils/currency'

const store = useRouletteStore()

const monthLabel = new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' }).format(new Date())
const rangePresets = [
  { label: 'Algo ligero', min: 10, max: 25 },
  { label: 'Plan casual', min: 25, max: 50 },
  { label: 'Date un gusto', min: 50, max: 100 },
  { label: 'Plan especial', min: 100, max: 250 },
]

const selectedStats = computed(() => {
  if (!store.selectedDesire) return null
  return store.getDesireStats(store.selectedDesire.id)
})

const chanceStyle = computed(() => ({ '--value': String(selectedStats.value?.effectiveChance ?? 0) }))
const totalAttempts = computed(() => store.monthlyRecords.length)

function selectRange(min: number, max: number) {
  store.draftMinAmount = min
  store.draftMaxAmount = max
}
</script>

<template>
  <div class="space-y-6">
    <section class="relative overflow-hidden rounded-[2rem] bg-neutral p-6 text-neutral-content shadow-xl shadow-neutral/10 sm:p-8 lg:p-10">
      <div class="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-primary/30 blur-3xl"></div>
      <div class="absolute -bottom-28 right-32 h-48 w-48 rounded-full bg-secondary/20 blur-3xl"></div>
      <div class="relative max-w-2xl">
        <div class="mb-5 flex flex-wrap items-center gap-2">
          <span class="badge border-0 bg-primary font-bold text-primary-content">{{ monthLabel }}</span>
          <span class="badge badge-outline border-neutral-content/20 text-neutral-content/60">azar con intención</span>
        </div>
        <h2 class="font-display text-3xl font-black leading-tight tracking-tight sm:text-5xl">Deja que el azar decida<br /><span class="text-primary">lo que sigue.</span></h2>
        <p class="mt-4 max-w-xl text-sm leading-6 text-neutral-content/65 sm:text-base">Una decisión, dos giros y un límite claro. Tu historial ajusta las probabilidades para mantener tus deseos en equilibrio.</p>
        <div class="mt-7 flex flex-wrap gap-3">
          <a href="#roulette" class="btn btn-primary rounded-xl px-5 font-extrabold">Empezar a jugar <span aria-hidden="true">↓</span></a>
          <RouterLink to="/settings" class="btn btn-ghost rounded-xl border border-neutral-content/15 text-neutral-content hover:bg-neutral-content/10">Ajustar reglas</RouterLink>
        </div>
      </div>
      <div class="absolute bottom-7 right-8 hidden select-none text-right lg:block">
        <p class="font-display text-6xl font-black leading-none text-neutral-content/10">01</p>
        <p class="mt-2 text-xs font-bold uppercase tracking-[0.25em] text-neutral-content/35">elige · gira · disfruta</p>
      </div>
    </section>

    <div v-if="store.isBudgetExhausted" class="alert border border-warning/20 bg-warning/10 text-warning-content shadow-sm">
      <span class="text-2xl">◒</span>
      <div>
        <h3 class="font-extrabold">Tu presupuesto está pausado</h3>
        <p class="text-sm opacity-80">Ya alcanzaste el límite de {{ store.formatMoney(store.monthlyBudget) }} este mes. Podrás volver a jugar al comenzar el siguiente mes.</p>
      </div>
      <RouterLink to="/settings" class="btn btn-sm border-0 bg-warning text-warning-content">Ver presupuesto</RouterLink>
    </div>

    <div class="grid gap-4 sm:grid-cols-3">
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <p class="text-xs font-bold uppercase tracking-wider text-base-content/50">Disponible</p>
            <span class="grid h-8 w-8 place-items-center rounded-xl bg-secondary/10 text-secondary">$</span>
          </div>
          <p class="mt-2 font-display text-3xl font-black">{{ store.formatMoney(store.remainingBudget) }}</p>
          <progress class="progress progress-secondary mt-1 h-2" :value="store.budgetUsedPercent" max="100"></progress>
          <p class="mt-1 text-xs text-base-content/50">{{ store.budgetUsedPercent }}% del presupuesto usado</p>
        </div>
      </div>
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <p class="text-xs font-bold uppercase tracking-wider text-base-content/50">Deseos activos</p>
            <span class="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">✦</span>
          </div>
          <p class="mt-2 font-display text-3xl font-black">{{ store.desires.length }}</p>
          <p class="mt-2 text-xs text-base-content/50">Cada uno tiene su propia probabilidad</p>
        </div>
      </div>
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <p class="text-xs font-bold uppercase tracking-wider text-base-content/50">Intentos del mes</p>
            <span class="grid h-8 w-8 place-items-center rounded-xl bg-info/10 text-info">◷</span>
          </div>
          <p class="mt-2 font-display text-3xl font-black">{{ totalAttempts }}</p>
          <p class="mt-2 text-xs text-base-content/50">{{ store.successfulThisMonth }} deseos cumplidos</p>
        </div>
      </div>
    </div>

    <div id="roulette" class="grid grid-cols-1 scroll-mt-24 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.6fr)]">
      <section class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5 sm:p-7">
          <div class="flex flex-wrap items-start justify-between gap-4 border-b border-base-200 pb-5">
            <div>
              <div class="mb-2 flex items-center gap-2">
                <span class="badge badge-primary badge-sm font-black">PASO {{ store.stage === 'desire' ? '01' : store.stage === 'chance' ? '02' : store.stage === 'amount' ? '03' : '04' }}</span>
                <span class="text-xs font-bold uppercase tracking-wider text-base-content/40">{{ store.stage === 'desire' ? 'elige un deseo' : store.stage === 'chance' ? 'prueba tu suerte' : store.stage === 'amount' ? 'define el gasto' : 'resultado' }}</span>
              </div>
              <h2 class="font-display text-2xl font-black tracking-tight sm:text-3xl">
                {{ store.stage === 'desire' ? '¿Qué se te antoja?' : store.stage === 'chance' ? '¿Hoy toca?' : store.stage === 'amount' ? '¿Cuánto quieres gastar?' : 'La ruleta ha hablado' }}
              </h2>
              <p class="mt-2 text-sm text-base-content/55">
                {{ store.stage === 'desire' ? 'Escoge un deseo y revisa su probabilidad actual.' : store.stage === 'chance' ? 'El historial y tu presupuesto ya ajustaron este porcentaje.' : store.stage === 'amount' ? 'Elige un rango rápido o escribe tus propios límites.' : 'Guarda el momento o vuelve a poner algo en juego.' }}
              </p>
            </div>
            <button v-if="store.stage !== 'desire'" class="btn btn-ghost btn-sm rounded-xl" @click="store.finishRound">Cancelar</button>
          </div>

          <div v-if="store.stage === 'desire'" class="space-y-3 pt-6">
            <button
              v-for="desire in store.desires"
              :key="desire.id"
              class="group flex w-full items-center gap-4 rounded-2xl border border-base-300 bg-base-100 p-4 text-left hover:border-primary/50 hover:bg-primary/[0.03] disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="!store.canPlay"
              @click="store.startRound(desire.id)"
            >
              <span class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-base-200 text-2xl group-hover:bg-primary/10">{{ desire.emoji }}</span>
              <span class="min-w-0 flex-1">
                <span class="block truncate font-extrabold">{{ desire.title }}</span>
                <span class="mt-1 block text-xs text-base-content/50">{{ store.getDesireStats(desire.id).attempts }} intentos este mes · base {{ desire.baseProbability }}%</span>
              </span>
              <span class="hidden text-right sm:block">
                <span class="block font-display text-lg font-black text-primary">{{ store.getDesireStats(desire.id).effectiveChance }}%</span>
                <span class="block text-[10px] font-bold uppercase tracking-wider text-base-content/40">prob. actual</span>
              </span>
              <span class="btn btn-sm btn-primary rounded-xl px-3">Probar <span aria-hidden="true">→</span></span>
            </button>
            <div v-if="!store.desires.length" class="rounded-2xl border border-dashed border-base-300 p-8 text-center">
              <p class="font-extrabold">Aún no hay deseos</p>
              <RouterLink to="/settings" class="btn btn-link btn-sm mt-2">Agrega el primero desde configuración</RouterLink>
            </div>
            <div v-if="store.desires.length && !store.canPlay" class="alert mt-5 border border-base-300 bg-base-200 text-sm">
              <span>◒</span>
              <span>Configura un presupuesto mayor a cero para volver a jugar.</span>
            </div>
          </div>

          <div v-else-if="store.stage === 'chance' && store.selectedDesire" class="grid items-center gap-8 py-8 md:grid-cols-[0.8fr_1.2fr]">
            <div class="flex justify-center">
              <div class="radial-progress bg-base-200 text-primary shadow-inner" :style="chanceStyle" role="progressbar" aria-label="Probabilidad actual">
                <span class="font-display text-2xl font-black">{{ selectedStats?.effectiveChance }}%</span>
              </div>
            </div>
            <div>
              <div class="mb-5 flex items-center gap-3">
                <span class="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-3xl">{{ store.selectedDesire.emoji }}</span>
                <div>
                  <p class="text-xs font-bold uppercase tracking-wider text-base-content/45">Tu deseo</p>
                  <h3 class="font-display text-xl font-black">{{ store.selectedDesire.title }}</h3>
                </div>
              </div>
              <div class="mb-5 rounded-2xl bg-base-200 p-4 text-sm">
                <div class="flex justify-between"><span class="text-base-content/55">Probabilidad base</span><strong>{{ store.selectedDesire.baseProbability }}%</strong></div>
                <div class="mt-2 flex justify-between"><span class="text-base-content/55">Ajuste por historial</span><strong class="text-warning">-{{ (selectedStats?.historyPenalty ?? 0) + (selectedStats?.budgetPenalty ?? 0) }} pp</strong></div>
              </div>
              <button class="btn btn-primary btn-lg w-full rounded-2xl font-black shadow-lg shadow-primary/20" :disabled="store.isSpinning" @click="store.spinChance">
                <span v-if="store.isSpinning" class="loading loading-spinner loading-sm"></span>
                {{ store.isSpinning ? 'Girando...' : 'Girar la ruleta' }} <span v-if="!store.isSpinning" aria-hidden="true">↗</span>
              </button>
            </div>
          </div>

          <div v-else-if="store.stage === 'amount'" class="space-y-7 py-6">
            <div class="rounded-2xl border border-success/20 bg-success/10 p-5 text-center">
              <span class="text-3xl">🎉</span>
              <p class="mt-2 font-display text-xl font-black text-success">¡Sí toca {{ store.selectedDesire?.title.toLowerCase() }}!</p>
              <p class="mt-1 text-sm text-base-content/60">Ahora la ruleta elegirá cuánto puedes gastar.</p>
            </div>
            <div>
              <p class="mb-3 text-xs font-bold uppercase tracking-wider text-base-content/50">Rangos rápidos</p>
              <div class="flex flex-wrap gap-2">
                <button v-for="preset in rangePresets" :key="preset.label" class="badge badge-lg cursor-pointer border-base-300 bg-base-100 px-4 py-4 font-bold hover:border-primary hover:text-primary" @click="selectRange(preset.min, preset.max)">
                  {{ preset.label }} <span class="ml-1 text-xs opacity-55">{{ store.formatMoney(preset.min) }}–{{ store.formatMoney(preset.max) }}</span>
                </button>
              </div>
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <label class="form-control w-full">
                <span class="label"><span class="label-text text-xs font-bold uppercase tracking-wider">Mínimo</span><span class="label-text-alt">MXN</span></span>
                <input v-model.number="store.draftMinAmount" type="number" min="0" class="input input-bordered w-full rounded-xl text-lg font-bold" />
              </label>
              <label class="form-control w-full">
                <span class="label"><span class="label-text text-xs font-bold uppercase tracking-wider">Máximo</span><span class="label-text-alt">MXN</span></span>
                <input v-model.number="store.draftMaxAmount" type="number" min="0" class="input input-bordered w-full rounded-xl text-lg font-bold" />
              </label>
            </div>
            <button class="btn btn-primary btn-lg w-full rounded-2xl font-black shadow-lg shadow-primary/20" :disabled="store.isSpinning" @click="store.spinAmount">
              <span v-if="store.isSpinning" class="loading loading-spinner loading-sm"></span>
              {{ store.isSpinning ? 'Calculando monto...' : 'Girar monto' }} <span v-if="!store.isSpinning" aria-hidden="true">↗</span>
            </button>
          </div>

          <div v-else class="flex flex-col items-center py-10 text-center">
            <template v-if="store.lastResult?.won">
              <div class="grid h-24 w-24 place-items-center rounded-[2rem] bg-success/10 text-5xl">💸</div>
              <p class="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-success">Resultado final</p>
              <h3 class="mt-2 font-display text-4xl font-black tracking-tight">{{ store.formatMoney(store.lastResult.amount ?? 0) }}</h3>
              <p class="mt-2 max-w-sm text-sm text-base-content/55">Tu deseo de <strong>{{ store.selectedDesire?.title.toLowerCase() }}</strong> tiene luz verde. ¡Disfrútalo sin culpa!</p>
            </template>
            <template v-else>
              <div class="grid h-24 w-24 place-items-center rounded-[2rem] bg-base-200 text-5xl">🌙</div>
              <p class="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-base-content/45">Resultado final</p>
              <h3 class="mt-2 font-display text-3xl font-black tracking-tight">Esta vez no toca</h3>
              <p class="mt-2 max-w-sm text-sm text-base-content/55">La ruleta cuidó tu presupuesto. Tu intento quedó guardado y afectará el próximo porcentaje.</p>
            </template>
            <button class="btn btn-primary mt-8 rounded-2xl px-8 font-black" @click="store.finishRound">Volver a elegir <span aria-hidden="true">↗</span></button>
          </div>
        </div>
      </section>

      <aside class="space-y-6">
        <section class="card border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body p-5 sm:p-6">
            <div class="mb-4 flex items-center justify-between">
              <div>
                <h2 class="font-display text-lg font-black">Últimos resultados</h2>
                <p class="text-xs text-base-content/50">Tu historial reciente</p>
              </div>
              <RouterLink to="/history" class="btn btn-ghost btn-xs rounded-lg text-primary">Ver todo →</RouterLink>
            </div>
            <div v-if="store.recentRecords.length" class="divide-y divide-base-200">
              <div v-for="record in store.recentRecords" :key="record.id" class="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-base-200 text-xl">{{ record.emoji }}</span>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-bold">{{ record.desireTitle }}</p>
                  <p class="mt-0.5 text-xs text-base-content/45">{{ formatDate(record.date) }}</p>
                </div>
                <div class="text-right">
                  <span v-if="record.status === 'won'" class="badge badge-sm border-0 bg-success/15 font-bold text-success">+{{ store.formatMoney(record.amount ?? 0) }}</span>
                  <span v-else class="badge badge-sm border-0 bg-base-200 font-bold text-base-content/50">No tocó</span>
                </div>
              </div>
            </div>
            <div v-else class="rounded-2xl bg-base-200 p-5 text-center">
              <span class="text-2xl">✦</span>
              <p class="mt-2 text-sm font-bold">Tu historia comienza aquí</p>
              <p class="mt-1 text-xs text-base-content/50">Cada giro aparecerá en este espacio.</p>
            </div>
          </div>
        </section>

        <section class="card overflow-hidden border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body p-5 sm:p-6">
            <div class="mb-4 flex items-center gap-3">
              <span class="grid h-10 w-10 place-items-center rounded-xl bg-secondary/10 text-secondary">◎</span>
              <div>
                <h2 class="font-display text-lg font-black">Reglas del juego</h2>
                <p class="text-xs text-base-content/50">Así cuidamos tus deseos</p>
              </div>
            </div>
            <ul class="space-y-3 text-sm text-base-content/65">
              <li class="flex gap-3"><span class="font-black text-primary">01</span><span>La probabilidad empieza con tu valor base.</span></li>
              <li class="flex gap-3"><span class="font-black text-primary">02</span><span>Cada intento y cumplimiento ajustan el siguiente giro.</span></li>
              <li class="flex gap-3"><span class="font-black text-primary">03</span><span>Al llegar al presupuesto mensual, la ruleta se pausa.</span></li>
            </ul>
          </div>
          <div class="bg-primary/5 px-5 py-3 text-xs font-bold text-primary sm:px-6">Puedes cambiar todas las reglas desde Configuración.</div>
        </section>
      </aside>
    </div>
  </div>
</template>
