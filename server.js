require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const multer = require("multer");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// ================= PATHS =================
const publicPath = __dirname; // root folder
const uploadsPath = path.join(__dirname, "uploads");

// ================= MIDDLEWARE =================
app.use(express.json());

app.use(express.static(publicPath));

app.use("/uploads", express.static(uploadsPath));

// ================= HOME ROUTE =================
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// ================= CHAT ROUTE =================
app.get("/chat", (req, res) => {
    res.sendFile(path.join(__dirname, "chat.html"));
});

// ================= MULTER CONFIG =================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });

// ================= UPLOAD API =================
app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file selected" });
    }

    res.json({
        file: req.file.filename,
        type: req.file.mimetype,
        original: req.file.originalname
    });
});

// ================= SOCKET.IO =================
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("message", (data) => {
        io.emit("message", data);
    });

    socket.on("fileMessage", (data) => {
        io.emit("fileMessage", data);
    });

    socket.on("deleteMessage", (id) => {
        io.emit("deleteMessage", id);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// ================= START SERVER =================
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
