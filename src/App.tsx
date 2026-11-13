import { useEffect, useState } from 'react';
import './App.css';
import AITutor from './components/AITutor';

const API_URL = 'http://localhost:5000/api/auth';

type AuthUser = {
  name: string;
  email: string;
  role: 'student' | 'teacher';
  className?: string;
};

type YouTubeVideo = {
  _id: string;
  title: string;
  subject: string;
  chapter: string;
  className: string;
  description?: string;
  videoUrl: string;
  uploadedBy?: { name: string };
};

type QuizQuestion = {
  question: string;
  options: string[];
};

type Quiz = {
  _id: string;
  title: string;
  subject: string;
  chapter: string;
  className: string;
  description?: string;
  questions: QuizQuestion[];
  createdBy?: { name: string };
};

type EditableQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
};

type StudyMaterial = {
  _id: string;
  title: string;
  subject: string;
  chapter: string;
  className: string;
  description?: string;
  fileName: string;
  uploadedBy?: { name: string };
  createdAt: string;
};
type Notification = {
  _id: string;
  title: string;
  message: string;
  targetClass: string;
  createdAt: string;
  isRead: boolean;
  createdBy?: {
    name: string;
  };
};
type QuizResult = {
  _id: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  createdAt: string;
  quiz?: {
    title: string;
    subject: string;
    chapter: string;
    className: string;
  };
  student?: {
  name?: string;
  email?: string;
};
};
function App() {
  const [language, setLanguage] = useState('English');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [showLogin, setShowLogin] = useState(false);

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Restore logged-in user after page refresh
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const savedUser = localStorage.getItem('edurural_user');

    if (!savedUser) return null;

    try {
      return JSON.parse(savedUser) as AuthUser;
    } catch {
      localStorage.removeItem('edurural_user');
      localStorage.removeItem('edurural_token');
      return null;
    }
  });

  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [materialsError, setMaterialsError] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  const [materialTitle, setMaterialTitle] = useState('');
  const [materialSubject, setMaterialSubject] = useState('Mathematics');
  const [materialChapter, setMaterialChapter] = useState('');
  const [materialClass, setMaterialClass] = useState('Class 10');
  const [materialDescription, setMaterialDescription] = useState('');
  const [materialFile, setMaterialFile] = useState<File | null>(null);

  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [videoMessage, setVideoMessage] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoSubject, setVideoSubject] = useState('Mathematics');
  const [videoChapter, setVideoChapter] = useState('');
  const [videoClass, setVideoClass] = useState('Class 10');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [addingVideo, setAddingVideo] = useState(false);

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
const [notificationLoading, setNotificationLoading] = useState(false);
const [notificationMessage, setNotificationMessage] = useState('');

const [announcementTitle, setAnnouncementTitle] = useState('');
const [announcementMessage, setAnnouncementMessage] = useState('');
const [announcementClass, setAnnouncementClass] = useState('All');
const [publishingAnnouncement, setPublishingAnnouncement] = useState(false);
const [resultsLoading, setResultsLoading] = useState(false);
const [resultsError, setResultsError] = useState('');
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [quizMessage, setQuizMessage] = useState('');
  const [creatingQuiz, setCreatingQuiz] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizSubject, setQuizSubject] = useState('Mathematics');
  const [quizChapter, setQuizChapter] = useState('');
  const [quizClass, setQuizClass] = useState('Class 10');
  const [quizDescription, setQuizDescription] = useState('');
  const [quizQuestions, setQuizQuestions] = useState<EditableQuestion[]>([
    { question: '', options: ['', '', '', ''], correctAnswer: 0 }
  ]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<{ score: number; totalQuestions: number; percentage: number } | null>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  const subjects = [
    { name: 'Mathematics', icon: '📐', chapters: 15, color: 'math' },
    { name: 'Science', icon: '🔬', chapters: 18, color: 'science' },
    { name: 'Social Science', icon: '🌍', chapters: 16, color: 'social' },
  ];

  const openAuth = () => {
    setShowLogin(true);
    setAuthMode('login');
    setError('');
    setSuccess('');
  };

  // Login and registration
  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const endpoint =
        authMode === 'login' ? '/login' : '/register';

      const requestBody =
        authMode === 'login'
          ? { email, password, role }
          : {
              name,
              email,
              password,
              role,
              className: role === 'student' ? selectedClass : undefined,
            };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong.');
      }

      setSuccess(data.message);

      // Registration successful
      if (authMode === 'register') {
        setAuthMode('login');
        setName('');
        setPassword('');
        return;
      }

      // Login successful
      localStorage.setItem('edurural_token', data.token);
      localStorage.setItem('edurural_user', JSON.stringify(data.user));

      setTimeout(() => {
        setCurrentUser(data.user as AuthUser);
        setShowLogin(false);
        setEmail('');
        setPassword('');
      }, 1000);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to connect to the server.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Load study materials for the logged-in user
  const loadMaterials = async () => {
    const token = localStorage.getItem('edurural_token');

    if (!token) return;

    setMaterialsLoading(true);
    setMaterialsError('');

    try {
      const response = await fetch('http://localhost:5000/api/study-materials', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load study materials.');
      }

      setMaterials(data.materials || []);
    } catch (err) {
      setMaterialsError(
        err instanceof Error ? err.message : 'Unable to load study materials.'
      );
    } finally {
      setMaterialsLoading(false);
    }
  };

  const loadVideos = async () => {
    const token = localStorage.getItem('edurural_token');
    if (!token) return;
    setVideosLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/youtube-videos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to load videos.');
      setVideos(data.videos || []);
    } catch (err) {
      setVideoMessage(err instanceof Error ? err.message : 'Unable to load videos.');
    } finally {
      setVideosLoading(false);
    }
  };



