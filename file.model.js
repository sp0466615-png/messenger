const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
    filename: String,
    originalName: String,
    uploadedBy: String
});

module.exports = mongoose.model("File", fileSchema);