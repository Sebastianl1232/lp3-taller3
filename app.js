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
  // Elimina el botón de volver al inicio si existe
  const btnInicio = document.getElementById('btnInicio');
  if (btnInicio) btnInicio.remove();

  if (!usuarios.length) {
    contenedor.innerText = 'No hay usuarios registrados.';
    return;
  }

  // Formulario para crear usuario
  const form = document.createElement('form');
  form.className = 'form-crear-usuario';
  form.innerHTML = `
    <h3>Crear nuevo usuario</h3>
    <input type="text" id="nuevoNombre" placeholder="Nombre" required style="margin-right:0.5em;">
    <input type="email" id="nuevoCorreo" placeholder="Correo" required style="margin-right:0.5em;">
    <button type="submit">Crear</button>
    <div id="mensajeUsuario" style="margin-top:0.5em;color:#1976d2;font-weight:500;"></div>
  `;
  form.onsubmit = function(e) {
    e.preventDefault();
    crearUsuario();
  };

  // Contenedor de tarjetas
  const grid = document.createElement('div');
  grid.className = 'usuarios-grid';

  usuarios.forEach(usuario => {
    const card = document.createElement('div');
    card.className = 'usuario-card';

    // Avatar con iniciales
    const avatar = document.createElement('div');
    avatar.className = 'usuario-avatar';
    const iniciales = (usuario.nombre ? usuario.nombre[0] : '') + (usuario.apellido ? usuario.apellido[0] : (usuario.nombre ? usuario.nombre.split(' ')[1]?.[0] || '' : ''));
    avatar.textContent = iniciales.toUpperCase();

    // Nombre
    const nombre = document.createElement('div');
    nombre.className = 'usuario-nombre';
    nombre.textContent = usuario.nombre.length > 18 ? usuario.nombre.slice(0, 18) + '...' : usuario.nombre;

    // Username (si tienes)
    const username = document.createElement('div');
    username.className = 'usuario-username';
    username.textContent = usuario.username ? '@' + usuario.username : '';

    // Correo
    const correo = document.createElement('div');
    correo.className = 'usuario-correo';
    correo.textContent = usuario.correo;

    // Botones de gestión
    const acciones = document.createElement('div');
    acciones.style.marginTop = '1em';
    acciones.style.display = 'flex';
    acciones.style.gap = '0.5em';

    // Botón Editar
    const btnEditar = document.createElement('button');
    btnEditar.textContent = 'Editar';
    btnEditar.style.background = '#ffd600';
    btnEditar.style.color = '#222';
    btnEditar.onclick = (e) => {
      e.stopPropagation();
      mostrarFormularioEditarUsuario(usuario);
    };

    // Botón Eliminar
    const btnEliminar = document.createElement('button');
    btnEliminar.textContent = 'Eliminar';
    btnEliminar.style.background = '#e53935';
    btnEliminar.style.color = '#fff';
    btnEliminar.onclick = (e) => {
      e.stopPropagation();
      if (confirm('¿Seguro que deseas eliminar este usuario?')) {
        eliminarUsuario(usuario.id);
      }
    };

    acciones.appendChild(btnEditar);
    acciones.appendChild(btnEliminar);

    card.onclick = function() {
      cargarFavoritosUsuario(usuario.id, usuario.nombre);
    };

    card.appendChild(avatar);
    card.appendChild(nombre);
    if (usuario.username) card.appendChild(username);
    card.appendChild(correo);
    card.appendChild(acciones);

    grid.appendChild(card);
  });

  contenedor.innerHTML = '<h2 style="text-align:center;margin-bottom:1em;">Elige un usuario</h2>';
  contenedor.appendChild(form);
  contenedor.appendChild(grid);
  agregarBotonInicio();
}

