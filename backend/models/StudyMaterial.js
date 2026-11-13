const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema(
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

    fileName: {
      type: String,
      required: true
    },

    filePath: {
      type: String,
      required: true
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  'StudyMaterial',
  studyMaterialSchema
);