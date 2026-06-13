const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const multer = require("multer");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
require("dotenv").config();

// static
app.use(express.static(path.join(__dirname, "../public")));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
});

// file upload config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../uploads"));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });

// upload API
app.post("/upload", upload.single("file"), (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            error: "Please select a file"
        });
    }

    res.json({
        file: req.file.filename,
        type: req.file.mimetype,
        original: req.file.originalname
    });
});

// socket
io.on("connection", (socket) => {
    console.log("User:", socket.id);

    // message
    socket.on("message", (data) => {
        io.emit("message", data);
    });

    // file message
    socket.on("fileMessage", (data) => {
        io.emit("fileMessage", data);
    });

    // delete message (chain delete)
    socket.on("deleteMessage", (id) => {
        io.emit("deleteMessage", id);
    });

});

app.use("/uploads/images", express.static(path.join(__dirname,"../uploads/images")));

app.use("/uploads/pdf", express.static(path.join(__dirname,"../uploads/pdf")));

app.use("/uploads/doc", express.static(path.join(__dirname,"../uploads/doc")));

app.use("/uploads/excel", express.static(path.join(__dirname,"../uploads/excel")));

app.use("/uploads/audio", express.static(path.join(__dirname,"../uploads/audio")));

app.use("/uploads/video", express.static(path.join(__dirname,"../uploads/video")));

const PORT = process.env.PORT

server.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});