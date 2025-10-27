const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// ==================== PELÍCULAS ====================

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
  const { titulo, titulo_original, year_estreno, duracion, pais_estreno, idDirector, genero, url } = req.body;
  db.query(
    'INSERT INTO pelicula (titulo, titulo_original, year_estreno, duracion, pais_estreno, idDirector, genero, url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [titulo, titulo_original, year_estreno, duracion, pais_estreno, idDirector, genero, url],
    (err, results) => err ? res.status(500).json(err) : res.json({ id: results.insertId })
  );
});

// Modificar película
app.put('/api/peliculas/:id', (req, res) => {
  const { titulo, titulo_original, year_estreno, duracion, pais_estreno, idDirector, genero, url } = req.body;
  db.query(
    'UPDATE pelicula SET titulo=?, titulo_original=?, year_estreno=?, duracion=?, pais_estreno=?, idDirector=?, genero=?, url=? WHERE id=?',
    [titulo, titulo_original, year_estreno, duracion, pais_estreno, idDirector, genero, url, req.params.id],
    (err) => err ? res.status(500).json(err) : res.json({ message: 'Película actualizada' })
  );
});

// Eliminar película
app.delete('/api/peliculas/:id', (req, res) => {
  db.query('DELETE FROM pelicula WHERE id=?', [req.params.id], (err) =>
    err ? res.status(500).json(err) : res.json({ message: 'Película eliminada' })
  );
});

// Películas con su director (detalles más completos)
app.get('/api/peliculas/director', (req, res) => {
  const query = `
    SELECT 
      p.id AS id_pelicula,
      p.titulo AS titulo_pelicula,
      p.year_estreno,
      p.url,
      d.id AS id_director,
      d.nombre AS nombre_director,
      d.nacionalidad AS nacionalidad_director
    FROM pelicula p
    INNER JOIN director d ON p.idDirector = d.id
    ORDER BY p.titulo;
  `;
  db.query(query, (err, results) =>
    err ? res.status(500).json(err) : res.json(results)
  );
});

// Películas con su promedio de calificaciones
app.get('/api/peliculas/promedio', (req, res) => {
  const query = `
    SELECT 
      p.id AS id_pelicula,
      p.url,
      p.titulo AS titulo_pelicula,
      ROUND(AVG(c.calificacion), 1) AS promedio_calificacion
    FROM pelicula p
    INNER JOIN calificacion c ON p.id = c.id_pelicula
    GROUP BY p.id, p.titulo
    ORDER BY promedio_calificacion DESC;
  `;
  db.query(query, (err, results) =>
    err ? res.status(500).json(err) : res.json(results)
  );
});

// Películas con sus actores (con nombres completos)
app.get('/api/peliculas/actores', (req, res) => {
  const query = `
    SELECT 
      p.id AS id_pelicula,
      p.titulo AS titulo_pelicula,
      p.url,
      a.id AS id_actor,
      a.nombre AS nombre_actor,
      a.nacionalidad AS nacionalidad_actor
    FROM peliculaactor pa
    INNER JOIN pelicula p ON pa.id_pelicula = p.id
    INNER JOIN actor a ON pa.id_actor = a.id
    ORDER BY p.titulo, a.nombre;
  `;
  db.query(query, (err, results) =>
    err ? res.status(500).json(err) : res.json(results)
  );
});

// Películas con promedio > 8.5
app.get('/api/peliculas/mejor', (req, res) => {
  const query = `
    SELECT 
      p.id AS id_pelicula,
      p.url,
      p.titulo AS titulo_pelicula,
      ROUND(AVG(c.calificacion), 1) AS promedio_calificacion
    FROM pelicula p
    INNER JOIN calificacion c ON p.id = c.id_pelicula
    GROUP BY p.id, p.titulo
    HAVING promedio_calificacion > 8.5
    ORDER BY promedio_calificacion DESC;
  `;
  db.query(query, (err, results) =>
    err ? res.status(500).json(err) : res.json(results)
  );
});

// Películas con más de una calificación
app.get('/api/peliculas/cantidad-calificaciones', (req, res) => {
  const query = `
    SELECT 
      p.id AS id_pelicula,
      p.url,
      p.titulo AS titulo_pelicula,
      COUNT(c.id) AS cantidad_calificaciones
    FROM pelicula p
    LEFT JOIN calificacion c ON p.id = c.id_pelicula
    GROUP BY p.id, p.titulo
    HAVING COUNT(c.id) > 1
    ORDER BY cantidad_calificaciones DESC;
  `;
  db.query(query, (err, results) =>
    err ? res.status(500).json(err) : res.json(results)
  );
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
const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
