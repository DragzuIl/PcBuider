// routes/components.js
import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

// ================= CPU =================

// GET /api/components/cpu
router.get("/cpu", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("cpu")
      .select(`
        id,
        name,
        cores,
        threads,
        frequency,
        price,
        socket_id,
        sockets ( socket )
      `)
      .order("id", { ascending: true });

    if (error) throw error;

    const result = data.map(row => ({
      id: row.id,
      name: row.name,
      cores: row.cores,
      threads: row.threads,
      frequency: row.frequency,
      price: row.price,
      socket_id: row.socket_id,
      socket: row.sockets?.socket || null
    }));

    res.json(result);
  } catch (err) {
    console.error("GET /cpu error:", err);
    res.status(500).send("Database error");
  }
});

// POST /api/components/cpu
router.post("/cpu", async (req, res) => {
  const { name, cores, threads, frequency, socket, price } = req.body;
  console.log("POST /cpu body:", req.body);

  try {
    const normalizedSocket = String(socket).trim();

    const { data: socketRow, error: sockErr } = await supabase
      .from("sockets")
      .select("id")
      .eq("socket", normalizedSocket)
      .limit(1)
      .maybeSingle();

    if (sockErr) throw sockErr;
    if (!socketRow) {
      return res.status(400).json({ error: "Неизвестный сокет" });
    }

    const socket_id = socketRow.id;

    const { error } = await supabase.from("cpu").insert([{
      name,
      cores,
      threads,
      frequency,
      socket_id,
      price
    }]);

    if (error) throw error;

    res.status(201).json({ success: true });
  } catch (err) {
    console.error("POST /cpu error:", err);
    res.status(500).send("Database error");
  }
});

// PUT /api/components/cpu/:id
router.put("/cpu/:id", async (req, res) => {
  const { id } = req.params;
  const { name, cores, threads, frequency, socket, price } = req.body;
  console.log("PUT /cpu body:", id, req.body);

  try {
    const normalizedSocket = String(socket).trim();

    const { data: socketRow, error: sockErr } = await supabase
      .from("sockets")
      .select("id")
      .eq("socket", normalizedSocket)
      .limit(1)
      .maybeSingle();

    if (sockErr) throw sockErr;
    if (!socketRow) {
      return res.status(400).json({ error: "Неизвестный сокет" });
    }

    const socket_id = socketRow.id;

    const { error } = await supabase
      .from("cpu")
      .update({ name, cores, threads, frequency, socket_id, price })
      .eq("id", Number(id));

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error("PUT /cpu error:", err);
    res.status(500).send("Database error");
  }
});

// ================= Motherboard =================

// GET /api/components/motherboard
router.get("/motherboard", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("motherboard")
      .select(`
        id,
        name,
        form_factor,
        max_ram,
        ram_type,
        price,
        socket_id,
        sockets ( socket )
      `)
      .order("id", { ascending: true });

    if (error) throw error;

    const result = data.map(row => ({
      id: row.id,
      name: row.name,
      form_factor: row.form_factor,
      max_ram: row.max_ram,
      ram_type: row.ram_type,
      price: row.price,
      socket_id: row.socket_id,
      socket: row.sockets?.socket || null
    }));

    res.json(result);
  } catch (err) {
    console.error("GET /motherboard error:", err);
    res.status(500).send("Database error");
  }
});

// POST /api/components/motherboard
router.post("/motherboard", async (req, res) => {
  const { name, socket, form_factor, max_ram, ram_type, price } = req.body;

  try {
    const normalizedSocket = String(socket).trim();

    const { data: socketRow, error: sockErr } = await supabase
      .from("sockets")
      .select("id")
      .eq("socket", normalizedSocket)
      .limit(1)
      .maybeSingle();

    if (sockErr) throw sockErr;
    if (!socketRow) {
      return res.status(400).json({ error: "Неизвестный сокет" });
    }

    const socket_id = socketRow.id;

    const { error } = await supabase.from("motherboard").insert([{
      name,
      socket_id,
      form_factor,
      max_ram,
      ram_type,
      price
    }]);

    if (error) throw error;

    res.status(201).json({ success: true });
  } catch (err) {
    console.error("POST /motherboard error:", err);
    res.status(500).send("Database error");
  }
});

// PUT /api/components/motherboard/:id
router.put("/motherboard/:id", async (req, res) => {
  const { id } = req.params;
  const { name, socket, form_factor, max_ram, ram_type, price } = req.body;

  try {
    const normalizedSocket = String(socket).trim();

    const { data: socketRow, error: sockErr } = await supabase
      .from("sockets")
      .select("id")
      .eq("socket", normalizedSocket)
      .limit(1)
      .maybeSingle();

    if (sockErr) throw sockErr;
    if (!socketRow) {
      return res.status(400).json({ error: "Неизвестный сокет" });
    }

    const socket_id = socketRow.id;

    const { error } = await supabase
      .from("motherboard")
      .update({
        name,
        socket_id,
        form_factor,
        max_ram,
        ram_type,
        price
      })
      .eq("id", Number(id));

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error("PUT /motherboard error:", err);
    res.status(500).send("Database error");
  }
});

