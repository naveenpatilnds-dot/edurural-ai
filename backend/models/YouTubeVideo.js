const mongoose = require('mongoose');

const youtubeVideoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    subject: {
      type: String,
      required: true
    },
    chapter: {
      type: String,
      required: true
    },
    className: {
      type: String,
      enum: ['Class 8', 'Class 9', 'Class 10'],
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    videoUrl: {
      type: String,
      required: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('YouTubeVideo', youtubeVideoSchema);