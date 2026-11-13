import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";

interface SpeechRecognitionResultEvent {
  results: ArrayLike<
    ArrayLike<{ transcript: string }>
  >;
}

interface BrowserSpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionWindow extends Window {
  SpeechRecognition?: new () => BrowserSpeechRecognition;
  webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
}

interface Message {
  role: "user" | "assistant";
  text: string;
}

export default function AITutor() {
  const [question, setQuestion] = useState("");
  const [subject, setSubject] = useState("Science");
  const [language, setLanguage] = useState("English");
  const [grade, setGrade] = useState("8");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);

  // Convert AI text into spoken voice
  const speakAnswer = (text: string) => {
    if (!("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/[#*_`]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

    const speech = new SpeechSynthesisUtterance(cleanText);

    speech.lang = language === "Kannada" ? "kn-IN" : "en-US";
    speech.rate = 0.9;
    speech.pitch = 1;

    speech.onstart = () => setSpeaking(true);

    speech.onend = () => setSpeaking(false);

    speech.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(speech);
  };

  // Stop AI voice
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  // Start microphone
  const startListening = () => {
    const speechWindow = window as SpeechRecognitionWindow;

    const SpeechRecognitionAPI =
      speechWindow.SpeechRecognition ||
      speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      alert("Speech recognition is not supported. Please use Google Chrome.");
      return;
    }

    stopSpeaking();

    const recognition = new SpeechRecognitionAPI();

    recognition.lang = language === "Kannada" ? "kn-IN" : "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;

      setQuestion(transcript);
      askAI(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setListening(true);
    } catch (error) {
      console.error("Microphone error:", error);
      setListening(false);
    }
  };

  // Stop microphone
  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  // Ask Gemini AI
  const askAI = async (voiceQuestion?: string) => {
    const userQuestion = (voiceQuestion || question).trim();

    if (!userQuestion || loading) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userQuestion },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/ai-tutor/ask",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: userQuestion,
            subject,
            language,
            grade,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "AI Tutor request failed");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.answer },
      ]);

      // Automatically speak AI answer after voice questions
      if (voiceQuestion) {
        speakAnswer(data.answer);
      }

    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            error instanceof Error
              ? error.message
              : "Unable to connect to AI Tutor.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>

      <div style={styles.header}>
        <h1>🤖 EDURURAL-AI Tutor</h1>
        <p>Your personal AI learning assistant</p>
        <p>🎙️ English and Kannada Voice Support</p>
      </div>

      <div style={styles.settings}>

        <label>
          Grade
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            style={styles.select}
          >
            <option value="8">Grade 8</option>
            <option value="9">Grade 9</option>
            <option value="10">Grade 10</option>
          </select>
        </label>

        <label>
          Subject
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={styles.select}
          >
            <option>Maths</option>
            <option>Science</option>
            <option>Social Science</option>
          </select>
        </label>

        <label>
          Language
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={styles.select}
          >
            <option>English</option>
            <option>Kannada</option>
          </select>
        </label>

      </div>

      <div style={styles.chat}>

        {messages.length === 0 && (
          <div style={styles.welcome}>
            <h2>Hello, Student! 👋</h2>
            <p>Ask me anything about your lessons.</p>
            <p>Or click the microphone to talk with me!</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              ...styles.message,
              alignSelf:
                message.role === "user"
                  ? "flex-end"
                  : "flex-start",
              background:
                message.role === "user"
                  ? "#dbeafe"
                  : "#f1f5f9",
            }}
          >
            <strong>
              {message.role === "user" ? "You" : "AI Tutor"}
            </strong>

            <div className="ai-response">
              <ReactMarkdown>{message.text}</ReactMarkdown>
            </div>

            {message.role === "assistant" && (
              <button
                onClick={() => speakAnswer(message.text)}
                style={styles.speakButton}
              >
                🔊 Listen
              </button>
            )}
          </div>
        ))}

        {loading && (
          <div style={styles.loading}>
            AI Tutor is thinking...
          </div>
        )}

      </div>

      <div style={styles.voiceArea}>

        {!listening ? (
          <button
            onClick={startListening}
            disabled={loading}
            style={styles.micButton}
          >
            🎤 Start Talking
          </button>
        ) : (
          <button
            onClick={stopListening}
            style={styles.stopButton}
          >
            ⏹️ Stop Listening
          </button>
        )}

        {speaking && (
          <button
            onClick={stopSpeaking}
            style={styles.stopButton}
          >
            🔇 Stop Speaking
          </button>
        )}

      </div>

      <div style={styles.inputArea}>

        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask your question here..."
          style={styles.textarea}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              askAI();
            }
          }}
        />

        <button
          onClick={() => askAI()}
          disabled={loading || !question.trim()}
          style={styles.button}
        >
          {loading ? "Please wait..." : "Ask AI"}
        </button>

      </div>

    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {

  container: {
    maxWidth: "900px",
    margin: "25px auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    background: "#ffffff",
    borderRadius: "15px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
  },

  header: {
    textAlign: "center",
    background: "#2563eb",
    color: "white",
    padding: "20px",
    borderRadius: "12px",
  },

  settings: {
    display: "flex",
    flexWrap: "wrap",
    gap: "15px",
    margin: "20px 0",
  },

  select: {
    display: "block",
    padding: "10px",
    marginTop: "6px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },

  chat: {
    minHeight: "300px",
    maxHeight: "450px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "15px",
    background: "#f8fafc",
    borderRadius: "10px",
  },

  welcome: {
    textAlign: "center",
    margin: "auto",
    color: "#475569",
  },

  message: {
    maxWidth: "85%",
    padding: "12px",
    borderRadius: "10px",
    lineHeight: "1.6",
    overflowWrap: "anywhere",
  },

  loading: {
    padding: "10px",
    color: "#2563eb",
  },

  inputArea: {
    display: "flex",
    gap: "10px",
    marginTop: "15px",
    flexWrap: "wrap",
  },

  textarea: {
    flex: "1",
    minWidth: "200px",
    minHeight: "55px",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    resize: "vertical",
  },

  button: {
    padding: "12px 25px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },

  voiceArea: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "20px",
  },

  micButton: {
    padding: "14px 25px",
    background: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "30px",
    cursor: "pointer",
    fontSize: "16px",
  },

  stopButton: {
    padding: "14px 25px",
    background: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "30px",
    cursor: "pointer",
    fontSize: "16px",
  },

  speakButton: {
    padding: "7px 12px",
    marginTop: "8px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

};