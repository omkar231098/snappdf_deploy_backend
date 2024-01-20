const express = require("express");
const PdfRouter = express.Router();
const multer = require('multer');

const { CreatePDF } = require("../Controllers/pdf.controller");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// const { authenticate } = require("../Auth/verifyToken");
const limiter = require('../RateLimiter/rate.limiter')

PdfRouter.use(express.json());

// Define routes with associated controller methods and authentication middleware
PdfRouter.post("/submit",limiter,upload.single('photo'),CreatePDF);  // Added a leading slash ("/")
// PdfRouter.get("/preview", PreviewPDF);  // Added a leading slash ("/")
// PdfRouter.get("/download/:id", DownloadPDF);  // Added a leading slash ("/")

module.exports = { PdfRouter };
