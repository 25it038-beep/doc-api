const express = require("express");
const multer = require("multer");
const cors = require("cors");
const pdfParse = require("pdf-parse");
const fs = require("fs");

const app = express();
app.use(cors());

// file upload
const upload = multer({ dest: "uploads/" });

// API endpoint
app.post("/analyze", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;

    let text = "";

    // handle PDF
    if (req.file.mimetype === "application/pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      text = data.text;
    } else {
      text = "Only PDF supported in this demo";
    }

    res.json({
      success: true,
      extracted_text: text.substring(0, 500)
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// run server
app.listen(4000, () => {
  console.log("Server running on port 4000");
});