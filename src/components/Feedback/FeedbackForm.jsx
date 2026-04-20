import React, { useState } from 'react';
import config from '../../config.js';

const FeedbackForm = () => {
    const [feedback, setFeedback] = useState('');
    const [status, setStatus] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${config.API_BASE_URL}/api/feedback`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ feedback })
            });
            if (res.ok) {
                setStatus('Feedback submitted successfully! Thank you.');
                setFeedback('');
            } else {
                setStatus('Failed to submit feedback.');
            }
        } catch (error) {
            setStatus('An error occurred.');
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'Inter' }}>
            <h2 style={{ color: '#2c7a5f', marginBottom: '1rem' }}>We value your feedback</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <textarea 
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Tell us what you think or report a bug..."
                    rows="6"
                    required
                    style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem', resize: 'vertical' }}
                />
                <button type="submit" style={{ padding: '1rem', background: '#50c878', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }}>
                    Submit Feedback
                </button>
                {status && <p style={{ color: status.includes('success') ? '#22c55e' : '#ef4444', fontWeight: 'bold' }}>{status}</p>}
            </form>
        </div>
    );
};

export default FeedbackForm;
