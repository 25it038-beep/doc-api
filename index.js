const express = require("express");
const multer = require("multer");
const cors = require("cors");
const pdfParse = require("pdf-parse");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Multer (memory storage for Render)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// API Key
const API_KEY = process.env.API_KEY || "test123";

// Auth Middleware
const authenticate = (req, res, next) => {
  const key = req.headers["authorization"];

  if (!key || key !== API_KEY) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized"
    });
  }

  next();
};

// Route
app.post("/analyze", authenticate, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded"
      });
    }

    let text = "";

    if (req.file.mimetype === "application/pdf") {
      const data = await pdfParse(req.file.buffer);
      text = data.text;
    } else {
      return res.status(400).json({
        success: false,
        error: "Only PDF supported"
      });
    }

    res.json({
      success: true,
      fileType: req.file.mimetype,
      wordCount: text.split(/\s+/).length,
      extracted_text: text.substring(0, 500)
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// PORT (Render requirement)
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});