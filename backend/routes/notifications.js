const express = require('express');
const Notification = require('../models/Notification');
const { protect, teacherOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Teacher: Create announcement
router.post('/', protect, teacherOnly, async (req, res) => {
  try {
    const { title, message, targetClass } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required.'
      });
    }

    const notification = await Notification.create({
      title,
      message,
      targetClass: targetClass || 'All',
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully!',
      notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Student and teacher: View announcements
router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'student'
      ? {
          $or: [
            { targetClass: 'All' },
            { targetClass: req.user.className }
          ]
        }
      : {};

    const notifications = await Notification.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    const results = notifications.map(item => ({
      ...item.toObject(),
      isRead: item.readBy.some(
        id => id.toString() === req.user._id.toString()
      )
    }));

    res.json({
      success: true,
      notifications: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Student: Mark notification as read
router.patch('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.'
      });
    }

    if (
      req.user.role === 'student' &&
      notification.targetClass !== 'All' &&
      notification.targetClass !== req.user.className
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    if (!notification.readBy.some(
      id => id.toString() === req.user._id.toString()
    )) {
      notification.readBy.push(req.user._id);
      await notification.save();
    }

    res.json({
      success: true,
      message: 'Notification marked as read.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;