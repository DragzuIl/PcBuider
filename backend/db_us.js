const sql = require('mssql');

const config = {
  user: 'db_user',
  password: 'db_pass',
  server: '192.168.0.35',
  database: 'PcBuilder',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to MSSQL');
    return pool;
  })
  .catch(err => console.log('DB Connection Failed: ', err));

module.exports = {
  sql,
  poolPromise
};
