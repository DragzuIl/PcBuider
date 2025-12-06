const express = require("express");
const router = express.Router();
const { getConnection } = require("../db");

// Получение всех CPU
router.get("/cpu", async (req, res) => {
    const conn = await getConnection();
    const result = await conn.request().query("SELECT * FROM CPU");
    res.json(result.recordset);
});

// Материнские платы
router.get("/motherboard", async (req, res) => {
    const conn = await getConnection();
    const result = await conn.request().query("SELECT * FROM Motherboard");
    res.json(result.recordset);
});

// GPU
router.get("/gpu", async (req, res) => {
    const conn = await getConnection();
    const result = await conn.request().query("SELECT * FROM GPU");
    res.json(result.recordset);
});

// RAM
router.get("/ram", async (req, res) => {
    const conn = await getConnection();
    const result = await conn.request().query("SELECT * FROM RAM");
    res.json(result.recordset);
});

// Storage
router.get("/storage", async (req, res) => {
    const conn = await getConnection();
    const result = await conn.request().query("SELECT * FROM Storage");
    res.json(result.recordset);
});

// PSU
router.get("/psu", async (req, res) => {
    const conn = await getConnection();
    const result = await conn.request().query("SELECT * FROM PSU");
    res.json(result.recordset);
});

// Case
router.get("/case", async (req, res) => {
    const conn = await getConnection();
    const result = await conn.request().query("SELECT * FROM CasePC");
    res.json(result.recordset);
});

module.exports = router;
