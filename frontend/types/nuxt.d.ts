// Minimal declarations to satisfy editor for Nuxt virtual imports
declare module '#app' {
  export function useRuntimeConfig<T = any>(): T;
}

declare module '#imports' {
  export { useRuntimeConfig } from '#app';
}
