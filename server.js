const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// ==================== PELICULAS ====================

// Listar todas las películas
app.get('/api/peliculas', (req, res) => {
  db.query('SELECT * FROM pelicula', (err, results) =>
    err ? res.status(500).json(err) : res.json(results)
  );
});

// Obtener película por id
app.get('/api/peliculas/:id', (req, res) => {
  db.query('SELECT * FROM pelicula WHERE id = ?', [req.params.id], (err, results) =>
    err ? res.status(500).json(err) : res.json(results[0])
  );
});

// Crear nueva película
app.post('/api/peliculas', (req, res) => {
  const { titulo, titulo_original, year_estreno, duracion, pais_estreno, idDirector, genero } = req.body;
  db.query(
    'INSERT INTO pelicula (titulo, titulo_original, year_estreno, duracion, pais_estreno, idDirector, genero) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [titulo, titulo_original, year_estreno, duracion, pais_estreno, idDirector, genero],
    (err, results) => err ? res.status(500).json(err) : res.json({ id: results.insertId })
  );
});

// Modificar película
app.put('/api/peliculas/:id', (req, res) => {
  const { titulo, titulo_original, year_estreno, duracion, pais_estreno, idDirector, genero } = req.body;
  db.query(
    'UPDATE pelicula SET titulo=?, titulo_original=?, year_estreno=?, duracion=?, pais_estreno=?, idDirector=?, genero=? WHERE id=?',
    [titulo, titulo_original, year_estreno, duracion, pais_estreno, idDirector, genero, req.params.id],
    (err) => err ? res.status(500).json(err) : res.json({ message: 'Película actualizada' })
  );
});

// Eliminar película
app.delete('/api/peliculas/:id', (req, res) => {
  db.query('DELETE FROM pelicula WHERE id=?', [req.params.id], (err) =>
    err ? res.status(500).json(err) : res.json({ message: 'Película eliminada' })
  );
});

// Películas con su director
app.get('/api/peliculas/director', (req, res) => {
  const query = `
    SELECT p.titulo, d.nombre AS director
    FROM pelicula p
    JOIN director d ON p.idDirector = d.id
  `;
  db.query(query, (err, results) => err ? res.status(500).json(err) : res.json(results));
});

// Películas con promedio de calificaciones
app.get('/api/peliculas/promedio', (req, res) => {
  const query = `
    SELECT p.titulo, ROUND(AVG(c.calificacion),1) AS promedio
    FROM pelicula p
    JOIN calificacion c ON p.id = c.id_pelicula
    GROUP BY p.titulo
  `;
  db.query(query, (err, results) => err ? res.status(500).json(err) : res.json(results));
});

// Películas con sus actores
app.get('/api/peliculas/actores', (req, res) => {
  const query = `
    SELECT p.titulo, a.nombre AS actor
    FROM peliculaactor pa
    JOIN pelicula p ON pa.id_pelicula = p.id
    JOIN actor a ON pa.id_actor = a.id
    ORDER BY p.titulo
  `;
  db.query(query, (err, results) => err ? res.status(500).json(err) : res.json(results));
});

// Películas con promedio > 8.5
app.get('/api/peliculas/mejor', (req, res) => {
  const query = `
    SELECT p.titulo, ROUND(AVG(c.calificacion),1) AS promedio_calificacion
    FROM pelicula p
    JOIN calificacion c ON p.id = c.id_pelicula
    GROUP BY p.titulo
    HAVING AVG(c.calificacion) > 8.5
  `;
  db.query(query, (err, results) => err ? res.status(500).json(err) : res.json(results));
});

// Películas con más de una calificación
app.get('/api/peliculas/cantidad-calificaciones', (req, res) => {
  const query = `
    SELECT p.titulo, COUNT(c.id) AS cantidad_calificaciones
    FROM pelicula p
    LEFT JOIN calificacion c ON p.id = c.id_pelicula
    GROUP BY p.titulo
    HAVING COUNT(c.id) > 1
  `;
  db.query(query, (err, results) => err ? res.status(500).json(err) : res.json(results));
});

// ==================== ACTORES ====================

// Listar todos los actores
app.get('/api/actores', (req, res) => {
  db.query('SELECT * FROM actor', (err, results) => err ? res.status(500).json(err) : res.json(results));
});

// Obtener actor por id
app.get('/api/actores/:id', (req, res) => {
  db.query('SELECT * FROM actor WHERE id=?', [req.params.id], (err, results) =>
    err ? res.status(500).json(err) : res.json(results[0])
  );
});

