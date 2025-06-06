// src/utils/loadImage.js

/**
 * Carga una imagen y devuelve una promesa que se resuelve
 * con el HTMLImageElement cuando termina de cargarse.
 */
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'    // evita problemas CORS
    img.src = src
    img.onload  = () => resolve(img)
    img.onerror = err => reject(new Error(`Error cargando imagen ${src}: ${err}`))
  })
}