const express = require('express');
const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const { protect, teacherOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Normalize class names to avoid case and spacing differences
const normalizeClass = (value) =>
  String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');


// TEACHER: Create a quiz
router.post('/', protect, teacherOnly, async (req, res) => {
  try {
    const {
      title,
      subject,
      chapter,
      className,
      description,
      questions
    } = req.body;

    if (
      !title ||
      !subject ||
      !chapter ||
      !className ||
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide quiz details and questions.'
      });
    }

    const quiz = await Quiz.create({
      title: title.trim(),
      subject,
      chapter,
      className: className.trim(),
      description,
      questions,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully!',
      quiz
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


// STUDENT AND TEACHER: View available quizzes
router.get('/', protect, async (req, res) => {
  try {
    let quizzes = await Quiz.find({})
      .select('-questions.correctAnswer')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    if (req.user.role === 'student') {
      const studentClass = normalizeClass(req.user.className);

      if (!studentClass) {
        return res.status(200).json({
          success: true,
          quizzes: [],
          message: 'Your account does not have a registered class.'
        });
      }

      quizzes = quizzes.filter(
        quiz => normalizeClass(quiz.className) === studentClass
      );
    }

    res.status(200).json({
      success: true,
      quizzes
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


// STUDENT: Submit quiz and save result
router.post('/:id/submit', protect, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can submit quizzes.'
      });
    }

    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid answers.'
      });
    }

    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found.'
      });
    }

    if (
      normalizeClass(quiz.className) !==
      normalizeClass(req.user.className)
    ) {
      return res.status(403).json({
        success: false,
        message: 'This quiz is not available for your class.'
      });
    }

    if (
      answers.length !== quiz.questions.length ||
      answers.some(answer =>
        !Number.isInteger(answer) || answer < 0 || answer > 3
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid answers to all questions.'
      });
    }

    let score = 0;

    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        score++;
      }
    });

    const percentage = Math.round(
      (score / quiz.questions.length) * 100
    );

    const result = await QuizResult.create({
      student: req.user._id,
      quiz: quiz._id,
      score,
      totalQuestions: quiz.questions.length,
      percentage,
      answers
    });

    res.status(200).json({
      success: true,
      message: 'Quiz submitted and result saved successfully!',
      score,
      totalQuestions: quiz.questions.length,
      percentage,
      resultId: result._id
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


// STUDENT AND TEACHER: View quiz results
router.get('/results', protect, async (req, res) => {
  try {
    let results;

    if (req.user.role === 'student') {
      results = await QuizResult.find({
        student: req.user._id
      })
        .populate('quiz', 'title subject chapter className')
        .sort({ createdAt: -1 });

    } else if (req.user.role === 'teacher') {
      results = await QuizResult.find()
        .populate('student', 'name email className')
        .populate('quiz', 'title subject chapter className')
        .sort({ createdAt: -1 });

    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    res.status(200).json({
      success: true,
      results
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;