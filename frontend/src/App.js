import React, { useState, useEffect } from "react";
import {
    Button,
    CircularProgress,
    IconButton,
    ThemeProvider,
    createTheme,
} from "@mui/material";
// import { useDropzone } from "react-dropzone";
import axios from "axios";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import "./App.css";
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import AnswerDisplay from './components/AnswerDisplay';

// Configure Axios defaults
axios.defaults.baseURL =
    process.env.NODE_ENV === "production"
        ? process.env.REACT_APP_API_URL
        : "http://localhost:5000";
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.withCredentials = true;

function AppContent() {
    const { user, logOut } = useAuth();
    const [text, setText] = useState("");
    const [context, setContext] = useState("");
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const [file, setFile] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [url, setUrl] = useState("");
    const [fileName, setFileName] = useState("");

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            setIsDarkMode(savedTheme === "dark");
        } else {
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            setIsDarkMode(prefersDark);
        }
    }, []);

    useEffect(() => {
        document.body.className = isDarkMode ? "dark-theme" : "light-theme";
        localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    }, [isDarkMode]);

    const theme = createTheme({
        palette: {
            mode: isDarkMode ? 'dark' : 'light',
            primary: {
                main: isDarkMode ? '#90caf9' : '#1976d2',
            },
            secondary: {
                main: isDarkMode ? '#f48fb1' : '#dc004e',
            },
            background: {
                default: isDarkMode ? '#121212' : '#ffffff',
                paper: isDarkMode ? '#1e1e1e' : '#ffffff',
            },
        },
    });

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(answer);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (e) => {
        console.log("=== FORM SUBMISSION START ===");
        console.log("file:", file, "url:", url, "text:", text, "context:", context);
        console.log("text.trim():", text.trim());
        console.log("url && text.trim():", url && text.trim());
        console.log("text.trim() only:", text.trim());
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            let result;
            const formData = new FormData();

            if (file) {
                console.log("Processing file upload...");
                formData.append("file", file);
                formData.append("context", context);
                const endpoint = file.type === "application/pdf" ? "/api/process-pdf" : "/api/process-image";
                result = await axios.post(endpoint, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            } else if (url) {
                // If URL is provided but no question, use a default question
                const question = text.trim() || "Summarize this page and provide key information";
                console.log("Processing URL + question (auto-generated if needed)...");
                console.log("Using question:", question);
                result = await axios.post("/api/process-url", {
                    url: url,
                    question: question,
                    context: context.trim(),
                });
            } else if (text.trim()) {
                console.log("Processing text only...");
                result = await axios.post("/api/process", {
                    text: text,
                    context: context.trim(),
                });
            } else {
                console.log("No valid input found, throwing error...");
                throw new Error("Please provide either a question, URL, or upload a file");
            }

            console.log("API call successful, setting answer...");
            setAnswer(result.data.answer);
            setFileName(file ? file.name : text);
        } catch (error) {
            console.error("Error:", error);
            setError(error.response?.data?.error || error.message || "An error occurred");
        } finally {
            setLoading(false);
            console.log("=== FORM SUBMISSION END ===");
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type === "application/pdf" || file.type.startsWith("image/")) {
                setFile(file);
                setFileName(file.name);
                setError("");
            } else {
                setError("Please upload a PDF or image file");
                setFile(null);
                setFileName("");
            }
        }
    };

    if (!user) {
        return <Login />;
    }

    return (
        <ThemeProvider theme={theme}>
            <div className="app">
                <header className="app-header">
                    <div className="header-content">
                        <h1>IntelliQ</h1>
                        <div className="header-controls">
                            <div className="user-info">
                                <img src={user.photoURL} alt={user.displayName} className="user-avatar" />
                                <span className="user-name">{user.displayName}</span>
                            </div>
                            <div className="header-buttons">
                                <IconButton onClick={toggleTheme} color="inherit">
                                    {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
                                </IconButton>
                                <Button onClick={logOut} color="inherit">Logout</Button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="app-main">
                    <div className="main-container">
                        <form onSubmit={handleSubmit} className="input-form">
                            <div className="input-section">
                                <div className="text-input-container">
                                    <textarea
                                        className="input-field"
                                        value={text}
                                        onChange={(e) => {
                                            console.log("Text field changed:", e.target.value);
                                            setText(e.target.value);
                                            setError("");
                                        }}
                                        placeholder="Enter your question here..."
                                        rows={4}
                                    />
                                </div>

                                <div className="url-container">
                                    <input
                                        type="url"
                                        className="url-input"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="Enter URL (optional)"
                                    />
                                </div>

                                <div className="context-container">
                                    <textarea
                                        className="context-field"
                                        value={context}
                                        onChange={(e) => {
                                            setContext(e.target.value);
                                            setError("");
                                        }}
                                        placeholder="Add any additional context (optional)..."
                                        rows={2}
                                    />
                                </div>

                                <div className="file-upload-section">
                                    <div className="file-upload">
                                        <input
                                            type="file"
                                            id="file-upload"
                                            onChange={handleFileChange}
                                            accept=".pdf,image/*"
                                        />
                                        <label htmlFor="file-upload" className="file-upload-label">
                                            Choose File
                                        </label>
                                        {file && (
                                            <span className="file-name">
                                                Selected: {fileName}
                                                <button
                                                    className="clear-file"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setFile(null);
                                                        setFileName("");
                                                    }}
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="submit-container">
                                    <button
                                        type="submit"
                                        className="submit-button"
                                        disabled={loading || (!text && !file && !url)}
                                    >
                                        {loading ? "Processing..." : "Submit"}
                                    </button>
                                </div>
                            </div>
                        </form>

                        {loading && (
                            <div className="loading-container">
                                <CircularProgress />
                                <p>Processing your request...</p>
                            </div>
                        )}

                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        {answer && (
                            <div className="answer-section">
                                <div className="answer-header">
                                    <h2>Answer</h2>
                                    <button onClick={handleCopy} className="copy-button">
                                        {copied ? <CheckIcon /> : <ContentCopyIcon />}
                                    </button>
                                </div>
                                <AnswerDisplay answer={answer} />
                            </div>
                        )}
                    </div>
                </main>

                <footer className="app-footer">
                    <p>© 2025 Intelliq. All rights reserved.</p>
                </footer>
            </div>
        </ThemeProvider>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
