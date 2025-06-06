const API_BASE = 'http://127.0.0.1:5000/api';

let paginaUsuarios = 1;

function cargarUsuarios(pagina = 1) {
  paginaUsuarios = pagina;
  fetch(`${API_BASE}/usuarios?page=${pagina}`)
    .then(response => {
      if (!response.ok) throw new Error('Error en la respuesta del servidor');
      return response.json();
    })
    .then(data => mostrarUsuarios(data.items, data.pages))
    .catch(error => {
      document.getElementById('contenido').innerText = 'Error al cargar usuarios: ' + error.message;
    });
}

function cargarUsuariosLista() {
  fetch(`${API_BASE}/usuarios`)
    .then(response => {
      if (!response.ok) throw new Error('Error en la respuesta del servidor');
      return response.json();
    })
    .then(data => mostrarUsuariosLista(data.items))
    .catch(error => {
      document.getElementById('contenido').innerText = 'Error al cargar usuarios: ' + error.message;
    });
}

function mostrarUsuarios(usuarios, totalPaginas = 1) {
  const contenedor = document.getElementById('contenido');
  if (!usuarios.length) {
    contenedor.innerText = 'No hay usuarios registrados.';
    return;
  }
  const tabla = document.createElement('table');
  tabla.innerHTML = `
    <tr>
      <th>ID</th>
      <th>Nombre</th>
      <th>Correo</th>
      <th>Fecha de registro</th>
    </tr>
  `;
  usuarios.forEach(usuario => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${usuario.id}</td>
      <td>${usuario.nombre}</td>
      <td>${usuario.correo}</td>
      <td>${usuario.fecha_registro ? usuario.fecha_registro.split('T')[0] : ''}</td>
    `;
    tabla.appendChild(fila);
  });
  contenedor.innerHTML = '';
  contenedor.appendChild(tabla);

  // Controles de paginación
  if (totalPaginas > 1) {
    const paginacion = document.createElement('div');
    paginacion.style.textAlign = 'center';
    paginacion.style.marginTop = '1em';

    if (paginaUsuarios > 1) {
      const btnPrev = document.createElement('button');
      btnPrev.textContent = 'Anterior';
      btnPrev.onclick = () => cargarUsuarios(paginaUsuarios - 1);
      paginacion.appendChild(btnPrev);
    }

    paginacion.appendChild(document.createTextNode(` Página ${paginaUsuarios} de ${totalPaginas} `));

    if (paginaUsuarios < totalPaginas) {
      const btnNext = document.createElement('button');
      btnNext.textContent = 'Siguiente';
      btnNext.onclick = () => cargarUsuarios(paginaUsuarios + 1);
      paginacion.appendChild(btnNext);
    }

    contenedor.appendChild(paginacion);
  }
}

function mostrarUsuariosLista(usuarios) {
  const contenedor = document.getElementById('contenido');
  if (!usuarios.length) {
    contenedor.innerText = 'No hay usuarios registrados.';
    return;
  }
  const lista = document.createElement('ul');
  lista.style.listStyle = 'none';
  lista.style.padding = '0';

  usuarios.forEach(usuario => {
    const item = document.createElement('li');
    item.style.padding = '0.7em 1em';
    item.style.margin = '0.5em 0';
    item.style.background = '#e3eaf2';
    item.style.borderRadius = '6px';
    item.style.cursor = 'pointer';
    item.style.transition = 'background 0.2s';
    item.onmouseover = () => item.style.background = '#c5cae9';
    item.onmouseout = () => item.style.background = '#e3eaf2';
    item.innerHTML = `<strong>${usuario.nombre}</strong> <span style="color:#555;font-size:0.95em;">(${usuario.correo})</span>`;

    // Contenedor para la info expandida
    const detallesDiv = document.createElement('div');
    detallesDiv.style.marginTop = '0.7em';
    detallesDiv.style.display = 'none';
    detallesDiv.style.background = '#f8fafc';
    detallesDiv.style.borderRadius = '8px';
    detallesDiv.style.padding = '1em';

    item.appendChild(detallesDiv);

    item.onclick = function(e) {
      // Toggle: si ya está abierto, ciérralo
      if (detallesDiv.style.display === 'block') {
        detallesDiv.style.display = 'none';
        detallesDiv.innerHTML = '';
        return;
      }
      // Cierra otros abiertos
      document.querySelectorAll('.detalles-usuario').forEach(div => {
        div.style.display = 'none';
        div.innerHTML = '';
      });
      detallesDiv.style.display = 'block';
      detallesDiv.className = 'detalles-usuario';
      detallesDiv.innerHTML = '<em>Cargando canciones...</em>';

      // Fetch canciones favoritas y todas las canciones del usuario (ajusta el endpoint si es necesario)
      Promise.all([
        fetch(`${API_BASE}/usuarios/${usuario.id}/favoritos`).then(r => r.json()),
        fetch(`${API_BASE}/usuarios/${usuario.id}/canciones`).then(r => r.json()).catch(() => ({items: []}))
      ]).then(([favoritos, cancionesUsuario]) => {
        let html = '';

        // Canciones favoritas
        html += `<h4 style="margin-bottom:0.5em;">Favoritas</h4>`;
        if (favoritos.items && favoritos.items.length) {
          html += crearTablaCanciones(favoritos.items);
        } else {
          html += `<em>No tiene canciones favoritas.</em>`;
        }

        // Todas las canciones del usuario
        html += `<h4 style="margin:1em 0 0.5em 0;">Todas sus canciones</h4>`;
        if (cancionesUsuario.items && cancionesUsuario.items.length) {
          html += crearTablaCanciones(cancionesUsuario.items);
        } else {
          html += `<em>No tiene canciones propias.</em>`;
        }

        detallesDiv.innerHTML = html;
      }).catch(() => {
        detallesDiv.innerHTML = '<em>Error al cargar canciones.</em>';
      });

      e.stopPropagation();
    };
    lista.appendChild(item);
  });

  contenedor.innerHTML = '<h2>Usuarios</h2>';
  contenedor.appendChild(lista);
}

// Función auxiliar para crear una tabla de canciones
function crearTablaCanciones(canciones) {
  let tabla = `<table>
    <tr>
      <th>ID</th>
      <th>Título</th>
      <th>Artista</th>
      <th>Género</th>
      <th>Año</th>
    </tr>`;
  canciones.forEach(cancion => {
    tabla += `<tr>
      <td>${cancion.id}</td>
      <td>${cancion.titulo || ''}</td>
      <td>${cancion.artista || ''}</td>
      <td>${cancion.genero || ''}</td>
      <td>${cancion.anio || cancion.año || ''}</td>
    </tr>`;
  });
  tabla += `</table>`;
  return tabla;
}
let paginaActual = 1;
function cargarCanciones(pagina = 1) {
  paginaActual = pagina;
  fetch(`${API_BASE}/canciones?page=${pagina}`)
    .then(response => {
      if (!response.ok) throw new Error('Error en la respuesta del servidor');
      return response.json();
    })
    .then(data => mostrarCanciones(data.items, data.pages))
    .catch(error => {
      document.getElementById('contenido').innerText = 'Error al cargar canciones: ' + error.message;
    });
}

function mostrarCanciones(canciones, totalPaginas = 1, paginacion = true, nombreUsuario = null) {
  const contenedor = document.getElementById('contenido');
  let titulo = nombreUsuario ? `<h2>Canciones favoritas de ${nombreUsuario}</h2>` : '';
  if (!canciones.length) {
    contenedor.innerHTML = titulo + '<p>No hay canciones registradas.</p>';
    return;
  }
  let tabla = document.createElement('table');
  tabla.innerHTML = `
    <tr>
      <th>ID</th>
      <th>Título</th>
      <th>Artista</th>
      <th>Género</th>
      <th>Año</th>
    </tr>
  `;
  canciones.forEach(cancion => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${cancion.id}</td>
      <td>${cancion.titulo || ''}</td>
      <td>${cancion.artista || ''}</td>
      <td>${cancion.genero || ''}</td>
      <td>${cancion.anio || cancion.año || ''}</td>
    `;
    tabla.appendChild(fila);
  });
  contenedor.innerHTML = titulo;
  contenedor.appendChild(tabla);
  // Si no quieres paginación en favoritos, omite los controles
  if (paginacion && totalPaginas > 1) {
    // ... controles de paginación ...
  }
}

