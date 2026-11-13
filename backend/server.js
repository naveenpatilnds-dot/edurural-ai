require('dns').setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const youtubeVideoRoutes = require('./routes/youtubeVideos');
const studyMaterialRoutes = require('./routes/studyMaterials');
const quizRoutes = require('./routes/quizzes');
const notificationRoutes = require('./routes/notifications');
const aiTutorRoutes = require('./routes/aiTutor');
const doubtSolverRoutes = require('./routes/doubtSolver');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Authentication Routes
app.use('/api/auth', authRoutes);
app.use('/api/youtube-videos', youtubeVideoRoutes);
app.use('/api/study-materials', studyMaterialRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai-tutor', aiTutorRoutes);
app.use('/api/doubt-solver', doubtSolverRoutes);
// Home API
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to EDURURAL-AI Backend!',
        status: 'Server is running successfully'
    });
});

// Health Check API
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'EDURURAL-AI API is working!'
    });
});

// Server Port
const PORT = process.env.PORT || 5000;

// Start Server
const startServer = async () => {
    try {
        console.log('Starting EDURURAL-AI Backend...');

        await connectDB();

        app.listen(PORT, () => {
            console.log('EDURURAL-AI Backend Started!');
            console.log(`Server running at http://localhost:${PORT}`);
            console.log('Authentication APIs are ready!');
        });

    } catch (error) {
        console.error('Server startup failed!');
        console.error(error.message);
        process.exit(1);
    }
};

startServer();