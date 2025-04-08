import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import '../styles/GoogleFormAccess.css';

function GoogleFormAccess() {
    const { user } = useAuth();
    const [formUrl, setFormUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [accessInfo, setAccessInfo] = useState(null);

    const handleVerifyAccess = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await axios.post('/api/google-forms/verify-access',
                { formUrl },
                {
                    headers: {
                        Authorization: `Bearer ${await user.getIdToken()}`
                    }
                }
            );

            setAccessInfo(response.data);
        } catch (error) {
            setError(error.response?.data?.error || 'Error verifying form access');
            setAccessInfo(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="google-form-access">
            <h2>Access Google Form</h2>
            <div className="form-input">
                <input
                    type="text"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    placeholder="Enter Google Form URL"
                    className="url-input"
                />
                <button
                    onClick={handleVerifyAccess}
                    disabled={loading || !formUrl}
                    className="verify-btn"
                >
                    {loading ? 'Verifying...' : 'Verify Access'}
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {accessInfo && (
                <div className="access-info">
                    <h3>Access Granted!</h3>
                    <p>Form Title: {accessInfo.formTitle}</p>
                    <a
                        href={formUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="open-form-btn"
                    >
                        Open Form
                    </a>
                </div>
            )}
        </div>
    );
}

export default GoogleFormAccess; 