import express from "express";
import cors from "cors";
import sql from "mssql";
import path from "path";
import { fileURLToPath } from "url";
import componentsRouter from "./routes/components.js";

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

const config = {
    user: "sa",
    password: "СложныйПароль123!",
    server: "localhost",
    database: "PcBuilder",
    options: {
        encrypt: false,
        trustServerCertificate: true
    },
    port: 1433
};

async function startServer() {
    try {
        await sql.connect(config);
        console.log("DB connected!");
    } catch (err) {
        console.error("DB Connection Error:", err);
        return;
    }

    const PORT = 3000;
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

startServer();
