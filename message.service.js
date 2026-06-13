const Message = require("../models/message.model");

const saveMessage = async (data) => {
    return await Message.create(data);
};

module.exports = { saveMessage };