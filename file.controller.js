const { saveFile } = require("../services/file.service");

const handleFile = async (data, io) => {
    const file = await saveFile(data);
    io.emit("fileMessage", file);
};

module.exports = { handleFile };