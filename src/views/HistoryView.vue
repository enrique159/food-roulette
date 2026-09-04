<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useRouletteStore } from '../stores/roulette'
import { formatDate } from '../utils/currency'

const store = useRouletteStore()
const filter = ref<'all' | 'won' | 'lost'>('all')

const filteredRecords = computed(() => {
  const filtered = filter.value === 'all' ? store.records : store.records.filter((record) => record.status === filter.value)
  return [...filtered].sort((a, b) => b.date.localeCompare(a.date))
})

const averageSpend = computed(() => {
  const wins = store.monthlyRecords.filter((record) => record.status === 'won')
  if (!wins.length) return 0
  return Math.round(store.spentThisMonth / wins.length)
})
</script>

<template>
  <div class="space-y-7">
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <div class="breadcrumbs mb-3 text-xs text-base-content/45"><ul><li><RouterLink to="/">Ruleta</RouterLink></li><li>Histórico</li></ul></div>
        <h2 class="font-display text-3xl font-black tracking-tight sm:text-4xl">Todo lo que ha pasado</h2>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-base-content/55">Cada resultado se guarda en tu dispositivo y vuelve a entrar en la fórmula de probabilidad de tus deseos.</p>
      </div>
      <RouterLink to="/" class="btn btn-primary rounded-xl font-black">Jugar otra vez <span aria-hidden="true">↗</span></RouterLink>
    </div>

    <div class="grid gap-4 sm:grid-cols-3">
      <div class="card border border-base-300 bg-base-100 shadow-sm"><div class="card-body p-5"><p class="text-xs font-bold uppercase tracking-wider text-base-content/45">Giros totales</p><p class="mt-2 font-display text-3xl font-black">{{ store.records.length }}</p><p class="text-xs text-base-content/50">en toda la historia</p></div></div>
      <div class="card border border-base-300 bg-base-100 shadow-sm"><div class="card-body p-5"><p class="text-xs font-bold uppercase tracking-wider text-base-content/45">Este mes</p><p class="mt-2 font-display text-3xl font-black text-success">{{ store.successfulThisMonth }}</p><p class="text-xs text-base-content/50">deseos cumplidos</p></div></div>
      <div class="card border border-base-300 bg-base-100 shadow-sm"><div class="card-body p-5"><p class="text-xs font-bold uppercase tracking-wider text-base-content/45">Gasto promedio</p><p class="mt-2 font-display text-3xl font-black">{{ store.formatMoney(averageSpend) }}</p><p class="text-xs text-base-content/50">por deseo cumplido este mes</p></div></div>
    </div>

    <section class="card border border-base-300 bg-base-100 shadow-sm">
      <div class="card-body p-5 sm:p-7">
        <div class="flex flex-col justify-between gap-4 border-b border-base-200 pb-5 sm:flex-row sm:items-center">
          <div>
            <h2 class="font-display text-xl font-black">Registro de giros</h2>
            <p class="mt-1 text-xs text-base-content/50">Los más recientes aparecen primero</p>
          </div>
          <div class="tabs tabs-boxed bg-base-200 p-1">
            <button class="tab h-8 rounded-lg px-3 text-xs font-bold" :class="filter === 'all' && 'tab-active bg-base-100 text-base-content shadow-sm'" @click="filter = 'all'">Todos</button>
            <button class="tab h-8 rounded-lg px-3 text-xs font-bold" :class="filter === 'won' && 'tab-active bg-base-100 text-success shadow-sm'" @click="filter = 'won'">Cumplidos</button>
            <button class="tab h-8 rounded-lg px-3 text-xs font-bold" :class="filter === 'lost' && 'tab-active bg-base-100 text-base-content shadow-sm'" @click="filter = 'lost'">No tocó</button>
          </div>
        </div>

        <div v-if="filteredRecords.length" class="overflow-x-auto pt-3">
          <table class="table">
            <thead><tr class="text-[11px] uppercase tracking-wider text-base-content/45"><th>Deseo</th><th>Fecha</th><th>Probabilidad</th><th>Rango</th><th class="text-right">Resultado</th></tr></thead>
            <tbody>
              <tr v-for="record in filteredRecords" :key="record.id" class="hover:bg-base-200/60">
                <td><div class="flex min-w-48 items-center gap-3"><span class="grid h-10 w-10 place-items-center rounded-xl bg-base-200 text-xl">{{ record.emoji }}</span><span class="font-bold">{{ record.desireTitle }}</span></div></td>
                <td class="whitespace-nowrap text-sm text-base-content/60">{{ formatDate(record.date) }}</td>
                <td><span class="badge badge-ghost font-bold">{{ record.chance }}%</span></td>
                <td class="text-sm text-base-content/55">{{ record.status === 'won' ? `${store.formatMoney(record.minAmount ?? 0)} – ${store.formatMoney(record.maxAmount ?? 0)}` : '—' }}</td>
                <td class="text-right"><span v-if="record.status === 'won'" class="badge border-0 bg-success/15 font-bold text-success">+{{ store.formatMoney(record.amount ?? 0) }}</span><span v-else class="badge border-0 bg-base-200 font-bold text-base-content/50">No tocó</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="py-16 text-center">
          <div class="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-base-200 text-3xl">◷</div>
          <h3 class="mt-4 font-display text-lg font-black">Todavía no hay resultados aquí</h3>
          <p class="mx-auto mt-2 max-w-sm text-sm text-base-content/50">{{ filter === 'all' ? 'Gira la ruleta para empezar a construir tu historial.' : 'Prueba con otro filtro o juega una nueva ronda.' }}</p>
          <RouterLink to="/" class="btn btn-primary btn-sm mt-5 rounded-xl">Ir a la ruleta</RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>
