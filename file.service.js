const File = require("../models/file.model");

const saveFile = async (data) => {
    return await File.create(data);
};

module.exports = { saveFile };