function crearUsuario() {
  const nombre = document.getElementById('nuevoNombre').value.trim();
  const correo = document.getElementById('nuevoCorreo').value.trim();
  const mensaje = document.getElementById('mensajeUsuario');
  if (!nombre || !correo) {
    mensaje.textContent = 'Completa todos los campos.';
    mensaje.style.color = 'red';
    return;
  }
  fetch(`${API_BASE}/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, correo })
  })
    .then(response => {
      if (!response.ok) throw new Error('No se pudo crear el usuario');
      return response.json();
    })
    .then(data => {
      mensaje.style.color = 'green';
      mensaje.textContent = 'Usuario creado correctamente.';
      // Recarga la lista de usuarios
      setTimeout(() => cargarUsuariosLista(), 1000);
    })
    .catch(error => {
      mensaje.style.color = 'red';
      mensaje.textContent = 'Error: ' + error.message;
    });
}

function eliminarUsuario(id) {
  fetch(`${API_BASE}/usuarios/${id}`, {
    method: 'DELETE'
  })
    .then(response => {
      if (!response.ok) throw new Error('No se pudo eliminar el usuario');
      // Recarga la lista de usuarios
      cargarUsuariosLista();
    })
    .catch(error => {
      alert('Error al eliminar usuario: ' + error.message);
    });
}

function mostrarFormularioEditarUsuario(usuario) {
  const contenedor = document.getElementById('contenido');
  contenedor.innerHTML = `
    <h2 style="text-align:center;margin-bottom:1em;">Editar usuario</h2>
    <form id="formEditarUsuario" class="form-crear-usuario">
      <input type="text" id="editarNombre" value="${usuario.nombre}" required>
      <input type="email" id="editarCorreo" value="${usuario.correo}" required>
      <button type="submit">Guardar</button>
      <button type="button" id="cancelarEdicion">Cancelar</button>
      <div id="mensajeEditarUsuario" style="margin-top:0.5em;color:#1976d2;font-weight:500;"></div>
    </form>
  `;
  document.getElementById('formEditarUsuario').onsubmit = function(e) {
    e.preventDefault();
    editarUsuario(usuario.id);
  };
  document.getElementById('cancelarEdicion').onclick = function() {
    cargarUsuariosLista();
  };
  agregarBotonInicio();
}

function editarUsuario(id) {
  const nombre = document.getElementById('editarNombre').value.trim();
  const correo = document.getElementById('editarCorreo').value.trim();
  const mensaje = document.getElementById('mensajeEditarUsuario');
  if (!nombre || !correo) {
    mensaje.textContent = 'Completa todos los campos.';
    mensaje.style.color = 'red';
    return;
  }
  fetch(`${API_BASE}/usuarios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, correo })
  })
    .then(response => {
      if (!response.ok) throw new Error('No se pudo editar el usuario');
      mensaje.style.color = 'green';
      mensaje.textContent = 'Usuario editado correctamente.';
      setTimeout(() => cargarUsuariosLista(), 1000);
    })
    .catch(error => {
      mensaje.style.color = 'red';
      mensaje.textContent = 'Error: ' + error.message;
    });
}

// Función para cargar favoritos de un usuario (ajusta según tu lógica)
function cargarFavoritosUsuario(usuarioId, nombreUsuario) {
  fetch(`${API_BASE}/usuarios/${usuarioId}/favoritos`)
    .then(response => {
      if (!response.ok) throw new Error('Error al cargar favoritos');
      return response.json();
    })
    .then(data => mostrarCanciones(data.items || data, 1, false, nombreUsuario))
    .catch(error => {
      document.getElementById('contenido').innerText = 'Error al cargar favoritos: ' + error.message;
    });
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

window.onload = function() {
  const btn = document.getElementById('btnComenzar');
  if (btn) {
    btn.onclick = function() {
      document.getElementById('bienvenida').style.display = 'none';
      const contenido = document.getElementById('contenido');
      contenido.style.display = 'block';
      cargarUsuariosLista();
    };
  }
};

function agregarBotonInicio() {
  // Evita duplicar el botón
  if (document.getElementById('btnInicio')) return;
  const btn = document.createElement('button');
  btn.id = 'btnInicio';
  btn.textContent = 'Volver al inicio';
  btn.style.margin = '1.5em auto 0 auto';
  btn.style.display = 'block';
  btn.onclick = function() {
    document.getElementById('contenido').style.display = 'none';
    document.getElementById('bienvenida').style.display = 'flex';
  };
  // Lo agregamos al final del contenido
  document.getElementById('contenido').appendChild(btn);
}