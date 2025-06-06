const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,                // not MYSQL_HOST
  user: process.env.MYSQLUSER,                // not MYSQL_USER
  password: process.env.MYSQLPASSWORD,        // not MYSQL_PASSWORD
  database: process.env.MYSQL_DATABASE,
  port: 4000, // Use 4000 unless your provider says otherwise
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: { rejectUnauthorized: true } // Required for TiDB Serverless
});

module.exports = pool;
