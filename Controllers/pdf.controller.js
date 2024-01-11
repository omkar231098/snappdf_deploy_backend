const getLogger = require('../Logger/logger');
const logger = getLogger('auth');
const { PdfModel } = require('../Model/pdf.model');
const { UserModel } = require('../Model/user.model');
const multer = require('multer');
const Grid = require('gridfs-stream');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');

// Create mongoose connection
const connection = mongoose.connection;

// Initialize GridFS
Grid.mongo = mongoose.mongo;
let gfs;

connection.once('open', () => {
  gfs = Grid(connection.db);
});

const CreatePDF = async (req, res) => {
  const userID = req.userId;

  try {
    const upload = multer({
      storage: multer.memoryStorage(), // Store file in memory buffer for streaming to GridFS
      limits: {
        fileSize: 50 * 1024 * 1024, // 50 MB
      },
    }).single('photo');

    // Call the Multer middleware to handle file upload
    upload(req, res, async (err) => {
      if (err) {
        logger.error(`File upload failed: ${err.message}`);
        return res.status(500).send('File upload failed');
      }

      // Ensure req.file is defined before accessing its properties
      if (!req.file) {
        return res.status(400).send('No file uploaded');
      }

      // Create a file stream for storing in GridFS
      const writestream = gfs.createWriteStream({
        filename: req.file.originalname,
        metadata: {
          user: userID,
        },
      });

      // Pipe the file buffer to the GridFS stream
      writestream.write(req.file.buffer);
      writestream.end();

      writestream.on('close', async (file) => {
        // Save data to MongoDB
        const newData = new PdfModel({
          name: req.body.name,
          age: req.body.age,
          address: req.body.address,
          photo: file._id, // Store the GridFS file ID
          user: userID,
        });

        await newData.save();
        await UserModel.findByIdAndUpdate(userID, { $push: { pdfs: newData._id } });

        // Generate PDF
        const pdfDoc = new PDFDocument();

        // Handle 'error' event to ensure proper error logging
        pdfDoc.on('error', (error) => {
          console.error('PDF generation error:', error);
          res.status(500).send('PDF generation error');
        });

        // Pipe the PDF stream to the response
        res.setHeader('Content-Disposition', `attachment; filename=${newData.name}_details.pdf`);
        res.setHeader('Content-Type', 'application/pdf');
        const readstream = gfs.createReadStream({ _id: newData.photo });
        readstream.pipe(pdfDoc).pipe(res);
      });

      writestream.on('error', (error) => {
        console.error('GridFS write stream error:', error);
        res.status(500).send('GridFS write stream error');
      });
    });
  } catch (error) {
    logger.error(`Internal Server Error: ${error.message}`);
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = { CreatePDF };
