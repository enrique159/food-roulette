# Food Roulette

SPA de Vue 3 + TypeScript para convertir deseos en decisiones con una ruleta de dos pasos: primero se decide si el deseo procede y después se sortea el monto.

## Stack

- Vue 3 con Vite
- Vue Router para las vistas de ruleta, histórico y configuración
- Pinia para el estado de la aplicación
- Tailwind CSS v4 mediante `@tailwindcss/vite`
- DaisyUI v5 como sistema de componentes

## Persistencia y reglas

Los deseos, las probabilidades base, el presupuesto mensual y el histórico se guardan en `localStorage` bajo la clave `food-roulette-state`.

La probabilidad efectiva parte del valor base de cada deseo y se ajusta con el histórico del mes (cumplimientos: -8 puntos; intentos fallidos: -2 puntos) y con el uso del presupuesto (hasta -12 puntos). La ruleta se pausa cuando el gasto del mes alcanza el presupuesto configurado.

## Comandos

```sh
npm install
npm run dev
npm run build
```
