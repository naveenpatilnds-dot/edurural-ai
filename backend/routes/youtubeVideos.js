const express = require('express');
const YouTubeVideo = require('../models/YouTubeVideo');
const { protect, teacherOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Add a YouTube video (Teacher only)
router.post('/', protect, teacherOnly, async (req, res) => {
  try {
    const { title, subject, chapter, className, description, videoUrl } = req.body;

    if (!title || !subject || !chapter || !className || !videoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields.'
      });
    }

    const video = await YouTubeVideo.create({
      title,
      subject,
      chapter,
      className,
      description,
      videoUrl,
      uploadedBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'YouTube video added successfully!',
      video
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get videos
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === 'student') {
      filter.className = req.user.className;
    }

    const videos = await YouTubeVideo.find(filter)
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      videos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
// Delete a YouTube video (Teacher only)
router.delete('/:id', protect, teacherOnly, async (req, res) => {
  try {
    const video = await YouTubeVideo.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'YouTube video not found.'
      });
    }

    await YouTubeVideo.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'YouTube video deleted successfully!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
module.exports = router;