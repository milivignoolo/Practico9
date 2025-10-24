const mysql = require('mysql2');

// Configura tus datos de conexión
const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'M1lagros05.',
  database: 'Practico9',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = connection;
