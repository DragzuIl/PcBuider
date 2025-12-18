import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import componentsRouter from "./routes/components.js";
import { supabase } from "./supabaseClient.js";

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/api/components", componentsRouter);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

async function startServer() {
  // Для Supabase отдельного connect не нужно – клиент статический.
  // Можно сделать простой тест-запрос:
  const { error } = await supabase.from("cpu").select("id").limit(1);
  if (error) {
    console.error("DB Connection Error (Supabase):", error);
    return;
  }
  console.log("Supabase DB connected!");

  const PORT = 3000;
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

startServer();
