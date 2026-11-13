const mongoose = require('mongoose');

// Individual quiz question schema
const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true
    },

    options: {
        type: [String],
        required: true,
        validate: {
            validator: function (options) {
                return options.length === 4 &&
                    options.every(option => option.trim().length > 0);
            },
            message: 'Each question must have exactly 4 options.'
        }
    },

    correctAnswer: {
        type: Number,
        required: true,
        min: 0,
        max: 3
    }
});

// Main quiz schema
const quizSchema = new mongoose.Schema({

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
        required: true,
        enum: ['Class 8', 'Class 9', 'Class 10']
    },

    description: {
        type: String,
        default: ''
    },

    questions: {
        type: [questionSchema],
        required: true,
        validate: {
            validator: function (questions) {
                return questions.length > 0;
            },
            message: 'A quiz must contain at least one question.'
        }
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }

}, {
    timestamps: true
});

// Export Quiz model
const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;