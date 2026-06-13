const { saveMessage } = require("../services/message.service");

const handleMessage = async (data, io) => {
    const msg = await saveMessage(data);
    io.emit("message", msg);
};

module.exports = { handleMessage };