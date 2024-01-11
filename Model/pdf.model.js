const mongoose = require("mongoose");



const PdfSchema = new mongoose.Schema({
  name: String,
  age: Number,
  address: String,
  photo: Buffer, // Binary data type for the image
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const PdfModel = mongoose.model("Pdf", PdfSchema);

module.exports = { PdfModel };
