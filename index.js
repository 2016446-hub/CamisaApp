const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Usuario = require('./esquemaUsuario');
const Camiseta = require('./esquemaCamiseta');

const app = express();
const PORT = 3000;
const SECRETO = 'SECRETO_SUPER_SEGUR0'; // Definir la constante aquí

// ==========================
// MIDDLEWARES
// ==========================

app.use(express.json());
app.use(express.static(path.join(__dirname, 'Public')));

// ==========================
// CONEXIÓN A MONGODB
// ==========================

mongoose.connect('mongodb+srv://davidjim0104:davidjim0104@cluster0.4fvrocz.mongodb.net/?appName=Cluster0')
  .then(() => {
    console.log('MongoDB conectado correctamente');
  })
  .catch((error) => {
    console.error('Error al conectar con MongoDB:', error);
  });

// Middleware para verificar JWT
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];  
  if (!authHeader) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRETO);
    req.usuarioId = decoded.id;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
}

// ==========================
// RUTAS PRINCIPALES
// ==========================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'index.html'));
});

// ==========================
// RUTAS DE USUARIOS (CORREGIDAS - SIN DUPLICADOS)
// ==========================

// Obtener todos los usuarios
app.get('/api/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Obtener un usuario por ID
app.get('/api/usuarios/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Crear un nuevo usuario (versión simple - sin hash)
app.post('/api/usuarios', async (req, res) => {
  try {
    const datosUsuario = req.body;
    const nuevo = new Usuario(datosUsuario);
    const usuarioGuardado = await nuevo.save();
    res.status(201).json(usuarioGuardado);
  } catch (error) {
    res.status(400).json({ error: 'Error al crear usuario' });
  }
});

// Actualizar un usuario existente
app.put('/api/usuarios/:id', async (req, res) => {
  try {
    const datosActualizados = req.body;
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      datosActualizados,
      { new: true }
    );
    if (!usuarioActualizado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuarioActualizado);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar usuario' });
  }
});

// Eliminar un usuario
app.delete('/api/usuarios/:id', async (req, res) => {
  try {
    const usuarioEliminado = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuarioEliminado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ==========================
// RUTAS DE CAMISETAS
// ==========================

app.post('/api/camisetas', async (req, res) => {
  try {
    const {
      nombreDiseno,
      autor,
      descripcion,
      torsoColor,
      mangaIzquierdaColor,
      mangaDerechaColor,
      cuelloColor
    } = req.body;

    const nuevaCamiseta = new Camiseta({
      nombreDiseno,
      autor,
      descripcion,
      torsoColor,
      mangaIzquierdaColor,
      mangaDerechaColor,
      cuelloColor
    });

    const camisetaGuardada = await nuevaCamiseta.save();
    res.status(201).json({
      mensaje: 'Diseño de camiseta guardado correctamente',
      camiseta: camisetaGuardada
    });
  } catch (error) {
    res.status(400).json({
      mensaje: 'Error al guardar la camiseta',
      error: error.message
    });
  }
});

app.get('/api/camisetas', async (req, res) => {
  try {
    const camisetas = await Camiseta.find().sort({ fechaCreacion: -1 });
    res.json(camisetas);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener las camisetas',
      error: error.message
    });
  }
});

app.get('/api/camisetas/:id', async (req, res) => {
  try {
    const camiseta = await Camiseta.findById(req.params.id);
    if (!camiseta) {
      return res.status(404).json({ mensaje: 'Camiseta no encontrada' });
    }
    res.json(camiseta);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener la camiseta',
      error: error.message
    });
  }
});

app.put('/api/camisetas/:id', async (req, res) => {
  try {
    const {
      nombreDiseno,
      autor,
      descripcion,
      torsoColor,
      mangaIzquierdaColor,
      mangaDerechaColor,
      cuelloColor
    } = req.body;

    const camisetaActualizada = await Camiseta.findByIdAndUpdate(
      req.params.id,
      {
        nombreDiseno,
        autor,
        descripcion,
        torsoColor,
        mangaIzquierdaColor,
        mangaDerechaColor,
        cuelloColor,
        actualizadoEn: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!camisetaActualizada) {
      return res.status(404).json({ mensaje: 'Camiseta no encontrada' });
    }

    res.json({
      mensaje: 'Diseño actualizado correctamente',
      camiseta: camisetaActualizada
    });
  } catch (error) {
    res.status(400).json({
      mensaje: 'Error al actualizar la camiseta',
      error: error.message
    });
  }
});

app.delete('/api/camisetas/:id', async (req, res) => {
  try {
    const camisetaEliminada = await Camiseta.findByIdAndDelete(req.params.id);
    if (!camisetaEliminada) {
      return res.status(404).json({ mensaje: 'Camiseta no encontrada' });
    }
    res.json({ mensaje: 'Camiseta eliminada correctamente' });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al eliminar la camiseta',
      error: error.message
    });
  }
});

// ==========================
// RUTAS DE AUTENTICACIÓN
// ==========================

app.post('/api/registro', async (req, res) => {
  try {
    const { nombre, email, clave } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(clave, salt);
    const nuevoUsuario = new Usuario({ nombre, email, clave: hash });
    await nuevoUsuario.save();
    res.status(201).json({ mensaje: 'Usuario registrado con éxito', id: nuevoUsuario._id });
  } catch (error) {
    res.status(400).json({ error: 'No se pudo registrar el usuario' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, clave } = req.body;
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const passwordOk = await bcrypt.compare(clave, usuario.clave);
    if (!passwordOk) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const datosToken = { id: usuario._id };
    const token = jwt.sign(datosToken, SECRETO, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.post('/api/camisetas/:id/votar', async (req, res) => {
  try {
    const { valor } = req.body;
    if (!valor || valor < 1 || valor > 5) {
      return res.status(400).json({ mensaje: 'El voto debe estar entre 1 y 5' });
    }
    const camiseta = await Camiseta.findById(req.params.id);
    if (!camiseta) {
      return res.status(404).json({ mensaje: 'Camiseta no encontrada' });
    }
    camiseta.votos += 1;
    camiseta.totalPuntos += Number(valor);
    camiseta.calificacion = camiseta.totalPuntos / camiseta.votos;
    camiseta.actualizadoEn = Date.now();
    await camiseta.save();
    res.json({ mensaje: 'Voto registrado correctamente', camiseta });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al votar', error: error.message });
  }
});

// ==========================
// INICIAR SERVIDOR
// ==========================

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});