// Crear actor
app.post('/api/actores', (req, res) => {
  const { nombre, fecha_nacimiento, nacionalidad } = req.body;
  db.query(
    'INSERT INTO actor (nombre, fecha_nacimiento, nacionalidad) VALUES (?, ?, ?)',
    [nombre, fecha_nacimiento, nacionalidad],
    (err, results) => err ? res.status(500).json(err) : res.json({ id: results.insertId })
  );
});

// Modificar actor
app.put('/api/actores/:id', (req, res) => {
  const { nombre, fecha_nacimiento, nacionalidad } = req.body;
  db.query(
    'UPDATE actor SET nombre=?, fecha_nacimiento=?, nacionalidad=? WHERE id=?',
    [nombre, fecha_nacimiento, nacionalidad, req.params.id],
    (err) => err ? res.status(500).json(err) : res.json({ message: 'Actor actualizado' })
  );
});

// Eliminar actor
app.delete('/api/actores/:id', (req, res) => {
  db.query('DELETE FROM actor WHERE id=?', [req.params.id], (err) =>
    err ? res.status(500).json(err) : res.json({ message: 'Actor eliminado' })
  );
});

// ==================== DIRECTORES ====================

// Listar todos los directores
app.get('/api/directores', (req, res) => {
  db.query('SELECT * FROM director', (err, results) => err ? res.status(500).json(err) : res.json(results));
});

// Obtener director por id
app.get('/api/directores/:id', (req, res) => {
  db.query('SELECT * FROM director WHERE id=?', [req.params.id], (err, results) =>
    err ? res.status(500).json(err) : res.json(results[0])
  );
});

// Crear director
app.post('/api/directores', (req, res) => {
  const { nombre, nacionalidad } = req.body;
  db.query(
    'INSERT INTO director (nombre, nacionalidad) VALUES (?, ?)',
    [nombre, nacionalidad],
    (err, results) => err ? res.status(500).json(err) : res.json({ id: results.insertId })
  );
});

// Modificar director
app.put('/api/directores/:id', (req, res) => {
  const { nombre, nacionalidad } = req.body;
  db.query(
    'UPDATE director SET nombre=?, nacionalidad=? WHERE id=?',
    [nombre, nacionalidad, req.params.id],
    (err) => err ? res.status(500).json(err) : res.json({ message: 'Director actualizado' })
  );
});

// Eliminar director
app.delete('/api/directores/:id', (req, res) => {
  db.query('DELETE FROM director WHERE id=?', [req.params.id], (err) =>
    err ? res.status(500).json(err) : res.json({ message: 'Director eliminado' })
  );
});

// ==================== CALIFICACIONES ====================

// Listar todas las calificaciones
app.get('/api/calificaciones', (req, res) => {
  db.query('SELECT * FROM calificacion', (err, results) => err ? res.status(500).json(err) : res.json(results));
});

// Obtener calificación por id
app.get('/api/calificaciones/:id', (req, res) => {
  db.query('SELECT * FROM calificacion WHERE id=?', [req.params.id], (err, results) =>
    err ? res.status(500).json(err) : res.json(results[0])
  );
});

// Crear calificación
app.post('/api/calificaciones', (req, res) => {
  const { id_pelicula, nombre_completo, calificacion, comentario, fecha } = req.body;
  db.query(
    'INSERT INTO calificacion (id_pelicula, nombre_completo, calificacion, comentario, fecha) VALUES (?, ?, ?, ?, ?)',
    [id_pelicula, nombre_completo, calificacion, comentario, fecha],
    (err, results) => err ? res.status(500).json(err) : res.json({ id: results.insertId })
  );
});

// Modificar calificación
app.put('/api/calificaciones/:id', (req, res) => {
  const { id_pelicula, nombre_completo, calificacion, comentario, fecha } = req.body;
  db.query(
    'UPDATE calificacion SET id_pelicula=?, nombre_completo=?, calificacion=?, comentario=?, fecha=? WHERE id=?',
    [id_pelicula, nombre_completo, calificacion, comentario, fecha, req.params.id],
    (err) => err ? res.status(500).json(err) : res.json({ message: 'Calificación actualizada' })
  );
});

// Eliminar calificación
app.delete('/api/calificaciones/:id', (req, res) => {
  db.query('DELETE FROM calificacion WHERE id=?', [req.params.id], (err) =>
    err ? res.status(500).json(err) : res.json({ message: 'Calificación eliminada' })
  );
});

// ==================== SERVIDOR ====================
const PORT = 3001;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
