const colorPicker = document.getElementById('colorPicker');
const parteActual = document.getElementById('parteActual');
const btnGuardar = document.getElementById('btnGuardar');
const btnActualizar = document.getElementById('btnActualizar');
const btnCancelar = document.getElementById('btnCancelar');
const btnLimpiar = document.getElementById('btnLimpiar');
const contenedorCamisetas = document.getElementById('contenedorCamisetas');

let parteSeleccionada = null;

const partes = document.querySelectorAll('.parte-camiseta');

// Seleccionar parte de la camiseta
partes.forEach((parte) => {
  parte.addEventListener('click', () => {
    partes.forEach((p) => p.classList.remove('parte-activa'));

    parteSeleccionada = parte;
    parteSeleccionada.classList.add('parte-activa');

    colorPicker.value = parte.getAttribute('fill');
    parteActual.textContent = `Parte seleccionada: ${parte.id}`;
  });
});

// Cambiar color de la parte seleccionada
colorPicker.addEventListener('input', () => {
  if (parteSeleccionada) {
    parteSeleccionada.setAttribute('fill', colorPicker.value);
  } else {
    alert('Primero selecciona una parte de la camiseta.');
  }
});

// Botón reiniciar
btnLimpiar.addEventListener('click', () => {
  limpiarFormularioCompleto();
});

// CREATE - Guardar diseño
btnGuardar.addEventListener('click', async () => {
  // Obtener colores actuales de cada parte
  const diseño = {
    nombreDiseno: document.getElementById('nombreDiseno').value.trim(),
    autor: document.getElementById('autor').value.trim(),
    descripcion: document.getElementById('descripcion').value.trim(),
    torsoColor: document.getElementById('torso').getAttribute('fill'),
    mangaIzquierdaColor: document.getElementById('manga-izquierda').getAttribute('fill'),
    mangaDerechaColor: document.getElementById('manga-derecha').getAttribute('fill'),
    cuelloColor: document.getElementById('cuello').getAttribute('fill'),
    BolsilloColor: document.getElementById('bolsillo').getAttribute('fill'),
    TapetaFrontalColor: document.getElementById('tapeta-frontal').getAttribute('fill'),
  };
  // Enviar via fetch al servidor
  const resp = await fetch('/api/camisetas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(diseño)
  });
  const data = await resp.json();
  console.log('Diseño guardado en servidor:', data);
});


