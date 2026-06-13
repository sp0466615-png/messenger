require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const multer = require("multer");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ================= PORT =================
const PORT = process.env.PORT || 3000;

// ================= PATHS =================
const publicPath = path.join(__dirname, "../public");
const uploadsPath = path.join(__dirname, "../uploads");

// ================= MIDDLEWARE =================
app.use(express.json());

// Serve frontend
app.use(express.static(publicPath));

// Serve uploads
app.use("/uploads", express.static(uploadsPath));

// ================= HOME ROUTE =================
app.get("/", (req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
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