const loadQuizzes = async () => {
  const token = localStorage.getItem('edurural_token');

  if (!token) return;

  setQuizzesLoading(true);

  try {
    const response = await fetch('http://localhost:5000/api/quizzes', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Unable to load quizzes.');
    }

    setQuizzes(data.quizzes || []);
  } catch (err) {
    setQuizMessage(
      err instanceof Error ? err.message : 'Unable to load quizzes.'
    );
  } finally {
    setQuizzesLoading(false);
  }
};
// Load quiz results for the logged-in user
const loadQuizResults = async () => {
  const token = localStorage.getItem('edurural_token');

  if (!token) return;

  setResultsLoading(true);
  setResultsError('');

  try {
    const response = await fetch(
      'http://localhost:5000/api/quizzes/results',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Unable to load quiz results.');
    }

    setQuizResults(data.results || []);
  } catch (err) {
    setResultsError(
      err instanceof Error ? err.message : 'Unable to load quiz results.'
    );
  } finally {
    setResultsLoading(false);
  }
};
// Load notifications
const loadNotifications = async () => {
  const token = localStorage.getItem('edurural_token');
  if (!token) return;

  setNotificationLoading(true);
  setNotificationMessage('');

  try {
    const response = await fetch(
      'http://localhost:5000/api/notifications',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Unable to load notifications.');
    }

    setNotifications(data.notifications || []);
  } catch (err) {
    setNotificationMessage(
      err instanceof Error ? err.message : 'Unable to load notifications.'
    );
  } finally {
    setNotificationLoading(false);
  }
};

// Teacher: Publish announcement
const handlePublishAnnouncement = async (
  e: React.FormEvent<HTMLFormElement>
) => {
  e.preventDefault();

  const token = localStorage.getItem('edurural_token');

  if (!token) {
    setNotificationMessage('Please login again.');
    return;
  }
  // Student: Mark notification as read
const handleMarkAsRead = async (notificationId: string) => {
  const token = localStorage.getItem('edurural_token');

  if (!token) return;

  try {
    const response = await fetch(
      `http://localhost:5000/api/notifications/${notificationId}/read`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Unable to mark as read.');
    }

    setNotifications((previous) =>
      previous.map((item) =>
        item._id === notificationId
          ? { ...item, isRead: true }
          : item
      )
    );
  } catch (err) {
    setNotificationMessage(
      err instanceof Error ? err.message : 'Unable to mark as read.'
    );
  }
};

  setPublishingAnnouncement(true);
  setNotificationMessage('');

  try {
    const response = await fetch(
      'http://localhost:5000/api/notifications',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: announcementTitle,
          message: announcementMessage,
          targetClass: announcementClass,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Unable to publish announcement.');
    }

    setNotificationMessage('Announcement published successfully!');
    setAnnouncementTitle('');
    setAnnouncementMessage('');
    setAnnouncementClass('All');

    await loadNotifications();
  } catch (err) {
    setNotificationMessage(
      err instanceof Error ? err.message : 'Unable to publish announcement.'
    );
  } finally {
    setPublishingAnnouncement(false);
  }
};

// Load dashboard data
useEffect(() => {
  if (currentUser) {
    loadMaterials();
    loadVideos();
    loadQuizzes();
    loadQuizResults();
    loadNotifications();
  }
}, [currentUser]);
    const handleAddVideo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const token = localStorage.getItem('edurural_token');

    if (!token) {
      setVideoMessage('Please login again.');
      return;
    }

    setAddingVideo(true);
    setVideoMessage('');

    try {
      const response = await fetch(
        'http://localhost:5000/api/youtube-videos',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: videoTitle,
            subject: videoSubject,
            chapter: videoChapter,
            className: videoClass,
            description: videoDescription,
            videoUrl,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to add video.');
      }

      setVideoMessage('YouTube video added successfully!');
      setVideoTitle('');
      setVideoChapter('');
      setVideoDescription('');
      setVideoUrl('');

      await loadVideos();
    } catch (err) {
      setVideoMessage(
        err instanceof Error ? err.message : 'Unable to add video.'
      );
    } finally {
      setAddingVideo(false);
    }
  };