// UPDATE - Actualizar diseño
btnActualizar.addEventListener('click', async () => {
  const id = document.getElementById('camisetaId').value;
  const camiseta = obtenerDatosFormulario();

  if (!id) {
    alert('No hay diseño seleccionado para actualizar.');
    return;
  }

  if (!camiseta) return;

  try {
    const respuesta = await fetch(`/api/camisetas/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(camiseta)
    });

    const datos = await respuesta.json();

    if (respuesta.ok) {
      alert(datos.mensaje);
      limpiarFormularioCompleto();
      cargarCamisetas();
    } else {
      alert(datos.mensaje);
    }

  } catch (error) {
    console.error(error);
    alert('Error al actualizar la camiseta.');
  }
});

// Cancelar edición
btnCancelar.addEventListener('click', () => {
  limpiarFormularioCompleto();
});

// Obtener datos del formulario
function obtenerDatosFormulario() {
  const nombreDiseno = document.getElementById('nombreDiseno').value.trim();
  const autor = document.getElementById('autor').value.trim();
  const descripcion = document.getElementById('descripcion').value.trim();

  if (nombreDiseno === '' || autor === '') {
    alert('Debes escribir el nombre del diseño y el autor.');
    return null;
  }

  return {
    nombreDiseno,
    autor,
    descripcion,
    torsoColor: document.getElementById('torso').getAttribute('fill'),
    mangaIzquierdaColor: document.getElementById('mangaIzquierda').getAttribute('fill'),
    mangaDerechaColor: document.getElementById('mangaDerecha').getAttribute('fill'),
    cuelloColor: document.getElementById('cuello').getAttribute('fill'),
    BolsilloColor: document.getElementById('bolsillo').getAttribute('fill'),
    TapetaFrontalColor: document.getElementById('tapeta-frontal').getAttribute('fill')
  };
}

// Reiniciar formulario y camisa en blanco
function limpiarFormularioCompleto() {
  document.getElementById('camisetaId').value = '';
  document.getElementById('nombreDiseno').value = '';
  document.getElementById('autor').value = '';
  document.getElementById('descripcion').value = '';

  document.getElementById('torso').setAttribute('fill', '#ffffff');
  document.getElementById('mangaIzquierda').setAttribute('fill', '#ffffff');
  document.getElementById('mangaDerecha').setAttribute('fill', '#ffffff');
  document.getElementById('cuello').setAttribute('fill', '#ffffff');

  partes.forEach((parte) => parte.classList.remove('parte-activa'));

  parteSeleccionada = null;
  colorPicker.value = '#ffffff';
  parteActual.textContent = 'Selecciona una parte de la camisa';

  btnGuardar.classList.remove('oculto');
  btnActualizar.classList.add('oculto');
  btnCancelar.classList.add('oculto');
}

// READ - Cargar camisetas guardadas
async function cargarCamisetas() {
  try {
    const respuesta = await fetch('/api/camisetas');
    const camisetas = await respuesta.json();

    contenedorCamisetas.innerHTML = '';

    if (camisetas.length === 0) {
      contenedorCamisetas.innerHTML = `
        <p class="mensaje-vacio">Todavía no hay diseños guardados.</p>
      `;
      return;
    }

    camisetas.forEach((camiseta) => {
      const tarjeta = document.createElement('div');
      tarjeta.classList.add('tarjeta-camiseta');

      const calificacion = Number(camiseta.calificacion || 0).toFixed(1);
      const descripcion = camiseta.descripcion || 'Sin descripción.';

      tarjeta.innerHTML = `
        <div>
          <h3>${camiseta.nombreDiseno}</h3>
          <p><strong>Autor:</strong> ${camiseta.autor}</p>
          <p><strong>Calificación:</strong> ${calificacion} ⭐ (${camiseta.votos} votos)</p>
          <p class="descripcion-card">${descripcion}</p>

          <div class="mini-camisa">
            <div class="color-box" style="background:${camiseta.torsoColor}" title="Torso"></div>
            <div class="color-box" style="background:${camiseta.mangaIzquierdaColor}" title="Manga izquierda"></div>
            <div class="color-box" style="background:${camiseta.mangaDerechaColor}" title="Manga derecha"></div>
            <div class="color-box" style="background:${camiseta.cuelloColor}" title="Cuello"></div>
            <div class="color-box" style="background:${camiseta.BolsilloColor}" title="Bolsillo"></div>
            <div class="color-box" style="background:${camiseta.TapetaFrontalColor}" title="Tapeta frontal"></div>
          </div>
        </div>

        <div class="acciones-card">
          <div class="estrellas">
            <button onclick="votar('${camiseta._id}', 1)">1 ⭐</button>
            <button onclick="votar('${camiseta._id}', 2)">2 ⭐</button>
            <button onclick="votar('${camiseta._id}', 3)">3 ⭐</button>
            <button onclick="votar('${camiseta._id}', 4)">4 ⭐</button>
            <button onclick="votar('${camiseta._id}', 5)">5 ⭐</button>
          </div>

          <div class="acciones-crud">
            <button class="btn-edit" onclick='editarCamiseta(${JSON.stringify(camiseta)})'>
              Editar
            </button>

            <button class="btn-delete" onclick="eliminarCamiseta('${camiseta._id}')">
              Eliminar
            </button>
          </div>
        </div>
      `;

      contenedorCamisetas.appendChild(tarjeta);
    });

  } catch (error) {
    console.error(error);
    alert('Error al cargar las camisetas.');
  }
}

// Cargar datos al formulario para editar
function editarCamiseta(camiseta) {
  document.getElementById('camisetaId').value = camiseta._id;
  document.getElementById('nombreDiseno').value = camiseta.nombreDiseno;
  document.getElementById('autor').value = camiseta.autor;
  document.getElementById('descripcion').value = camiseta.descripcion || '';

  document.getElementById('torso').setAttribute('fill', camiseta.torsoColor);
  document.getElementById('mangaIzquierda').setAttribute('fill', camiseta.mangaIzquierdaColor);
  document.getElementById('mangaDerecha').setAttribute('fill', camiseta.mangaDerechaColor);
  document.getElementById('cuello').setAttribute('fill', camiseta.cuelloColor);

  partes.forEach((parte) => parte.classList.remove('parte-activa'));

  parteSeleccionada = null;
  colorPicker.value = '#ffffff';
  parteActual.textContent = 'Editando diseño. Selecciona una parte si deseas cambiar colores.';

  btnGuardar.classList.add('oculto');
  btnActualizar.classList.remove('oculto');
  btnCancelar.classList.remove('oculto');

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// Votar por diseño
async function votar(id, valor) {
  try {
    const respuesta = await fetch(`/api/camisetas/${id}/votar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ valor })
    });

    const datos = await respuesta.json();

    if (respuesta.ok) {
      alert(datos.mensaje);
      cargarCamisetas();
    } else {
      alert(datos.mensaje);
    }

  } catch (error) {
    console.error(error);
    alert('Error al votar.');
  }
}

// DELETE - Eliminar diseño
async function eliminarCamiseta(id) {
  const confirmar = confirm('¿Seguro que deseas eliminar este diseño?');

  if (!confirmar) return;

  try {
    const respuesta = await fetch(`/api/camisetas/${id}`, {
      method: 'DELETE'
    });

    const datos = await respuesta.json();

    if (respuesta.ok) {
      alert(datos.mensaje);
      cargarCamisetas();
    } else {
      alert(datos.mensaje);
    }

  } catch (error) {
    console.error(error);
    alert('Error al eliminar la camiseta.');
  }
}

// Cargar diseños al abrir
cargarCamisetas();