// ================= GPU =================

router.get("/gpu", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("gpu")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("GET /gpu error:", err);
    res.status(500).send("Database error");
  }
});

router.post("/gpu", async (req, res) => {
  const { name, vram, price } = req.body;

  try {
    const { error } = await supabase.from("gpu").insert([{
      name,
      vram,
      price
    }]);

    if (error) throw error;

    res.status(201).json({ success: true });
  } catch (err) {
    console.error("POST /gpu error:", err);
    res.status(500).send("Database error");
  }
});

router.put("/gpu/:id", async (req, res) => {
  const { id } = req.params;
  const { name, vram, price } = req.body;

  try {
    const { error } = await supabase
      .from("gpu")
      .update({ name, vram, price })
      .eq("id", Number(id));

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error("PUT /gpu error:", err);
    res.status(500).send("Database error");
  }
});

// ================= RAM =================

router.get("/ram", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("ram")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("GET /ram error:", err);
    res.status(500).send("Database error");
  }
});

router.post("/ram", async (req, res) => {
  const { name, size, frequency, ram_type, price } = req.body;

  try {
    const { error } = await supabase.from("ram").insert([{
      name,
      size,
      frequency,
      ram_type,
      price
    }]);

    if (error) throw error;

    res.status(201).json({ success: true });
  } catch (err) {
    console.error("POST /ram error:", err);
    res.status(500).send("Database error");
  }
});

router.put("/ram/:id", async (req, res) => {
  const { id } = req.params;
  const { name, size, frequency, ram_type, price } = req.body;

  try {
    const { error } = await supabase
      .from("ram")
      .update({ name, size, frequency, ram_type, price })
      .eq("id", Number(id));

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error("PUT /ram error:", err);
    res.status(500).send("Database error");
  }
});

// ================= Storage =================

router.get("/storage", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("storage")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("GET /storage error:", err);
    res.status(500).send("Database error");
  }
});

router.post("/storage", async (req, res) => {
  const { name, type, size_gb, price } = req.body;

  try {
    const { error } = await supabase.from("storage").insert([{
      name,
      type,
      size_gb,
      price
    }]);

    if (error) throw error;

    res.status(201).json({ success: true });
  } catch (err) {
    console.error("POST /storage error:", err);
    res.status(500).send("Database error");
  }
});

router.put("/storage/:id", async (req, res) => {
  const { id } = req.params;
  const { name, type, size_gb, price } = req.body;

  try {
    const { error } = await supabase
      .from("storage")
      .update({ name, type, size_gb, price })
      .eq("id", Number(id));

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error("PUT /storage error:", err);
    res.status(500).send("Database error");
  }
});

// ================= PSU =================

router.get("/psu", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("psu")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("GET /psu error:", err);
    res.status(500).send("Database error");
  }
});

router.post("/psu", async (req, res) => {
  const { name, wattage, certificate, price } = req.body;

  try {
    const { error } = await supabase.from("psu").insert([{
      name,
      wattage,
      certificate,
      price
    }]);

    if (error) throw error;

    res.status(201).json({ success: true });
  } catch (err) {
    console.error("POST /psu error:", err);
    res.status(500).send("Database error");
  }
});

router.put("/psu/:id", async (req, res) => {
  const { id } = req.params;
  const { name, wattage, certificate, price } = req.body;

  try {
    const { error } = await supabase
      .from("psu")
      .update({ name, wattage, certificate, price })
      .eq("id", Number(id));

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error("PUT /psu error:", err);
    res.status(500).send("Database error");
  }
});

// ================= Case =================

router.get("/case", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("casepc")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("GET /case error:", err);
    res.status(500).send("Database error");
  }
});

router.post("/case", async (req, res) => {
  const { name, form_factor_support, price, towerType } = req.body;

  try {
    const { error } = await supabase.from("casepc").insert([{
      name,
      form_factor_support,
      price,
      "tower-type": towerType
    }]);

    if (error) throw error;

    res.status(201).json({ success: true });
  } catch (err) {
    console.error("POST /case error:", err);
    res.status(500).send("Database error");
  }
});

router.put("/case/:id", async (req, res) => {
  const { id } = req.params;
  const { name, form_factor_support, price, towerType } = req.body;

  try {
    const { error } = await supabase
      .from("casepc")
      .update({
        name,
        form_factor_support,
        price,
        "tower-type": towerType
      })
      .eq("id", Number(id));

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error("PUT /case error:", err);
    res.status(500).send("Database error");
  }
});

export default router;