const handleDeleteVideo = async (videoId: string) => {
  const confirmed = window.confirm(
    'Are you sure you want to delete this YouTube video?'
  );

  if (!confirmed) return;

  const token = localStorage.getItem('edurural_token');

  if (!token) {
    alert('Please login again.');
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:5000/api/youtube-videos/${videoId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Unable to delete video.');
    }

    alert('YouTube video deleted successfully!');
    await loadVideos();

  } catch (error) {
    alert(
      error instanceof Error
        ? error.message
        : 'Unable to delete video.'
    );
  }
};
  const getYouTubeEmbedUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      let id = '';
      if (parsed.hostname.includes('youtu.be')) id = parsed.pathname.slice(1);
      else if (parsed.hostname.includes('youtube.com')) id = parsed.searchParams.get('v') || parsed.pathname.split('/').filter(Boolean).pop() || '';
      return id ? `https://www.youtube.com/embed/${id}` : '';
    } catch { return ''; }
  };

  const updateQuizQuestion = (index: number, field: 'question' | 'correctAnswer', value: string | number) => {
    setQuizQuestions((previous) => previous.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const updateQuizOption = (questionIndex: number, optionIndex: number, value: string) => {
    setQuizQuestions((previous) => previous.map((item, i) =>
      i === questionIndex
        ? { ...item, options: item.options.map((option, j) => j === optionIndex ? value : option) }
        : item
    ));
  };

  const handleCreateQuiz = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem('edurural_token');
    if (!token) { setQuizMessage('Please login again.'); return; }
    if (quizQuestions.some((q) => !q.question.trim() || q.options.some((option) => !option.trim()))) {
      setQuizMessage('Please complete every question and all four options.');
      return;
    }
    setCreatingQuiz(true);
    setQuizMessage('');
    try {
      const response = await fetch('http://localhost:5000/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: quizTitle,
          subject: quizSubject,
          chapter: quizChapter,
          className: quizClass,
          description: quizDescription,
          questions: quizQuestions,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to create quiz.');
      setQuizMessage('Quiz created successfully!');
      setQuizTitle('');
      setQuizChapter('');
      setQuizDescription('');
      setQuizQuestions([{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
      await loadQuizzes();
    } catch (err) {
      setQuizMessage(err instanceof Error ? err.message : 'Unable to create quiz.');
    } finally {
      setCreatingQuiz(false);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    if (activeQuiz.questions.some((_, index) => !Number.isInteger(studentAnswers[index]))) {
      setQuizMessage('Please answer every question before submitting.');
      return;
    }
    const token = localStorage.getItem('edurural_token');
    if (!token) { setQuizMessage('Please login again.'); return; }
    setSubmittingQuiz(true);
    setQuizMessage('');
    try {
      const response = await fetch(`http://localhost:5000/api/quizzes/${activeQuiz._id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ answers: studentAnswers }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Quiz submission failed.');
      setQuizResult({
        score: data.score,
        totalQuestions: data.totalQuestions,
        percentage: data.percentage,
      });
    } catch (err) {
      setQuizMessage(err instanceof Error ? err.message : 'Quiz submission failed.');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  // Upload a PDF (teachers only)
  const handleMaterialUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!materialFile) {
      setUploadMessage('Please choose a PDF file.');
      return;
    }

    const token = localStorage.getItem('edurural_token');

    if (!token) {
      setUploadMessage('Please login again.');
      return;
    }

    const formData = new FormData();
    formData.append('title', materialTitle);
    formData.append('subject', materialSubject);
    formData.append('chapter', materialChapter);
    formData.append('className', materialClass);
    formData.append('description', materialDescription);
    formData.append('file', materialFile);

    setUploading(true);
    setUploadMessage('');

    try {
      const response = await fetch(
        'http://localhost:5000/api/study-materials/upload',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'PDF upload failed.');
      }

      setUploadMessage('PDF uploaded successfully!');
      setMaterialTitle('');
      setMaterialChapter('');
      setMaterialDescription('');
      setMaterialFile(null);

      const fileInput = document.getElementById('study-material-file') as HTMLInputElement | null;
      if (fileInput) fileInput.value = '';

      await loadMaterials();
    } catch (err) {
      setUploadMessage(
        err instanceof Error ? err.message : 'PDF upload failed.'
      );
    } finally {
      setUploading(false);
    }
  };

  // Download a PDF using the user's login token
  const handleMaterialDownload = async (material: StudyMaterial) => {
    const token = localStorage.getItem('edurural_token');

    if (!token) {
      setMaterialsError('Please login again to download this file.');
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/study-materials/${material._id}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Download failed.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = material.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setMaterialsError(
        err instanceof Error ? err.message : 'Download failed.'
      );
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('edurural_token');
    localStorage.removeItem('edurural_user');

    setCurrentUser(null);
    setShowLogin(false);
    setSuccess('');
    setError('');
  };

  // ==============================
  // STUDENT AND TEACHER DASHBOARDS
  // ==============================

  if (currentUser) {
    return (
      <div className="dashboard">

        <nav className="navbar">
          <div className="logo">
            <span className="logo-icon">📚</span>
            <div>
              <h2>EduRural<span> AI</span></h2>
              <small>LEARN • GROW • SUCCEED</small>
            </div>
          </div>

          <button className="login-btn" onClick={handleLogout}>
            Logout →
          </button>
        </nav>

        <main className="dashboard-content">

          <div className="dashboard-welcome">
            <span>WELCOME TO EDURURAL AI</span>

            <h1>
              Hello, {currentUser.name}! 👋
            </h1>

            <p>
              {currentUser.role === 'student'
                ? 'Welcome to your learning space. Keep learning and growing!'
                : 'Welcome to your teaching space. Help students learn and grow!'}
            </p>
          </div>

          {/* STUDENT DASHBOARD */}

          {currentUser.role === 'student' && (
            <>
              <div className="dashboard-info">
                <h2>🎓 Student Dashboard</h2>

                <p>
                  Your Class: <strong>
                    {currentUser.className || 'Not specified'}
                  </strong>
                </p>
              </div>
              {/* AI TUTOR */}
<section className="materials-panel">
  <AITutor />
</section>
  
              <section className="materials-panel">
                <h2>📚 Study Materials for Your Class</h2>

                {materialsLoading ? (
                  <p>Loading study materials...</p>
                ) : materialsError ? (
                  <p className="material-status">{materialsError}</p>
                ) : materials.length === 0 ? (
                  <p>No study materials are available for your class yet.</p>
                ) : (
                  <div className="materials-list">
                    {materials.map((material) => (
                      <article className="material-item" key={material._id}>
                        <div>
                          <h3>📄 {material.title}</h3>
                          <p>
                            {material.subject} • {material.chapter} • {material.className}
                          </p>
                          {material.description && <p>{material.description}</p>}
                          {material.uploadedBy?.name && (
                            <small>Uploaded by {material.uploadedBy.name}</small>
                          )}
                        </div>
                        <button
                          type="button"
                          className="login-btn"
                          onClick={() => handleMaterialDownload(material)}
                        >
                          Download PDF
                        </button>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="materials-panel">
                <h2>🎥 YouTube Video Lessons</h2>
                {videosLoading ? <p>Loading videos...</p> : videos.length === 0 ? <p>No video lessons are available for your class yet.</p> : (
                  <div className="video-grid">
                    {videos.map((video) => (
                      <article className="video-card" key={video._id}>
                        <h3>{video.title}</h3>
                        <p>{video.subject} • {video.chapter} • {video.className}</p>
                        {video.description && <p>{video.description}</p>}
                        {getYouTubeEmbedUrl(video.videoUrl) ? (
                          <iframe className="youtube-frame" src={getYouTubeEmbedUrl(video.videoUrl)} title={video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                        ) : <a href={video.videoUrl} target="_blank" rel="noreferrer">Watch video on YouTube</a>}
                        {currentUser.role === 'teacher' && (
  <button
    type="button"
    className="login-btn"
    onClick={() => handleDeleteVideo(video._id)}
  >
    🗑️ Delete Video
  </button>
)}
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="materials-panel">
                <h2>📝 Available Quizzes</h2>
                {quizzesLoading ? <p>Loading quizzes...</p> : quizzes.length === 0 ? <p>No quizzes are available for your class yet.</p> : (
                  <div className="materials-list">
                    {quizzes.map((quiz) => (
                      <article className="material-item" key={quiz._id}>
                        <div><h3>{quiz.title}</h3><p>{quiz.subject} • {quiz.chapter} • {quiz.className}</p><p>{quiz.questions.length} questions</p>{quiz.description && <p>{quiz.description}</p>}</div>
                        <button className="login-btn" type="button" onClick={() => { setActiveQuiz(quiz); setStudentAnswers([]); setQuizResult(null); setQuizMessage(''); }}>Start Quiz</button>
                      </article>
                    ))}
                  </div>
                )}
                {activeQuiz && (
                  <div className="quiz-attempt">
                    <h3>{activeQuiz.title}</h3>
                    {activeQuiz.questions.map((question, qIndex) => (
                      <div className="quiz-question" key={qIndex}>
                        <h4>{qIndex + 1}. {question.question}</h4>
                        {question.options.map((option, optionIndex) => (
                          <label className="quiz-option" key={optionIndex}>
                            <input type="radio" name={`quiz-${activeQuiz._id}-question-${qIndex}`} checked={studentAnswers[qIndex] === optionIndex} disabled={!!quizResult} onChange={() => setStudentAnswers((previous) => { const next = [...previous]; next[qIndex] = optionIndex; return next; })} />
                            {option}
                          </label>
                        ))}
                      </div>
                    ))}
                    {quizMessage && <p className="material-status">{quizMessage}</p>}
                    {quizResult ? (
                      <div className="quiz-result">
                        <h3>Result: {quizResult.score} / {quizResult.totalQuestions}</h3>
                        <p>Your score: {quizResult.percentage}%</p>
                        <button className="login-btn" type="button" onClick={() => { setActiveQuiz(null); setQuizResult(null); setStudentAnswers([]); }}>Close Result</button>
                      </div>
                    ) : (
                      <button className="primary-btn" type="button" onClick={handleSubmitQuiz} disabled={submittingQuiz}>{submittingQuiz ? 'Submitting...' : 'Submit Quiz'}</button>
                    )}
                  </div>
                )}
              </section>
{/* STUDENT PERFORMANCE DASHBOARD */}
<section className="materials-panel">
  <h2>📊 My Performance Dashboard</h2>

  {resultsLoading ? (
    <p>Loading your performance...</p>
  ) : resultsError ? (
    <p className="material-status">{resultsError}</p>
  ) : (
    <>
      <div className="dashboard-grid">

        <div className="dashboard-card">
          <span>📝</span>
          <h3>{quizResults.length}</h3>
          <p>Total Quizzes Attempted</p>
        </div>

        <div className="dashboard-card">
          <span>🎯</span>
          <h3>
            {quizResults.length > 0
              ? Math.round(
                  quizResults.reduce(
                    (sum, result) => sum + result.percentage, 0
                  ) / quizResults.length
                )
              : 0}%
          </h3>
          <p>Average Score</p>
        </div>

        <div className="dashboard-card">
          <span>🏆</span>
          <h3>
            {quizResults.length > 0
              ? Math.max(...quizResults.map(result => result.percentage))
              : 0}%
          </h3>
          <p>Highest Score</p>
        </div>

      </div>

      <h3>📚 Quiz History</h3>

      {quizResults.length === 0 ? (
        <p>No quiz attempts yet. Complete a quiz to see your performance!</p>
      ) : (
        <div className="materials-list">
          {quizResults.map(result => (
            <article className="material-item" key={result._id}>
              <div>
                <h3>{result.quiz?.title || 'Quiz'}</h3>

                <p>
                  {result.quiz?.subject || 'Subject'} •
                  {result.quiz?.chapter || 'Chapter'}
                </p>

                <p>
                  Marks: {result.score}/{result.totalQuestions}
                </p>

                <p>Score: {result.percentage}%</p>

                <small>
                  {new Date(result.createdAt).toLocaleDateString()}
                </small>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  )}
</section>
              <h2 className="dashboard-section-title">Your Learning Activities</h2>

              <div className="dashboard-grid">

                <div className="dashboard-card">
                  <span>📚</span>
                  <h3>Study Materials</h3>
                  <p>
                    Access notes and chapter-wise study materials.
                  </p>
                </div>

                <div className="dashboard-card">
                  <span>🎥</span>
                  <h3>Video Lessons</h3>
                  <p>
                    Understand lessons through educational videos.
                  </p>
                </div>

                <div className="dashboard-card">
                  <span>📝</span>
                  <h3>Quizzes</h3>
                  <p>
                    Test your knowledge with chapter-based quizzes.
                  </p>
                </div>

                <div className="dashboard-card">
                  <span>📊</span>
                  <h3>My Performance</h3>
                  <p>
                    Monitor your marks and learning progress.
                  </p>
                </div>

                <div className="dashboard-card">
                  <span>🤖</span>
                  <h3>AI Tutor</h3>
                  <p>
                    Ask questions and get help with difficult topics.
                  </p>
                </div>

                <div className="dashboard-card">
                  <span>🌐</span>
                  <h3>Language</h3>
                  <p>
                    Learn using Kannada and English resources.
                  </p>
                </div>

              </div>
            </>
          )}

          {/* TEACHER DASHBOARD */}

          {currentUser.role === 'teacher' && (
            <>
              <div className="dashboard-info">
          
                <h2>👨‍🏫 Teacher Dashboard</h2>

                <p>
                  Manage learning materials and student activities.
                </p>
              </div>
              {/* ANNOUNCEMENT PUBLISHING */}
<section className="materials-panel">
  <h2>📢 Publish Announcement</h2>

  <form
    className="material-upload-form"
    onSubmit={handlePublishAnnouncement}
  >
    <label>Announcement Title</label>
    <input
      type="text"
      value={announcementTitle}
      onChange={(e) => setAnnouncementTitle(e.target.value)}
      placeholder="Example: Upcoming Science Exam"
      required
    />

    <label>Announcement Message</label>
    <textarea
      value={announcementMessage}
      onChange={(e) => setAnnouncementMessage(e.target.value)}
      placeholder="Write your announcement here..."
      rows={4}
      required
    />

    <label>Send Announcement To</label>
    <select
      value={announcementClass}
      onChange={(e) => setAnnouncementClass(e.target.value)}
    >
      <option value="All">All Classes</option>
      <option value="Class 8">Class 8</option>
      <option value="Class 9">Class 9</option>
      <option value="Class 10">Class 10</option>
    </select>

    {notificationMessage && (
      <p className="material-status">{notificationMessage}</p>
    )}

    <button
      className="primary-btn"
      type="submit"
      disabled={publishingAnnouncement}
    >
      {publishingAnnouncement ? 'Publishing...' : 'Publish Announcement'}
    </button>
  </form>
</section>
              

              <section className="materials-panel">
                <h2>📤 Upload Study Material (PDF)</h2>
                <form className="material-upload-form" onSubmit={handleMaterialUpload}>
                  <label>Material Title</label>
                  <input
                    type="text"
                    value={materialTitle}
                    onChange={(e) => setMaterialTitle(e.target.value)}
                    placeholder="Example: Introduction to Algebra"
                    required
                  />

                  <label>Subject</label>
                  <select
                    value={materialSubject}
                    onChange={(e) => setMaterialSubject(e.target.value)}
                  >
                    <option>Mathematics</option>
                    <option>Science</option>
                    <option>Social Science</option>
                  </select>

                  <label>Chapter</label>
                  <input
                    type="text"
                    value={materialChapter}
                    onChange={(e) => setMaterialChapter(e.target.value)}
                    placeholder="Enter chapter name"
                    required
                  />

                  <label>Class</label>
                  <select
                    value={materialClass}
                    onChange={(e) => setMaterialClass(e.target.value)}
                  >
                    <option>Class 8</option>
                    <option>Class 9</option>
                    <option>Class 10</option>
                  </select>

                  <label>Description (optional)</label>
                  <textarea
                    value={materialDescription}
                    onChange={(e) => setMaterialDescription(e.target.value)}
                    placeholder="Brief description of this PDF"
                    rows={3}
                  />

                  <label>Select PDF (maximum 10 MB)</label>
                  <input
                    id="study-material-file"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => setMaterialFile(e.target.files?.[0] || null)}
                    required
                  />

                  {uploadMessage && (
                    <p className="material-status">{uploadMessage}</p>
                  )}

                  <button className="primary-btn" type="submit" disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload PDF'}
                  </button>
                </form>
              </section>

              <section className="materials-panel">
                <h2>🎥 Add YouTube Video Lesson</h2>
                <form className="material-upload-form" onSubmit={handleAddVideo}>
                  <label>Video Title</label>
                  <input value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} placeholder="Example: Introduction to Algebra" required />
                  <label>Subject</label>
                  <select value={videoSubject} onChange={(e) => setVideoSubject(e.target.value)}><option>Mathematics</option><option>Science</option><option>Social Science</option></select>
                  <label>Chapter</label>
                  <input value={videoChapter} onChange={(e) => setVideoChapter(e.target.value)} placeholder="Enter chapter name" required />
                  <label>Class</label>
                  <select value={videoClass} onChange={(e) => setVideoClass(e.target.value)}><option>Class 8</option><option>Class 9</option><option>Class 10</option></select>
                  <label>YouTube Video URL</label>
                  <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." required />
                  <label>Description (optional)</label>
                  <textarea value={videoDescription} onChange={(e) => setVideoDescription(e.target.value)} rows={3} placeholder="Brief description of the lesson" />
                  {videoMessage && <p className="material-status">{videoMessage}</p>}
                  <button className="primary-btn" type="submit" disabled={addingVideo}>{addingVideo ? 'Adding video...' : 'Add Video'}</button>
                </form>
              </section>
{/* MANAGE YOUTUBE VIDEOS */}
<section className="materials-panel">
  <h2>🗑️ Manage YouTube Videos</h2>

  {videosLoading ? (
    <p>Loading videos...</p>
  ) : videos.length === 0 ? (
    <p>No videos added yet.</p>
  ) : (
    <div className="materials-list">
      {videos.map((video) => (
        <article className="material-item" key={video._id}>
          <div>
            <h3>{video.title}</h3>
            <p>{video.subject} • {video.chapter} • {video.className}</p>
          </div>

          <button
            type="button"
            className="login-btn"
            onClick={() => handleDeleteVideo(video._id)}
          >
            🗑️ Delete Video
          </button>
        </article>
      ))}
    </div>
  )}
</section>
              <section className="materials-panel">
                <h2>📝 Create Online Quiz</h2>
                <form className="material-upload-form" onSubmit={handleCreateQuiz}>
                  <label>Quiz Title</label>
                  <input value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} placeholder="Example: Algebra Chapter Test" required />
                  <label>Subject</label>
                  <select value={quizSubject} onChange={(e) => setQuizSubject(e.target.value)}><option>Mathematics</option><option>Science</option><option>Social Science</option></select>
                  <label>Chapter</label>
                  <input value={quizChapter} onChange={(e) => setQuizChapter(e.target.value)} placeholder="Enter chapter name" required />
                  <label>Class</label>
                  <select value={quizClass} onChange={(e) => setQuizClass(e.target.value)}><option>Class 8</option><option>Class 9</option><option>Class 10</option></select>
                  <label>Description (optional)</label>
                  <textarea value={quizDescription} onChange={(e) => setQuizDescription(e.target.value)} rows={2} placeholder="Brief quiz instructions" />
                  {quizQuestions.map((question, qIndex) => (
                    <div className="quiz-question-editor" key={qIndex}>
                      <h3>Question {qIndex + 1}</h3>
                      <label>Question</label>
                      <input value={question.question} onChange={(e) => updateQuizQuestion(qIndex, 'question', e.target.value)} placeholder="Enter your question" required />
                      {question.options.map((option, optionIndex) => (
                        <div className="quiz-option-editor" key={optionIndex}>
                          <input value={option} onChange={(e) => updateQuizOption(qIndex, optionIndex, e.target.value)} placeholder={`Option ${optionIndex + 1}`} required />
                          <label><input type="radio" name={`correct-${qIndex}`} checked={question.correctAnswer === optionIndex} onChange={() => updateQuizQuestion(qIndex, 'correctAnswer', optionIndex)} /> Correct answer</label>
                        </div>
                      ))}
                    </div>
                  ))}
                  <div className="quiz-actions">
                    <button className="login-btn" type="button" onClick={() => setQuizQuestions((previous) => [...previous, { question: '', options: ['', '', '', ''], correctAnswer: 0 }])}>+ Add Question</button>
                    {quizQuestions.length > 1 && <button className="login-btn" type="button" onClick={() => setQuizQuestions((previous) => previous.slice(0, -1))}>Remove Last Question</button>}
                  </div>
                  {quizMessage && <p className="material-status">{quizMessage}</p>}
                  <button className="primary-btn" type="submit" disabled={creatingQuiz}>{creatingQuiz ? 'Creating Quiz...' : 'Create Quiz'}</button>
                </form>
              </section>

              <section className="materials-panel">
                <h2>📋 Created Quizzes</h2>
                {/* TEACHER PERFORMANCE TRACKER */}
<section className="materials-panel">
  <h2>📊 Student Performance Tracker</h2>

  {resultsLoading ? (
    <p>Loading student performance...</p>
  ) : resultsError ? (
    <p className="material-status">{resultsError}</p>
  ) : (
    <>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <span>📝</span>
          <h3>{quizResults.length}</h3>
          <p>Total Quiz Attempts</p>
        </div>

        <div className="dashboard-card">
          <span>🎯</span>
          <h3>
            {quizResults.length > 0
              ? Math.round(
                  quizResults.reduce(
                    (sum, result) => sum + result.percentage, 0
                  ) / quizResults.length
                )
              : 0}%
          </h3>
          <p>Average Student Score</p>
        </div>

        <div className="dashboard-card">
          <span>🏆</span>
          <h3>
            {quizResults.length > 0
              ? Math.max(...quizResults.map(result => result.percentage))
              : 0}%
          </h3>
          <p>Highest Score</p>
        </div>
      </div>

      <h3>👨‍🎓 Student Quiz Results</h3>

      {quizResults.length === 0 ? (
        <p>No students have attempted quizzes yet.</p>
      ) : (
        <div className="materials-list">
          {quizResults.map(result => (
            <article className="material-item" key={result._id}>
              <div>
                <h3>{result.student?.name || 'Student'}</h3>
                <p>{result.student?.email || 'Email unavailable'}</p>
                <p>Quiz: {result.quiz?.title || 'Quiz'}</p>
                <p>
                  Marks: {result.score}/{result.totalQuestions}
                </p>
                <p>Percentage: {result.percentage}%</p>
                <small>
                  {new Date(result.createdAt).toLocaleDateString()}
                </small>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  )}
</section>
{/* STUDENT RANKING */}
<section className="materials-panel">
  <h2>🏆 Student Ranking</h2>
  <p>Students ranked according to their average quiz scores.</p>

  {(() => {
    const rankingMap = new Map<
      string,
      { name: string; email: string; totalScore: number; attempts: number }
    >();

    quizResults.forEach((result) => {
      const email = result.student?.email || 'unknown';
      const name = result.student?.name || 'Student';

      const existing = rankingMap.get(email) || {
        name,
        email,
        totalScore: 0,
        attempts: 0
      };

      existing.totalScore += result.percentage;
      existing.attempts += 1;

      rankingMap.set(email, existing);
    });

    const rankings = Array.from(rankingMap.values())
      .map((student) => ({
        ...student,
        average: Math.round(student.totalScore / student.attempts)
      }))
      .sort((a, b) => b.average - a.average);

    return rankings.length === 0 ? (
      <p>No student rankings available yet.</p>
    ) : (
      <div className="materials-list">
        {rankings.map((student, index) => (
          <article className="material-item" key={student.email}>
            <h3>
              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}
              {' '}Rank {index + 1}: {student.name}
            </h3>
            <p>📧 {student.email}</p>
            <p>🎯 Average Score: {student.average}%</p>
            <p>📝 Quizzes Attempted: {student.attempts}</p>
          </article>
        ))}
      </div>
    );
  })()}
</section>
                {quizzesLoading ? <p>Loading quizzes...</p> : quizzes.length === 0 ? <p>No quizzes created yet.</p> : (
                  <div className="materials-list">
                    {quizzes.map((quiz) => <article className="material-item" key={quiz._id}><div><h3>{quiz.title}</h3><p>{quiz.subject} • {quiz.chapter} • {quiz.className}</p><p>{quiz.questions.length} questions</p></div></article>)}
                  </div>
                )}
              </section>

              <h2 className="dashboard-section-title">Uploaded Study Materials</h2>

              {materialsLoading ? (
                <p>Loading study materials...</p>
              ) : materialsError ? (
                <p className="material-status">{materialsError}</p>
              ) : materials.length === 0 ? (
                <p>No study materials uploaded yet.</p>
              ) : (
                <div className="materials-list">
                  {materials.map((material) => (
                    <article className="material-item" key={material._id}>
                      <div>
                        <h3>📄 {material.title}</h3>
                        <p>
                          {material.subject} • {material.chapter} • {material.className}
                        </p>
                        {material.description && <p>{material.description}</p>}
                      </div>
                      <button
                        type="button"
                        className="login-btn"
                        onClick={() => handleMaterialDownload(material)}
                      >
                        Download PDF
                      </button>
                    </article>
                  ))}
                </div>
              )}

              <h2 className="dashboard-section-title">
                Teaching Activities
              </h2>

              <div className="dashboard-grid">

                <div className="dashboard-card">
                  <span>📤</span>
                  <h3>Upload Study Materials</h3>
                  <p>
                    Upload notes and chapter-wise learning materials.
                  </p>
                </div>

                <div className="dashboard-card">
                  <span>📝</span>
                  <h3>Create Quiz</h3>
                  <p>
                    Prepare quizzes to test student knowledge.
                  </p>
                </div>

                <div className="dashboard-card">
                  <span>📊</span>
                  <h3>Student Performance</h3>
                  <p>
                    Monitor students' marks and learning progress.
                  </p>
                </div>

                <div className="dashboard-card">
                  <span>🎥</span>
                  <h3>Add Video Lessons</h3>
                  <p>
                    Share useful educational video lessons.
                  </p>
                </div>

                <div className="dashboard-card">
                  <span>👨‍🎓</span>
                  <h3>Manage Students</h3>
                  <p>
                    View and manage student learning activities.
                  </p>
                </div>

                <div className="dashboard-card">
                  <span>📢</span>
                  <h3>Notifications</h3>
                  <p>
                    Share important classroom announcements.
                  </p>
                </div>

              </div>
            </>
          )}

        </main>

        <footer>
          <h2>📚 EduRural AI</h2>
          <p>Bringing digital education to every rural classroom.</p>
          <p>© 2026 EduRural AI. All rights reserved.</p>
        </footer>

      </div>
    );
  }

  // ==============================
  // ORIGINAL HOMEPAGE
  // ==============================

  return (
    <div className="app">

      {/* Navigation */}
      <nav className="navbar">
        <div className="logo">
          <span className="logo-icon">📚</span>
          <div>
            <h2>EduRural<span> AI</span></h2>
            <small>LEARN • GROW • SUCCEED</small>
          </div>
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#classes">Classes</a>
          <a href="#subjects">Subjects</a>
          <a href="#about">About</a>
        </div>

        <div className="nav-actions">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option>English</option>
            <option>ಕನ್ನಡ</option>
          </select>

          <button className="login-btn" onClick={openAuth}>
            Login →
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-content">
          <span className="tag">✨ DIGITAL EDUCATION FOR EVERYONE</span>

          <h1>
            Education for All.<br />
            <span>Opportunity for Every Student.</span>
          </h1>

          <p>
            Making quality education accessible to rural students
            through interactive learning, AI-powered assistance,
            and digital study materials.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn" onClick={openAuth}>
              Start Learning →
            </button>

            <a href="#subjects" className="secondary-btn">
              Explore Subjects
            </a>
          </div>

          <div className="hero-stats">
            <div>
              <h3>3</h3>
              <p>Classes</p>
            </div>

            <div>
              <h3>3</h3>
              <p>Subjects</p>
            </div>

            <div>
              <h3>AI</h3>
              <p>Smart Learning</p>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="learning-card">
            <div className="book-icon">📖</div>
            <h2>Learn Without Limits</h2>
            <p>Your classroom, wherever you are.</p>

            <div className="progress-box">
              <span>Learning Progress</span>
              <h2>85%</h2>

              <div className="progress-bar">
                <div></div>
              </div>
            </div>

            <div className="ai-box">
              🤖 AI Learning Assistant
              <p>Ask questions. Get instant answers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Classes */}
      <section className="section" id="classes">
        <div className="section-heading">
          <span>YOUR LEARNING JOURNEY</span>
          <h2>Choose Your Class</h2>
          <p>Select your class to explore learning materials.</p>
        </div>

        <div className="class-grid">
          {['Class 8', 'Class 9', 'Class 10'].map((item) => (
            <div
              className={`class-card ${selectedClass === item ? 'active' : ''}`}
              key={item}
              onClick={() => setSelectedClass(item)}
            >
              <div className="class-icon">🎓</div>
              <h3>{item}</h3>
              <p>Explore your syllabus and study materials.</p>
              <button onClick={openAuth}>Explore →</button>
            </div>
          ))}
        </div>

        <p className="selected-text">
          Currently selected: <strong>{selectedClass}</strong>
        </p>
      </section>

      {/* Subjects */}
      <section className="section subject-section" id="subjects">
        <div className="section-heading">
          <span>LEARN SMARTER</span>
          <h2>Explore Your Subjects</h2>
          <p>Everything you need to understand every chapter.</p>
        </div>

        <div className="subject-grid">
          {subjects.map((subject) => (
            <div className="subject-card" key={subject.name}>
              <div className={`subject-icon ${subject.color}`}>
                {subject.icon}
              </div>

              <h3>{subject.name}</h3>
              <p>{subject.chapters} chapters available</p>

              <button onClick={openAuth}>
                Start Learning →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="section features-section" id="about">
        <div className="section-heading">
          <span>WHY EDURURAL AI?</span>
          <h2>Learning Made Easier</h2>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <span>📚</span>
            <h3>Digital Notes</h3>
            <p>Chapter-wise notes and study materials.</p>
          </div>

          <div className="feature-card">
            <span>🎥</span>
            <h3>Video Learning</h3>
            <p>Learn concepts through educational videos.</p>
          </div>

          <div className="feature-card">
            <span>📝</span>
            <h3>AI Generated Quizzes</h3>
            <p>Automatically generated chapter-based quizzes.</p>
          </div>

          <div className="feature-card">
            <span>📊</span>
            <h3>Performance Tracking</h3>
            <p>Monitor marks, progress and weak subjects.</p>
          </div>

          <div className="feature-card">
            <span>🤖</span>
            <h3>AI Tutor</h3>
            <p>Ask questions and understand difficult concepts.</p>
          </div>

          <div className="feature-card">
            <span>🌐</span>
            <h3>Regional Languages</h3>
            <p>Learn in Kannada and English.</p>
          </div>
        </div>
      </section>

      {/* Login and Registration Modal */}
      {showLogin && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowLogin(false);
            }
          }}
        >
          <div className="login-modal">

            <button
              className="close-btn"
              onClick={() => setShowLogin(false)}
            >
              ✕
            </button>

            <div className="logo-icon">📚</div>

            <h2>Welcome to EduRural AI</h2>
            <p>Learn, grow and succeed with us.</p>

            {/* Authentication Tabs */}
            <div className="auth-tabs">
              <button
                className={authMode === 'login' ? 'active' : ''}
                onClick={() => {
                  setAuthMode('login');
                  setError('');
                  setSuccess('');
                }}
              >
                Login
              </button>

              <button
                className={authMode === 'register' ? 'active' : ''}
                onClick={() => {
                  setAuthMode('register');
                  setError('');
                  setSuccess('');
                }}
              >
                Create Account
              </button>
            </div>

            {/* Role Selection */}
            <div className="role-buttons">
              <button
                className={role === 'student' ? 'selected' : ''}
                onClick={() => setRole('student')}
                type="button"
              >
                🎓 Student
              </button>

              <button
                className={role === 'teacher' ? 'selected' : ''}
                onClick={() => setRole('teacher')}
                type="button"
              >
                👨‍🏫 Teacher
              </button>
            </div>

            <form onSubmit={handleAuth}>

              {authMode === 'register' && (
                <>
                  <label>Full Name</label>

                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </>
              )}

              <label>Email Address</label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label>Password</label>

              <input
                type="password"
                placeholder="Enter password (minimum 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />

              {authMode === 'register' && role === 'student' && (
                <>
                  <label>Select Class</label>

                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    required
                  >
                    <option>Class 8</option>
                    <option>Class 9</option>
                    <option>Class 10</option>
                  </select>
                </>
              )}

              {error && (
                <div className="auth-error">{error}</div>
              )}

              {success && (
                <div className="auth-success">{success}</div>
              )}

              <button
                type="submit"
                className="primary-btn full-btn"
                disabled={loading}
              >
                {loading
                  ? 'Please wait...'
                  : authMode === 'login'
                    ? `Login as ${role === 'student' ? 'Student' : 'Teacher'} →`
                    : 'Create Account →'}
              </button>

            </form>

            <p className="modal-note">
              {authMode === 'login'
                ? "Don't have an account? Select Create Account."
                : 'Already registered? Select Login.'}
            </p>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer>
        <h2>📚 EduRural AI</h2>
        <p>Bringing digital education to every rural classroom.</p>
        <p>© 2026 EduRural AI. All rights reserved.</p>
      </footer>

    </div>
  );
}

export default App;
