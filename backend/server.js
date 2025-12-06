import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3000;

// Для __dirname в ES-модулях
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Пример API
app.get("/api/test", (req, res) => {
    res.json({ message: "API OK" });
});

// Отдача статических файлов (если есть фронтенд)
app.use(express.static(path.join(__dirname, "../frontend")));

// Fallback БЕЗ "*" — просто конкретный путь "/"
// Никаких паттернов! Express 5 принимает это.
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
