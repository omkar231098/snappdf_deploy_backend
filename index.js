const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');


const { PdfRouter } = require("./Routes/pdf.route");
const { auth } = require("./Routes/auth.route");
const { connection } = require("./Config/db");

const app = express();
app.use(express.json({ limit: '50mb' }));
require("dotenv").config();
app.use(cookieParser());


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://frontend-1pc92u079-omkar231098.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(cors({
  origin: 'https://frontend-1pc92u079-omkar231098.vercel.app',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


// app.use(cors(corsOptions));
app.use("/auth",auth);
app.use("/pdf",PdfRouter);

app.use(express.urlencoded({ extended: true, limit: '50mb' }));




// Check for required environment variables
const requiredEnvVariables = ['DATABASE_URL', 'PORT',"SECRET_KEY"]; // Add your required variables here

for (const variable of requiredEnvVariables) {
  if (!process.env[variable]) {
    console.error(`Error: Missing required environment variable: ${variable}`);
    process.exit(1); // Exit the process with an error code
  }
}
// app.use(cors());




const port = process.env.PORT || 8500;

app.listen(port, async () => {
  try {
    await connection;
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log("Not able to connect to MongoDB");
    console.error(err);
    process.exit(1); // Exit the process with an error code
  }

  console.log(`Server is running on port ${port}`);
});
