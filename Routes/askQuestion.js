const express = require("express");

const { askAssistant,fileAssistant, handleMessage, deleteFiles } = require("../Controllers/askAIBot");
const multer = require('multer');
const fs = require("fs");


const router = express.Router();


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = 'uploads/';
      // Create the uploads folder if it doesn't exist
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath);
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
  });
  
  const upload = multer({ storage });

router.post("/", askAssistant);
router.post('/file', upload.array('files'), fileAssistant);
router.get('/chat',handleMessage );
router.delete('/delete', deleteFiles);

module.exports = router;
