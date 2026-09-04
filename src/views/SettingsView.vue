<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useRouletteStore } from '../stores/roulette'

const store = useRouletteStore()
const newTitle = ref('')
const newEmoji = ref('✨')
const newProbability = ref(33)
const savedNotice = ref(false)
const currentMonth = new Intl.DateTimeFormat('es-MX', { month: 'long' }).format(new Date())

function addDesire() {
  if (!store.addDesire(newTitle.value, newEmoji.value, newProbability.value)) return
  newTitle.value = ''
  newEmoji.value = '✨'
  newProbability.value = 33
  savedNotice.value = true
  window.setTimeout(() => { savedNotice.value = false }, 2200)
}

function resetApp() {
  if (window.confirm('¿Quieres borrar tu historial y restaurar los deseos iniciales?')) store.resetAll()
}
</script>

<template>
  <div class="space-y-7">
    <div>
      <div class="breadcrumbs mb-3 text-xs text-base-content/45"><ul><li><RouterLink to="/">Ruleta</RouterLink></li><li>Configuración</li></ul></div>
      <h2 class="font-display text-3xl font-black tracking-tight sm:text-4xl">Tus reglas, a tu manera</h2>
      <p class="mt-2 max-w-2xl text-sm leading-6 text-base-content/55">Personaliza cuánto puedes dedicar y qué deseos quieres poner en juego. Todo se guarda automáticamente en este dispositivo.</p>
    </div>

    <div v-if="savedNotice" class="alert alert-success border-0 shadow-sm"><span>✓</span><span class="font-bold">Deseo agregado. Ya está listo para jugar.</span></div>

    <section class="card border border-base-300 bg-base-100 shadow-sm">
      <div class="card-body p-5 sm:p-7">
        <div class="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div class="flex gap-4">
            <span class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-secondary/10 text-2xl text-secondary">$</span>
            <div><h2 class="font-display text-xl font-black">Presupuesto mensual</h2><p class="mt-1 max-w-lg text-sm leading-5 text-base-content/55">El límite total para cumplir deseos durante {{ currentMonth }}. Al alcanzarlo, la ruleta se pausa.</p></div>
          </div>
          <label class="input input-bordered flex w-full items-center gap-2 rounded-xl sm:w-48"><span class="text-base-content/45">$</span><input v-model.number="store.monthlyBudget" type="number" min="0" step="10" class="w-full text-right font-display text-xl font-black" aria-label="Presupuesto mensual" /><span class="text-xs text-base-content/45">MXN</span></label>
        </div>
        <div class="mt-6 rounded-2xl bg-base-200 p-4">
          <div class="mb-2 flex justify-between text-xs font-bold"><span class="text-base-content/55">Uso actual</span><span>{{ store.formatMoney(store.spentThisMonth) }} de {{ store.formatMoney(store.monthlyBudget) }}</span></div>
          <progress class="progress progress-secondary h-3 w-full" :value="store.budgetUsedPercent" max="100"></progress>
          <p class="mt-2 text-xs text-base-content/50">Te quedan <strong class="text-base-content">{{ store.formatMoney(store.remainingBudget) }}</strong> para este mes.</p>
        </div>
      </div>
    </section>

    <section class="card border border-base-300 bg-base-100 shadow-sm">
      <div class="card-body p-5 sm:p-7">
        <div class="mb-6 flex items-start justify-between gap-4">
          <div><h2 class="font-display text-xl font-black">Deseos en juego</h2><p class="mt-1 text-sm text-base-content/55">La probabilidad base es el punto de partida de cada deseo.</p></div>
          <span class="badge badge-primary badge-outline font-bold">{{ store.desires.length }} activos</span>
        </div>

        <div class="space-y-3">
          <div v-for="desire in store.desires" :key="desire.id" class="grid items-center gap-3 rounded-2xl border border-base-300 p-3 sm:grid-cols-[auto_1fr_auto_auto] sm:p-4">
            <span class="grid h-11 w-11 place-items-center rounded-xl bg-base-200 text-xl"><input v-model="desire.emoji" class="w-8 bg-transparent text-center text-xl outline-none" :aria-label="`Emoji de ${desire.title}`" /></span>
            <label class="form-control"><span class="label py-0"><span class="label-text-alt text-[10px] font-bold uppercase tracking-wider text-base-content/40">Deseo</span></span><input v-model="desire.title" class="input input-ghost input-sm rounded-lg px-0 font-bold focus:bg-base-200 focus:px-2" /></label>
            <label class="form-control w-full sm:w-36"><span class="label py-0"><span class="label-text-alt text-[10px] font-bold uppercase tracking-wider text-base-content/40">Probabilidad base</span></span><div class="join"><input v-model.number="desire.baseProbability" type="number" min="5" max="95" class="input input-bordered input-sm join-item w-full rounded-l-lg text-right font-bold" /><span class="btn btn-sm join-item pointer-events-none rounded-r-lg">%</span></div></label>
            <button class="btn btn-square btn-ghost btn-sm self-end rounded-lg text-error hover:bg-error/10" :aria-label="`Eliminar ${desire.title}`" @click="store.removeDesire(desire.id)">×</button>
          </div>
          <div v-if="!store.desires.length" class="rounded-2xl border border-dashed border-base-300 p-8 text-center text-sm text-base-content/55">Agrega un deseo para que la ruleta tenga opciones.</div>
        </div>

        <div class="divider my-7 text-xs font-bold uppercase tracking-wider text-base-content/35">Agregar un deseo</div>
        <form class="grid gap-3 sm:grid-cols-[auto_1fr_150px_auto]" @submit.prevent="addDesire">
          <label class="input input-bordered flex w-full items-center justify-center rounded-xl sm:w-16"><input v-model="newEmoji" class="w-8 text-center text-xl" maxlength="2" aria-label="Emoji del nuevo deseo" /></label>
          <input v-model="newTitle" required placeholder="Ej. Desayuno fuera" class="input input-bordered rounded-xl font-bold" />
          <label class="input input-bordered flex items-center gap-2 rounded-xl"><input v-model.number="newProbability" type="number" min="5" max="95" class="w-full font-bold" aria-label="Probabilidad base" /><span class="text-sm text-base-content/45">%</span></label>
          <button class="btn btn-secondary rounded-xl px-5 font-black" type="submit">Agregar <span aria-hidden="true">+</span></button>
        </form>
      </div>
    </section>

    <section class="grid gap-6 lg:grid-cols-2">
      <div class="card border border-base-300 bg-base-100 shadow-sm"><div class="card-body p-5 sm:p-7"><h2 class="font-display text-lg font-black">Cómo se ajusta la suerte</h2><div class="mt-4 space-y-3 text-sm text-base-content/65"><div class="flex gap-3"><span class="badge badge-primary badge-sm mt-0.5">base</span><p>Tu porcentaje elegido para cada deseo.</p></div><div class="flex gap-3"><span class="badge badge-warning badge-sm mt-0.5">historial</span><p>Cada cumplimiento resta 8 puntos y cada intento fallido resta 2.</p></div><div class="flex gap-3"><span class="badge badge-secondary badge-sm mt-0.5">presupuesto</span><p>Usar más presupuesto reduce hasta 12 puntos adicionales.</p></div></div></div></div>
      <div class="card border border-error/20 bg-error/[0.03] shadow-sm"><div class="card-body p-5 sm:p-7"><h2 class="font-display text-lg font-black text-error">Zona de reinicio</h2><p class="mt-2 text-sm leading-6 text-base-content/55">Borra tu histórico, presupuesto y deseos personalizados para empezar desde cero.</p><button class="btn btn-outline btn-error mt-5 w-fit rounded-xl" @click="resetApp">Restaurar datos iniciales</button></div></div>
    </section>
  </div>
</template>