function buscarCanciones() {
  const query = document.getElementById('busqueda').value.trim();
  if (!query) {
    alert('Ingresa un término de búsqueda.');
    return;
  }
  fetch(`${API_BASE}/canciones/buscar?q=${encodeURIComponent(query)}`)
    .then(response => {
      if (!response.ok) throw new Error('Error en la búsqueda');
      return response.json();
    })
    .then(data => {
      document.getElementById('busqueda').value = '';
      const canciones = data.items || data;
      // Coincidencias exactas por título o artista
      const exactas = canciones.filter(
        c =>
          (c.titulo && c.titulo.toLowerCase() === query.toLowerCase()) ||
          (c.artista && c.artista.toLowerCase() === query.toLowerCase())
      );
      if (exactas.length > 0) {
        mostrarCanciones(exactas);
      } else {
        // Coincidencias parciales por título o artista
        const parciales = canciones.filter(
          c =>
            (c.titulo && c.titulo.toLowerCase().includes(query.toLowerCase())) ||
            (c.artista && c.artista.toLowerCase().includes(query.toLowerCase()))
        );
        mostrarCanciones(parciales);
      }
    })
    .catch(error => {
      document.getElementById('contenido').innerText = 'Error al buscar canciones: ' + error.message;
    });
}

function cargarFavoritos() {
  const usuarioId = document.getElementById('usuarioId').value.trim();
  if (!usuarioId) {
    alert('Ingresa el ID de usuario.');
    return;
  }
  fetch(`${API_BASE}/usuarios/${usuarioId}/favoritos`)
    .then(response => {
      if (!response.ok) throw new Error('Error al cargar favoritos');
      return response.json();
    })
    .then(data => mostrarCanciones(data.items || data))
    .catch(error => {
      document.getElementById('contenido').innerText = 'Error al cargar favoritos: ' + error.message;
    });
}