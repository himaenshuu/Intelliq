import React, { useState, useEffect } from "react";
import {
    Button,
    CircularProgress,
    IconButton,
    ThemeProvider,
    createTheme,
} from "@mui/material";
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
        e.preventDefault();
        
        // Clear previous errors
        setError("");
        
        // Validate inputs
        const hasText = text.trim().length > 0;
        const hasUrl = url.trim().length > 0;
        const hasFile = file !== null;
        
        if (!hasText && !hasUrl && !hasFile) {
            setError("Please provide either a question, URL, or upload a file to get started.");
            return;
        }
        
        // Validate text length
        if (hasText && text.length > 10000) {
            setError("Text is too long. Please limit your question to 10,000 characters.");
            return;
        }
        
        // Validate context length
        if (context.length > 1000) {
            setError("Context is too long. Please limit to 1,000 characters.");
            return;
        }
        
        // Validate URL format if provided
        if (hasUrl) {
            try {
                new URL(url);
            } catch {
                setError("Please enter a valid URL format (e.g., https://example.com)");
                return;
            }
        }
        
        setLoading(true);

        try {
            let result;
            const formData = new FormData();

            if (file) {
                formData.append("file", file);
                formData.append("context", context);
                const endpoint = file.type === "application/pdf" ? "/api/process-pdf" : "/api/process-image";
                result = await axios.post(endpoint, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            } else if (url) {
                // If URL is provided but no question, use a default question
                const question = text.trim() || "Summarize this page and provide key information";
                result = await axios.post("/api/process-url", {
                    url: url,
                    question: question,
                    context: context.trim(),
                });
            } else if (text.trim()) {
                result = await axios.post("/api/process", {
                    text: text,
                    context: context.trim(),
                });
            }

            setAnswer(result.data.answer);
            setFileName(file ? file.name : text);
        } catch (error) {
            console.error("Error:", error);
            const errorMessage = error.response?.data?.error || error.message || "An error occurred while processing your request. Please try again.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // File size validation (5MB limit)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                setError("File size exceeds 5MB limit. Please choose a smaller file.");
                setFile(null);
                setFileName("");
                return;
            }

            // File type validation
            if (file.type === "application/pdf" || file.type.startsWith("image/")) {
                setFile(file);
                setFileName(file.name);
                setError("");
            } else {
                setError("Please upload a PDF or image file (PNG, JPG, JPEG)");
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
                        <h1>Intelliq AI</h1>
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
                                            setText(e.target.value);
                                            setError("");
                                        }}
                                        placeholder="Enter your question here... (e.g., 'Explain the main concepts in this document' or 'What are the key takeaways?')"
                                        rows={4}
                                        maxLength={10000}
                                        aria-label="Question or text input"
                                    />
                                    <div className="character-count">
                                        {text.length}/10,000 characters
                                    </div>
                                </div>

                                <div className="url-container">
                                    <input
                                        type="url"
                                        className="url-input"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="Enter URL (optional) - e.g., https://example.com/article"
                                        aria-label="URL input"
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
                                        placeholder="Add any additional context (optional)... e.g., 'Focus on technical details' or 'Summarize for beginners'"
                                        rows={2}
                                        maxLength={1000}
                                        aria-label="Additional context input"
                                    />
                                    <div className="character-count">
                                        {context.length}/1,000 characters
                                    </div>
                                </div>

                                <div className="file-upload-section">
                                    <div className="file-upload">
                                        <input
                                            type="file"
                                            id="file-upload"
                                            onChange={handleFileChange}
                                            accept=".pdf,image/*"
                                            aria-describedby="file-help"
                                        />
                                        <label htmlFor="file-upload" className="file-upload-label">
                                            📎 Choose File
                                        </label>
                                        <div id="file-help" className="file-help">
                                            Supported: PDF, PNG, JPG, JPEG (max 5MB)
                                        </div>
                                        {file && (
                                            <span className="file-name">
                                                📄 Selected: {fileName}
                                                <button
                                                    type="button"
                                                    className="clear-file"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setFile(null);
                                                        setFileName("");
                                                    }}
                                                    aria-label="Remove selected file"
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
