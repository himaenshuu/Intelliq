import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Login.css';

function Login() {
    const { googleSignIn } = useAuth();

    const handleGoogleSignIn = async () => {
        try {
            await googleSignIn();
        } catch (error) {
            console.error('Error signing in:', error);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>AI Quiz Solver</h1>
                <p>Sign in to access all features</p>
                <button onClick={handleGoogleSignIn} className="google-signin-btn">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" />
                    Sign in with Google
                </button>
            </div>
        </div>
    );
}

export default Login; 