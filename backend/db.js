const sql = require("mssql");

const config = {
    user: "sa",           // или другой твой логин SQL
    password: "123",
    server: "localhost",  // если база на этом ПК
    database: "PcBuider", // имя твоей БД
    options: {
        trustServerCertificate: true // ОБЯЗАТЕЛЬНО для MSSQL Express и локальных серверов
    }
};

async function getConnection() {
    try {
        const pool = await sql.connect(config);
        return pool;
    } catch (err) {
        console.error("Ошибка подключения:", err);
    }
}

module.exports = { getConnection, sql };
