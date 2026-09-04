# Food Roulette

SPA de Vue 3 + TypeScript para convertir deseos en decisiones con una ruleta de dos pasos: primero se decide si el deseo procede y después se sortea el monto.

## Stack

- Vue 3 con Vite
- Vue Router para las vistas de ruleta, histórico y configuración
- Pinia para el estado de la aplicación
- Tailwind CSS v4 mediante `@tailwindcss/vite`
- DaisyUI v5 como sistema de componentes
- PWA con `vite-plugin-pwa` y actualización automática del service worker

## Persistencia y reglas

El nombre del usuario, los deseos, las probabilidades base, el presupuesto mensual y el histórico se guardan en `localStorage` bajo la clave `food-roulette-state`.

La probabilidad efectiva parte del valor base de cada deseo y se ajusta con el histórico del mes (cada cumplimiento exitoso: -8 puntos; los intentos fallidos no la modifican) y con el uso del presupuesto (hasta -12 puntos). La ruleta se pausa cuando el gasto del mes alcanza el presupuesto configurado.

La PWA registra el service worker inmediatamente y comprueba si existe una versión nueva al abrir o reanudar la app. Cuando encuentra una actualización, activa el nuevo service worker y recarga la página para usar el JavaScript actualizado en esa misma apertura.

## Comandos

```sh
npm install
npm run dev
npm run build
```
