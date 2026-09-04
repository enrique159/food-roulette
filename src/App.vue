<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useRouletteStore } from './stores/roulette'

const route = useRoute()
const store = useRouletteStore()
const drawerOpen = ref(false)

const pageTitles: Record<string, string> = {
  home: 'Ruleta de deseos',
  history: 'Histórico',
  settings: 'Configuración',
}

const pageTitle = computed(() => pageTitles[String(route.name)] ?? 'Ruleta de deseos')
const userInitials = computed(() => {
  const name = store.userName.trim()
  if (!name) return 'FR'
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
})

const navigation = [
  { to: '/', name: 'home', icon: '✦', label: 'Ruleta' },
  { to: '/history', name: 'history', icon: '◷', label: 'Histórico' },
  { to: '/settings', name: 'settings', icon: '⚙', label: 'Configuración' },
]

function closeDrawer() {
  drawerOpen.value = false
}
</script>

<template>
  <div class="min-h-screen bg-base-200 text-base-content">
    <div class="drawer lg:drawer-open">
      <input id="app-drawer" v-model="drawerOpen" type="checkbox" class="drawer-toggle" />

      <div class="drawer-content flex min-h-screen flex-col">
        <header class="navbar sticky top-0 z-20 border-b border-base-300 bg-base-100/95 px-4 backdrop-blur lg:px-8">
          <div class="flex-none lg:hidden">
            <label for="app-drawer" aria-label="Abrir menú" class="btn btn-square btn-ghost text-xl">☰</label>
          </div>
          <div class="flex-1 px-2">
            <div>
              <p class="text-xs font-bold uppercase tracking-[0.22em] text-primary">Food roulette</p>
              <h1 class="font-display text-lg font-extrabold tracking-tight sm:text-xl">{{ pageTitle }}</h1>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <div class="hidden items-center gap-2 rounded-full bg-base-200 px-3 py-2 text-xs font-bold text-base-content/70 sm:flex">
              <span class="h-2 w-2 rounded-full bg-success"></span>
              {{ store.successfulThisMonth }} cumplidas este mes
            </div>
            <div class="avatar placeholder">
              <div class="w-10 rounded-full bg-primary text-primary-content flex justify-center items-center">
                <span class="text-sm font-black">{{ userInitials }}</span>
              </div>
            </div>
          </div>
        </header>

        <main class="w-full flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <div class="mx-auto max-w-7xl">
            <RouterView />
          </div>
        </main>

        <footer class="border-t border-base-300 bg-base-100 px-6 py-4 text-center text-xs text-base-content/50">
          Hecho para decidir con un poco más de emoción.
        </footer>
      </div>

      <aside class="drawer-side z-30">
        <label for="app-drawer" aria-label="Cerrar menú" class="drawer-overlay"></label>
        <div class="flex min-h-full w-72 flex-col bg-neutral px-5 py-6 text-neutral-content">
          <div class="mb-10 flex items-center gap-3 px-2">
            <div class="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-2xl text-primary-content shadow-lg shadow-primary/20">◉</div>
            <div>
              <p class="font-display text-lg font-black tracking-tight">Food Roulette</p>
              <p class="text-xs text-neutral-content/55">Hola, {{ store.userName || 'decisor' }}</p>
            </div>
          </div>

          <div class="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.24em] text-neutral-content/40">Menú</div>
          <ul class="menu w-full gap-2 p-0">
            <li v-for="item in navigation" :key="item.name">
              <RouterLink
                :to="item.to"
                class="rounded-2xl px-4 py-3 font-bold text-neutral-content/70"
                active-class="bg-primary text-primary-content shadow-lg shadow-primary/20"
                @click="closeDrawer"
              >
                <span class="w-6 text-center text-lg">{{ item.icon }}</span>
                {{ item.label }}
              </RouterLink>
            </li>
          </ul>

          <div class="mt-auto rounded-3xl border border-neutral-content/10 bg-neutral-content/5 p-4">
            <div class="mb-3 flex items-start justify-between gap-3">
              <div>
                <p class="text-xs font-bold uppercase tracking-wider text-neutral-content/45">Presupuesto mensual</p>
                <p class="mt-1 text-2xl font-black">{{ store.formatMoney(store.remainingBudget) }}</p>
              </div>
              <span class="badge badge-sm border-0 bg-secondary/20 text-secondary">disponible</span>
            </div>
            <progress class="progress progress-secondary h-2 w-full" :value="store.budgetUsedPercent" max="100"></progress>
            <p class="mt-2 text-xs text-neutral-content/50">{{ store.formatMoney(store.spentThisMonth) }} usados de {{ store.formatMoney(store.monthlyBudget) }}</p>
          </div>

          <p class="mt-5 px-2 text-xs text-neutral-content/30">v1.0 · Tus datos viven en este dispositivo</p>
        </div>
      </aside>
    </div>
  </div>
</template>
