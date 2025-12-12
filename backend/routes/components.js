import express from "express";
import sql from "mssql";
const router = express.Router();

// CPU
router.get("/cpu", async (req, res) => {
    try {
        const result = await sql.query(`
      SELECT 
        c.id,
        c.name,
        c.cores,
        c.threads,
        c.frequency,
        c.price,
        c.socket_id,
        s.socket AS socket
      FROM CPU c
      JOIN Sockets s ON c.socket_id = s.id
    `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
});

router.post("/cpu", async (req, res) => {
    const { name, cores, threads, frequency, socket, price } = req.body; // socket = "AM5"
    console.log("POST /cpu body:", req.body);

    try {
        const request = new sql.Request();

        // находим id сокета по названию
        const normalizedSocket = String(socket).trim();
        const socketResult = await request
            .input("socket", sql.NVarChar, normalizedSocket)
            .query("SELECT id FROM Sockets WHERE socket = @socket");


        if (socketResult.recordset.length === 0) {
            return res.status(400).json({ error: "Неизвестный сокет" });
        }

        const socket_id = socketResult.recordset[0].id;

        await request
            .input("name", sql.NVarChar, name)
            .input("cores", sql.Int, cores)
            .input("threads", sql.Int, threads)
            .input("frequency", sql.Float, frequency)
            .input("socket_id", sql.Int, socket_id)
            .input("price", sql.Int, price)
            .query(`
        INSERT INTO CPU (name, cores, threads, frequency, socket_id, price)
        VALUES (@name, @cores, @threads, @frequency, @socket_id, @price)
      `);

        res.status(201).json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
});


router.put("/cpu/:id", async (req, res) => {
    const { id } = req.params;
    const { name, cores, threads, frequency, socket, price } = req.body;
    console.log("PUT /cpu body:", id, req.body);

    try {
        const request = new sql.Request();

        const socketResult = await request
            .input("socket", sql.NVarChar, socket)
            .query("SELECT id FROM Sockets WHERE socket = @socket");

        if (socketResult.recordset.length === 0) {
            return res.status(400).json({ error: "Неизвестный сокет" });
        }

        const socket_id = socketResult.recordset[0].id;
        console.log("Update CPU:", { id, name, cores, threads, frequency, socket_id, price });
        await request
            .input("id", sql.Int, id)
            .input("name", sql.NVarChar, name)
            .input("cores", sql.Int, cores)
            .input("threads", sql.Int, threads)
            .input("frequency", sql.Float, frequency)
            .input("socket_id", sql.Int, socket_id)
            .input("price", sql.Int, price)
            .query(`
        UPDATE CPU
        SET name = @name,
            cores = @cores,
            threads = @threads,
            frequency = @frequency,
            socket_id = @socket_id,
            price = @price
        WHERE id = @id
      `);

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
});




// Motherboard
router.get("/motherboard", async (req, res) => {
    try {
        const result = await sql.query(`
      SELECT 
        m.id,
        m.name,
        m.form_factor,
        m.max_ram,
        m.ram_type,
        m.price,
        m.socket_id,
        s.socket AS socket
      FROM Motherboard m
      JOIN Sockets s ON m.socket_id = s.id
    `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
});

router.post("/motherboard", async (req, res) => {
  const { name, socket, form_factor, max_ram, ram_type, price } = req.body;

  try {
    const request = new sql.Request();
    await request
      .input("name", sql.NVarChar, name)
      .input("socket", sql.NVarChar, socket)
      .input("form_factor", sql.NVarChar, form_factor)
      .input("max_ram", sql.Int, max_ram)
      .input("ram_type", sql.NVarChar, ram_type)
      .input("price", sql.Int, price)
      .query(`
        INSERT INTO Motherboard (name, socket, form_factor, max_ram, ram_type, price)
        VALUES (@name, @socket, @form_factor, @max_ram, @ram_type, @price)
      `);

    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

router.put("/motherboard/:id", async (req, res) => {
  const { id } = req.params;
  const { name, socket, form_factor, max_ram, ram_type, price } = req.body;

  try {
    const request = new sql.Request();
    await request
      .input("id", sql.Int, id)
      .input("name", sql.NVarChar, name)
      .input("socket", sql.NVarChar, socket)
      .input("form_factor", sql.NVarChar, form_factor)
      .input("max_ram", sql.Int, max_ram)
      .input("ram_type", sql.NVarChar, ram_type)
      .input("price", sql.Int, price)
      .query(`
        UPDATE Motherboard
        SET name = @name,
            socket = @socket,
            form_factor = @form_factor,
            max_ram = @max_ram,
            ram_type = @ram_type,
            price = @price
        WHERE id = @id
      `);

    res.json({ success: true });
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

router.post("/gpu", async (req, res) => {
  const { name, vram, price } = req.body;
  try {
    const request = new sql.Request();
    await request
      .input("name", sql.NVarChar, name)
      .input("vram", sql.Int, vram)
      .input("price", sql.Int, price)
      .query(`
        INSERT INTO GPU (name, vram, price)
        VALUES (@name, @vram, @price)
      `);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

router.put("/gpu/:id", async (req, res) => {
  const { id } = req.params;
  const { name, vram, price } = req.body;
  try {
    const request = new sql.Request();
    await request
      .input("id", sql.Int, id)
      .input("name", sql.NVarChar, name)
      .input("vram", sql.Int, vram)
      .input("price", sql.Int, price)
      .query(`
        UPDATE GPU
        SET name = @name,
            vram = @vram,
            price = @price
        WHERE id = @id
      `);
    res.json({ success: true });
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

router.post("/ram", async (req, res) => {
  const { name, size, frequency, ram_type, price } = req.body;
  try {
    const request = new sql.Request();
    await request
      .input("name", sql.NVarChar, name)
      .input("size", sql.Int, size)
      .input("frequency", sql.Int, frequency)
      .input("ram_type", sql.NVarChar, ram_type)
      .input("price", sql.Int, price)
      .query(`
        INSERT INTO RAM (name, size, frequency, ram_type, price)
        VALUES (@name, @size, @frequency, @ram_type, @price)
      `);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

router.put("/ram/:id", async (req, res) => {
  const { id } = req.params;
  const { name, size, frequency, ram_type, price } = req.body;
  try {
    const request = new sql.Request();
    await request
      .input("id", sql.Int, id)
      .input("name", sql.NVarChar, name)
      .input("size", sql.Int, size)
      .input("frequency", sql.Int, frequency)
      .input("ram_type", sql.NVarChar, ram_type)
      .input("price", sql.Int, price)
      .query(`
        UPDATE RAM
        SET name = @name,
            size = @size,
            frequency = @frequency,
            ram_type = @ram_type,
            price = @price
        WHERE id = @id
      `);
    res.json({ success: true });
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

router.post("/storage", async (req, res) => {
  const { name, type, size_gb, price } = req.body;
  try {
    const request = new sql.Request();
    await request
      .input("name", sql.NVarChar, name)
      .input("type", sql.NVarChar, type)
      .input("size_gb", sql.Int, size_gb)
      .input("price", sql.Int, price)
      .query(`
        INSERT INTO Storage (name, type, size_gb, price)
        VALUES (@name, @type, @size_gb, @price)
      `);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

router.put("/storage/:id", async (req, res) => {
  const { id } = req.params;
  const { name, type, size_gb, price } = req.body;
  try {
    const request = new sql.Request();
    await request
      .input("id", sql.Int, id)
      .input("name", sql.NVarChar, name)
      .input("type", sql.NVarChar, type)
      .input("size_gb", sql.Int, size_gb)
      .input("price", sql.Int, price)
      .query(`
        UPDATE Storage
        SET name = @name,
            type = @type,
            size_gb = @size_gb,
            price = @price
        WHERE id = @id
      `);
    res.json({ success: true });
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

router.post("/psu", async (req, res) => {
  const { name, wattage, certificate, price } = req.body;
  try {
    const request = new sql.Request();
    await request
      .input("name", sql.NVarChar, name)
      .input("wattage", sql.Int, wattage)
      .input("certificate", sql.NVarChar, certificate)
      .input("price", sql.Int, price)
      .query(`
        INSERT INTO PSU (name, wattage, certificate, price)
        VALUES (@name, @wattage, @certificate, @price)
      `);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

router.put("/psu/:id", async (req, res) => {
  const { id } = req.params;
  const { name, wattage, certificate, price } = req.body;
  try {
    const request = new sql.Request();
    await request
      .input("id", sql.Int, id)
      .input("name", sql.NVarChar, name)
      .input("wattage", sql.Int, wattage)
      .input("certificate", sql.NVarChar, certificate)
      .input("price", sql.Int, price)
      .query(`
        UPDATE PSU
        SET name = @name,
            wattage = @wattage,
            certificate = @certificate,
            price = @price
        WHERE id = @id
      `);
    res.json({ success: true });
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

router.post("/case", async (req, res) => {
  const { name, form_factor_support, price, towerType } = req.body;

  try {
    const request = new sql.Request();
    await request
      .input("name", sql.NVarChar, name)
      .input("form_factor_support", sql.NVarChar, form_factor_support)
      .input("price", sql.Int, price)
      .input("towerType", sql.NChar, towerType)
      .query(`
        INSERT INTO CasePC (name, form_factor_support, price, [tower-type])
        VALUES (@name, @form_factor_support, @price, @towerType)
      `);

    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

router.put("/case/:id", async (req, res) => {
  const { id } = req.params;
  const { name, form_factor_support, price, towerType } = req.body;

  try {
    const request = new sql.Request();
    await request
      .input("id", sql.Int, id)
      .input("name", sql.NVarChar, name)
      .input("form_factor_support", sql.NVarChar, form_factor_support)
      .input("price", sql.Int, price)
      .input("towerType", sql.NChar, towerType)
      .query(`
        UPDATE CasePC
        SET name = @name,
            form_factor_support = @form_factor_support,
            price = @price,
            [tower-type] = @towerType
        WHERE id = @id
      `);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

export default router;
