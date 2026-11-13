import { useState } from "react";

export default function DoubtSolver() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [question, setQuestion] = useState("");
  const [subject, setSubject] = useState("Science");
  const [language, setLanguage] = useState("English");
  const [grade, setGrade] = useState("8");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImage = (file: File | undefined) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image.");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setAnswer("");
  };

  const solveDoubt = async () => {
    if (!image) {
      alert("Please upload a question image.");
      return;
    }

    setLoading(true);
    setAnswer("");

    try {
      const formData = new FormData();

      formData.append("image", image);
      formData.append("question", question);
      formData.append("subject", subject);
      formData.append("language", language);
      formData.append("grade", grade);

      const token = localStorage.getItem("edurural_token");

      const response = await fetch(
        "http://localhost:5000/api/doubt-solver/solve",
        {
          method: "POST",
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to solve the question.");
      }

      setAnswer(data.answer);

    } catch (error) {
      setAnswer(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>📸 AI Doubt Solver</h1>

      <p>
        Upload a textbook or handwritten question.
        Our AI Tutor will explain it step by step.
      </p>

      <div style={styles.settings}>
        <label>
          Grade
          <select value={grade} onChange={e => setGrade(e.target.value)}>
            <option value="8">Class 8</option>
            <option value="9">Class 9</option>
            <option value="10">Class 10</option>
          </select>
        </label>

        <label>
          Subject
          <select value={subject} onChange={e => setSubject(e.target.value)}>
            <option>Science</option>
            <option>Maths</option>
            <option>Social Science</option>
          </select>
        </label>

        <label>
          Language
          <select value={language} onChange={e => setLanguage(e.target.value)}>
            <option>English</option>
            <option>Kannada</option>
          </select>
        </label>
      </div>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={e => handleImage(e.target.files?.[0])}
      />

      {preview && (
        <div>
          <img
            src={preview}
            alt="Uploaded question"
            style={styles.preview}
          />
        </div>
      )}

      <textarea
        value={question}
        onChange={e => setQuestion(e.target.value)}
        placeholder="Optional: Add more details about your doubt..."
        style={styles.textarea}
      />

      <button
        onClick={solveDoubt}
        disabled={loading || !image}
        style={styles.button}
      >
        {loading ? "Solving..." : "🤖 Solve My Doubt"}
      </button>

      {answer && (
        <div style={styles.answer}>
          <h2>AI Explanation</h2>
          <div style={{ whiteSpace: "pre-wrap" }}>
            {answer}
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: "850px",
    margin: "25px auto",
    padding: "25px",
    background: "white",
    borderRadius: "15px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
    fontFamily: "Arial, sans-serif",
  },
  settings: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    margin: "20px 0",
  },
  preview: {
    width: "100%",
    maxWidth: "450px",
    maxHeight: "350px",
    objectFit: "contain",
    marginTop: "15px",
    borderRadius: "10px",
  },
  textarea: {
    width: "100%",
    minHeight: "80px",
    padding: "12px",
    marginTop: "15px",
    boxSizing: "border-box",
  },
  button: {
    padding: "13px 25px",
    marginTop: "15px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  answer: {
    marginTop: "25px",
    padding: "20px",
    background: "#eff6ff",
    borderRadius: "10px",
    lineHeight: "1.7",
    overflowWrap: "anywhere",
  },
};