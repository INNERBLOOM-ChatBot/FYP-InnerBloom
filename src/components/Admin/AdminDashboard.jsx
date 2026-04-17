import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import config from '/src/config.js';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [moods, setMoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            setCurrentUser(user);
            if (user.role !== 'admin') {
                navigate('/chat');
                return;
            }
        }
        
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/signin');
                return;
            }
            try {
                const [usersRes, moodsRes] = await Promise.all([
                    fetch(`${config.API_BASE_URL}/api/admin/users`, { 
                        headers: { 'Authorization': `Bearer ${token}` } 
                    }),
                    fetch(`${config.API_BASE_URL}/api/admin/moods`, { 
                        headers: { 'Authorization': `Bearer ${token}` } 
                    })
                ]);
                
                if (usersRes.status === 401 || moodsRes.status === 401) {
                    navigate('/signin');
                    return;
                }

                const usersData = await usersRes.json();
                const moodsData = await moodsRes.json();
                setUsers(Array.isArray(usersData) ? usersData : []);
                setMoods(Array.isArray(moodsData) ? moodsData : []);
            } catch (error) {
                console.error('Admin fetch error', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/signin');
    };

    if (loading) return <div className="admin-loading">Loading Management Console...</div>;

    return (
        <div className="admin-portal-content">
            <div className="portal-header-info">
                <h1>System Overview</h1>
                <p>Monitor patient activity and manage user accounts</p>
            </div>

            <div className="admin-stats-row">
                <div className="stat-card">
                    <i className="fas fa-users"></i>
                    <div className="stat-info">
                        <span>Total Registered</span>
                        <h3>{users.length}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <i className="fas fa-chart-bar"></i>
                    <div className="stat-info">
                        <span>Activity Logs</span>
                        <h3>{moods.length}</h3>
                    </div>
                </div>
            </div>

            <div className="admin-grid">
                <section className="admin-section">
                    <div className="section-header">
                        <i className="fas fa-list"></i>
                        <h2>User Directory</h2>
                    </div>
                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td>
                                            <div className="user-info-cell">
                                                <div className="avatar">{u.name.charAt(0)}</div>
                                                <div>
                                                    <div className="user-name-text">{u.name}</div>
                                                    <div className="user-email-text">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                                        <td>{new Date(u.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="admin-section">
                    <div className="section-header">
                        <i className="fas fa-heartbeat"></i>
                        <h2>Recent Activity</h2>
                    </div>
                    <div className="mood-feed">
                        {moods.slice(0, 10).map(m => (
                            <div key={m.id} className="mood-feed-item">
                                <div className="feed-icon"><i className="fas fa-check-circle"></i></div>
                                <div className="feed-content">
                                    <div className="feed-top">
                                        <span className="feed-user">{m.user_name}</span>
                                        <span className="feed-time">{new Date(m.created_at).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="feed-bottom">
                                        Feeling <span className="mood-type-label">{m.mood_type}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminDashboard;
