import express from "express";
import sql from "mssql";
const router = express.Router();

// Получение всех CPU
router.get("/cpu", async (req, res) => {
    try {
        const result = await sql.query("SELECT * FROM CPU");
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
});

// Материнские платы
router.get("/motherboard", async (req, res) => {
    try {
        const result = await sql.query("SELECT * FROM Motherboard");
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
});

// GPU
router.get("/gpu", async (req, res) => {
    try {
        const result = await sql.query("SELECT * FROM GPU");
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
});

// RAM
router.get("/ram", async (req, res) => {
    try {
        const result = await sql.query("SELECT * FROM RAM");
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
});

// Storage
router.get("/storage", async (req, res) => {
    try {
        const result = await sql.query("SELECT * FROM Storage");
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
});

// PSU
router.get("/psu", async (req, res) => {
    try {
        const result = await sql.query("SELECT * FROM PSU");
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
});

// Case
router.get("/case", async (req, res) => {
    try {
        const result = await sql.query("SELECT * FROM CasePC");
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
});

export default router;
