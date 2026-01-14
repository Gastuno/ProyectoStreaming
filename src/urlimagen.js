import Cover from '../src/assets/placeholder.jpg';

export function urlimagen(portada) {
  if (!portada || portada === "url") return Cover;
  if (portada.startsWith('http://') || portada.startsWith('https://')) return portada;
  return new URL(`../assets/${portada}`, import.meta.url).href;
}
