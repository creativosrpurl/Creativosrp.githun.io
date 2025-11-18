/*
  ================================================================
  == UTILIDADES COMPARTIDAS PARA CREATIVOS RP ==
  ================================================================
  Este archivo contiene funciones que se usan en varias páginas
  para evitar la duplicación de código.
*/

// --- URL del Servidor ---
// Detecta si estamos en local o en producción y define la URL correcta.
const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const RENDER_URL = 'https://creativosrp.onrender.com';
const API_URL = IS_LOCAL ? 'http://localhost:3000' : RENDER_URL;

// --- Carga Inteligente del Fondo ---
// Carga la imagen de fondo de forma dinámica y con una transición suave.
function loadDynamicBackground() {
  const bgElement = document.getElementById('gta-bg');
  if (bgElement) {
    const bgImageUrl = 'https://wallpaperaccess.in/public/uploads/preview/cool-gta-san-andreas-wallpaper-1920x1080.jpg';
    bgElement.style.backgroundImage = `url(${bgImageUrl})`;
    bgElement.style.opacity = '0.4';
  }
}