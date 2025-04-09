import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import App from './App';

const getTheme = (mode) => createTheme({
    palette: {
        mode,
        primary: {
            main: mode === 'dark' ? '#90caf9' : '#1976d2',
            light: mode === 'dark' ? '#e3f2fd' : '#42a5f5',
            dark: mode === 'dark' ? '#42a5f5' : '#1565c0',
        },
        secondary: {
            main: mode === 'dark' ? '#f48fb1' : '#dc004e',
            light: mode === 'dark' ? '#fce4ec' : '#ff4081',
            dark: mode === 'dark' ? '#f06292' : '#c51162',
        },
        background: {
            default: mode === 'dark' ? '#121212' : '#ffffff',
            paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
        },
        text: {
            primary: mode === 'dark' ? '#ffffff' : '#000000',
            secondary: mode === 'dark' ? '#b0b0b0' : '#666666',
        },
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                },
            },
        },
    },
});

const root = ReactDOM.createRoot(
    document.getElementById('root')
);

root.render(
    <React.StrictMode>
        <ThemeProvider theme={getTheme('light')}>
            <CssBaseline />
            <App />
        </ThemeProvider>
    </React.StrictMode>
); 