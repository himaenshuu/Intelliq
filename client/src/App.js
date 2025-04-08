import React, { useState, useEffect } from "react";
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Tabs,
    Tab,
    CircularProgress,
    Alert,
    Divider,
    Chip,
    IconButton,
    Tooltip,
} from "@mui/material";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import "./App.css";

// Configure Axios defaults
axios.defaults.baseURL =
    process.env.NODE_ENV === "production"
        ? process.env.REACT_APP_API_URL
        : "http://localhost:5000";
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.withCredentials = true;

function App() {
    const [activeTab, setActiveTab] = useState(0);
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
        // Check for saved theme preference
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            setIsDarkMode(savedTheme === "dark");
        } else {
            // Check system preference
            const prefersDark = window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches;
            setIsDarkMode(prefersDark);
        }
    }, []);

    useEffect(() => {
        // Update theme when isDarkMode changes
        document.body.className = isDarkMode ? "dark-theme" : "light-theme";
        localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(answer);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const onDrop = async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setLoading(true);
        setError("");
        const formData = new FormData();
        formData.append("file", file);
        formData.append("context", context);

        try {
            const endpoint =
                activeTab === 1 ? "/api/process-pdf" : "/api/process-image";
            const response = await axios.post(endpoint, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setAnswer(response.data.answer);
        } catch (err) {
            console.error("Error processing file:", err);
            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                setError(
                    err.response.data.error ||
                    "An error occurred while processing the file"
                );
                if (err.response.data.details) {
                    setError((prev) => `${prev}: ${err.response.data.details}`);
                }
            } else if (err.request) {
                // The request was made but no response was received
                setError(
                    "No response from server. Please check if the server is running."
                );
            } else {
                // Something happened in setting up the request that triggered an Error
                setError("An error occurred while setting up the request");
            }
        } finally {
            setLoading(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept:
            activeTab === 1
                ? { "application/pdf": [".pdf"] }
                : { "image/*": [".png", ".jpg", ".jpeg"] },
    });

    const formatAnswer = (text) => {
        // Remove stars and clean up the text
        return text
            .replace(/\*\*/g, "") // Remove double stars
            .replace(/\*/g, "") // Remove single stars
            .replace(/\n\s*\n/g, "\n") // Remove extra newlines
            .trim();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            let result;
            const formData = new FormData();

            if (file) {
                // Handle file upload (PDF or image)
                formData.append("file", file);
                formData.append("context", context);

                const endpoint = file.type === "application/pdf" ? "/api/process-pdf" : "/api/process-image";
                result = await axios.post(endpoint, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    withCredentials: true,
                });
            } else if (url && text.trim()) {
                // Handle URL processing
                result = await axios.post(
                    "/api/process-url",
                    {
                        url: url,
                        question: text,
                        context: context.trim(),
                    },
                    {
                        withCredentials: true,
                    }
                );
            } else if (text.trim()) {
                // Handle text input
                result = await axios.post(
                    "/api/process",
                    {
                        text: text,
                        context: context.trim(),
                    },
                    {
                        withCredentials: true,
                    }
                );
            } else {
                throw new Error("Please provide either a question, URL, or upload a file");
            }

            setAnswer(result.data.result);
            setFileName(file ? file.name : text);
        } catch (error) {
            console.error("Error:", error);
            setError(error.response?.data?.error || error.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
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

    return (
        <div className={`App ${isDarkMode ? "dark-theme" : "light-theme"}`}>
            <header className="App-header">
                <div className="header-content">
                    <h1>AI Quiz Solver</h1>
                </div>
                <button className="theme-toggle" onClick={toggleTheme}>
                    {isDarkMode ? "☀️" : "🌙"}
                </button>
            </header>
            <main className="App-main">
                <form onSubmit={handleSubmit}>
                    <div className="input-container">
                        <textarea
                            className="input-field"
                            value={text}
                            onChange={(e) => {
                                setText(e.target.value);
                                setError("");
                            }}
                            onKeyPress={handleKeyPress}
                            placeholder="Enter your question here..."
                            rows={4}
                        />
                        <div className="url-container">
                            <input
                                type="url"
                                className="url-input"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="Enter URL (optional)"
                            />
                        </div>
                        <div className="button-container">
                            <button
                                type="submit"
                                className="submit-button"
                                disabled={loading || (!text && !file && !url)}
                            >
                                {loading ? "Processing..." : "Submit"}
                            </button>
                        </div>
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

                    {error && <div className="error-message">{error}</div>}

                    {answer && (
                        <div className="answer-container">
                            <h2>Answer</h2>
                            <div className="answer-content">
                                {answer.split("\n").map((line, index) => (
                                    <div key={index} className="answer-line">
                                        {line}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </form>
            </main>
            <footer className="App-footer">
                <div className="footer-content">
                    <p>
                        © {new Date().getFullYear()} AI Quiz Solver. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default App;
