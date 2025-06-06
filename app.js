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

function mostrarCanciones(canciones, totalPaginas = 1) {
  const contenedor = document.getElementById('contenido');
  if (!canciones.length) {
    contenedor.innerText = 'No hay canciones registradas.';
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
  contenedor.innerHTML = '';
  contenedor.appendChild(tabla);

  // Controles de paginación
  if (totalPaginas > 1) {
    const paginacion = document.createElement('div');
    paginacion.style.textAlign = 'center';
    paginacion.style.marginTop = '1em';

    if (paginaActual > 1) {
      const btnPrev = document.createElement('button');
      btnPrev.textContent = 'Anterior';
      btnPrev.onclick = () => cargarCanciones(paginaActual - 1);
      paginacion.appendChild(btnPrev);
    }

    paginacion.appendChild(document.createTextNode(` Página ${paginaActual} de ${totalPaginas} `));

    if (paginaActual < totalPaginas) {
      const btnNext = document.createElement('button');
      btnNext.textContent = 'Siguiente';
      btnNext.onclick = () => cargarCanciones(paginaActual + 1);
      paginacion.appendChild(btnNext);
    }

    contenedor.appendChild(paginacion);
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