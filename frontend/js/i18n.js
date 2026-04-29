// Frontend - Login mejorado con región, idioma e historial de robots

const API_URL = 'http://localhost:5000/api';
let CURRENT_REGION = localStorage.getItem('region') || 'MX';
let CURRENT_IDIOMA = localStorage.getItem('idioma') || 'ES';
let CURRENT_USER = null;
let TRANSLATIONS = {};

// Cargar traducciones
async function cargarTraducciones() {
  try {
    const response = await fetch(`${API_URL}/regiones/traducciones/${CURRENT_IDIOMA}`);
    if (response.ok) {
      TRANSLATIONS = await response.json();
    }
  } catch (error) {
    console.log('Traducciones no disponibles, usando valores por defecto');
    TRANSLATIONS = {};
  }
}

// Helper para traducir
function t(clave, valores = {}) {
  const partes = clave.split('.');
  let valor = TRANSLATIONS;

  for (const parte of partes) {
    if (valor && typeof valor === 'object' && parte in valor) {
      valor = valor[parte];
    } else {
      return clave;
    }
  }

  let resultado = typeof valor === 'string' ? valor : clave;
  Object.entries(valores).forEach(([key, val]) => {
    resultado = resultado.replace(`{${key}}`, String(val));
  });

  return resultado;
}

// Cambiar región
async function cambiarRegion(codigoRegion) {
  CURRENT_REGION = codigoRegion;
  localStorage.setItem('region', codigoRegion);

  if (CURRENT_USER && CURRENT_USER.token) {
    try {
      const response = await fetch(`${API_URL}/regiones/cambiar-idioma`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CURRENT_USER.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idioma: CURRENT_IDIOMA }),
      });

      if (response.ok) {
        location.reload();
      }
    } catch (error) {
      console.error('Error changing region:', error);
    }
  }
}

// Cambiar idioma
async function cambiarIdioma(codigoIdioma) {
  CURRENT_IDIOMA = codigoIdioma;
  localStorage.setItem('idioma', codigoIdioma);
  document.documentElement.lang = codigoIdioma.toLowerCase();

  await cargarTraducciones();

  if (CURRENT_USER && CURRENT_USER.token) {
    try {
      const response = await fetch(`${API_URL}/regiones/cambiar-idioma`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CURRENT_USER.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idioma: codigoIdioma }),
      });

      if (response.ok) {
        location.reload();
      }
    } catch (error) {
      console.error('Error changing language:', error);
    }
  } else {
    actualizarUI();
  }
}

// Actualizar UI con traducciones
function actualizarUI() {
  // Actualizar elementos con data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const clave = el.getAttribute('data-i18n');
    el.textContent = t(clave);
  });

  // Actualizar placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const clave = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(clave);
  });
}

// Login mejorado
async function login(email, password) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      showAlert(t('errors.credencialesInvalidas'), 'error');
      return;
    }

    const data = await response.json();
    CURRENT_USER = data;
    CURRENT_REGION = data.usuario.region;
    CURRENT_IDIOMA = data.usuario.idioma;

    localStorage.setItem('token', data.token);
    localStorage.setItem('region', CURRENT_REGION);
    localStorage.setItem('idioma', CURRENT_IDIOMA);

    await cargarTraducciones();
    location.href = 'index.html';
  } catch (error) {
    console.error('Error:', error);
    showAlert(t('errors.backendNoDisponible'), 'error');
  }
}

// Mostrar formulario de historial
function renderHistorial() {
  const solicitudes = JSON.parse(localStorage.getItem('solicitudes') || '[]');
  const completadas = solicitudes.filter(s =>
    s.estado === 'COMPLETADO' || s.estado === 'RECHAZADA'
  );

  let html = `<h2>${t('historial.titulo')}</h2>`;

  if (completadas.length === 0) {
    html += `<p>${t('sin_datos')}</p>`;
  } else {
    html += '<table><thead><tr>';
    html += `<th>${t('historial.quien')}</th>`;
    html += `<th>${t('historial.fechas')}</th>`;
    html += `<th>${t('historial.duracion')}</th>`;
    html += `<th>${t('robots.estado')}</th>`;
    html += '</tr></thead><tbody>';

    completadas.forEach(sol => {
      const fechaInicio = new Date(sol.fechaInioSolicitada);
      const fechaFin = new Date(sol.fechaFinSolicitada);
      const duracion = Math.floor((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24));

      html += '<tr>';
      html += `<td>${sol.solicitante}</td>`;
      html += `<td>${fechaInicio.toLocaleDateString()} - ${fechaFin.toLocaleDateString()}</td>`;
      html += `<td>${duracion} días</td>`;
      html += `<td>${sol.estado}</td>`;
      html += '</tr>';
    });

    html += '</tbody></table>';
  }

  document.getElementById('tab-historial').innerHTML = html;
}

// Inicializar
document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');

  if (token) {
    CURRENT_USER = { token };
  }

  await cargarTraducciones();
  actualizarUI();

  // Event listeners para cambios de región/idioma
  const regionSelect = document.getElementById('regionSelect');
  const idiomaSelect = document.getElementById('idiomaSelect');

  if (regionSelect) {
    regionSelect.addEventListener('change', (e) => cambiarRegion(e.target.value));
  }

  if (idiomaSelect) {
    idiomaSelect.addEventListener('change', (e) => cambiarIdioma(e.target.value));
  }
});
