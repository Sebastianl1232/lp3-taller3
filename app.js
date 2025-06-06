const API_BASE = 'http://127.0.0.1:5000/api';

function cargarUsuarios() {
  fetch(`${API_BASE}/usuarios`)
    .then(response => {
      if (!response.ok) throw new Error('Error en la respuesta del servidor');
      return response.json();
    })
    .then(data => mostrarUsuarios(data.items))
    .catch(error => {
      document.getElementById('contenido').innerText = 'Error al cargar usuarios: ' + error.message;
    });
}

function mostrarUsuarios(usuarios) {
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
}

function cargarCanciones() {
  fetch(`${API_BASE}/canciones`)
    .then(response => {
      if (!response.ok) throw new Error('Error en la respuesta del servidor');
      return response.json();
    })
    .then(data => mostrarCanciones(data.items))
    .catch(error => {
      document.getElementById('contenido').innerText = 'Error al cargar canciones: ' + error.message;
    });
}

function mostrarCanciones(canciones) {
  const contenedor = document.getElementById('contenido');
  if (!canciones.length) {
    contenedor.innerText = 'No hay canciones registradas.';
    return;
  }
  const tabla = document.createElement('table');
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
      <td>${cancion.anio || ''}</td>
    `;
    tabla.appendChild(fila);
  });
  contenedor.innerHTML = '';
  contenedor.appendChild(tabla);
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
    .then(data => mostrarCanciones(data.items || data))
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