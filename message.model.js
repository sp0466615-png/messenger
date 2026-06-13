const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    messageId: String,
    sender: String,
    receiver: String, // null = public
    type: { type: String, default: "text" }, // text | file
    content: String,
    fileName: String,
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Message", messageSchema);