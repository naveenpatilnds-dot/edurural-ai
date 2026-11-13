const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const StudyMaterial = require('../models/StudyMaterial');
const { protect, teacherOnly } = require('../middleware/authMiddleware');

const router = express.Router();

const uploadDirectory = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Store uploaded PDFs
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + '-' + Math.round(Math.random() * 1E9);

    cb(null, uniqueName + '.pdf');
  }
});

// Accept PDF files only
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'application/pdf' &&
    path.extname(file.originalname).toLowerCase() === '.pdf'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

// Teacher uploads study material
router.post(
  '/upload',
  protect,
  teacherOnly,
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Please select a PDF file.'
        });
      }

      const { title, subject, chapter, className, description } = req.body;

      if (!title || !subject || !chapter || !className) {
        fs.unlinkSync(req.file.path);

        return res.status(400).json({
          success: false,
          message: 'Please fill all required fields.'
        });
      }

      if (!['Class 8', 'Class 9', 'Class 10'].includes(className)) {
        fs.unlinkSync(req.file.path);

        return res.status(400).json({
          success: false,
          message: 'Invalid class selected.'
        });
      }

      const material = await StudyMaterial.create({
        title,
        subject,
        chapter,
        className,
        description: description || '',
        fileName: req.file.originalname,
        filePath: req.file.filename,
        uploadedBy: req.user._id
      });

      res.status(201).json({
        success: true,
        message: 'Study material uploaded successfully!',
        material
      });

    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        success: false,
        message: 'Upload failed.',
        error: error.message
      });
    }
  }
);

// Get study materials for the logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === 'student') {
      filter.className = req.user.className;
    }

    const materials = await StudyMaterial.find(filter)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: materials.length,
      materials
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to fetch study materials.'
    });
  }
});

// Download a study material
router.get('/:id/download', protect, async (req, res) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found.'
      });
    }

    if (
      req.user.role === 'student' &&
      material.className !== req.user.className
    ) {
      return res.status(403).json({
        success: false,
        message: 'You cannot access this material.'
      });
    }

    const filePath = path.join(uploadDirectory, material.filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'PDF file not found.'
      });
    }

    res.download(filePath, material.fileName);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Download failed.'
    });
  }
});

module.exports = router;