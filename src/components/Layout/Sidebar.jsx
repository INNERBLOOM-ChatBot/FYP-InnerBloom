import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role === 'admin';

    return (
        <aside className="main-sidebar">
            <div className="sidebar-logo">
                <i className="fas fa-leaf"></i>
                <span>InnerBloom</span>
            </div>
            
            <nav className="sidebar-nav">
                <NavLink to="/chat" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <i className="fas fa-comments"></i>
                    <span>Mental Health Chat</span>
                </NavLink>
                
                <NavLink to="/howitworks" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <i className="fas fa-info-circle"></i>
                    <span>How It Works</span>
                </NavLink>

                {isAdmin && (
                    <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <i className="fas fa-user-shield"></i>
                        <span>Admin Dashboard</span>
                    </NavLink>
                )}

                <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <i className="fas fa-cog"></i>
                    <span>Settings</span>
                </NavLink>

                <NavLink to="/feedback" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <i className="fas fa-comment-dots"></i>
                    <span>Feedback</span>
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <p>© 2026 InnerBloom</p>
            </div>
        </aside>
    );
};

export default Sidebar;
