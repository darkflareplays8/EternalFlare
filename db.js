const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,                // not MYSQL_HOST
  user: process.env.MYSQLUSER,                // not MYSQL_USER
  password: process.env.MYSQLPASSWORD,        // not MYSQL_PASSWORD
  database: process.env.MYSQL_DATABASE,
  port: 4000, // most likely, unless Railway says otherwise
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
