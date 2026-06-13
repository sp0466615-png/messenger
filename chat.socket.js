const { handleMessage } = require("../controllers/message.controller");
const { handleFile } = require("../controllers/file.controller");

let users = {};

module.exports = (io, socket) => {

    socket.on("join", (user) => {
        users[socket.id] = user;
        io.emit("users", Object.values(users));
    });

    socket.on("message", (data) => {
        handleMessage(data, io);
    });

    socket.on("file", (data) => {
        handleFile(data, io);
    });

    socket.on("delete", (id) => {
        io.emit("delete", id);
    });

    socket.on("disconnect", () => {
        delete users[socket.id];
        io.emit("users", Object.values(users));
    });
};