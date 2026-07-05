import React from 'react';
import { useNavigate } from 'react-router';
import '../styles/landing.scss';

const Landing = () => {
    const navigate = useNavigate();

    const features = [
        {
            title: "Resume & JD Analysis",
            description: "Align your profile against key job requirements to identify alignment gaps instantly.",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            )
        },
        {
            title: "AI Interview Strategies",
            description: "Receive personalized technical and behavioral interview questions complete with intentions and model answers.",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            )
        },
        {
            title: "Instant Match Score",
            description: "Leverage standard models to calculate custom percentage scores showing how well you fit the role.",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            )
        },
        {
            title: "Personalized Prep Roadmaps",
            description: "Tackle a structured daily agenda covering core skills, mock tasks, and review processes.",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
            )
        }
    ];

    return (
        <div className="landing-page">
            {/* Header Navigation */}
            <header className="landing-header">
                <div className="landing-header__logo">
                    Prep<span className="logo-accent">Pilot</span>
                </div>
                <div className="landing-header__actions">
                    <button className="landing-btn text-btn" onClick={() => navigate('/login')}>Login</button>
                    <button className="landing-btn primary-btn" onClick={() => navigate('/register')}>Get Started</button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="landing-hero">
                <div className="landing-hero__content">
                    <h1>Smarter Interview Strategy with <span className="highlight">PrepPilot</span></h1>
                    <p>
                        Upload your resume, paste the target job description, and instantly receive a personalized preparation strategy, custom questions, and detailed match score assessments.
                    </p>
                    <div className="landing-hero__ctas">
                        <button className="landing-btn primary-btn large-btn" onClick={() => navigate('/register')}>
                            Create Free Account
                        </button>
                        <button className="landing-btn outline-btn large-btn" onClick={() => navigate('/login')}>
                            Sign In
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="landing-features">
                <h2>Why Choose PrepPilot?</h2>
                <p className="section-subtitle">Unlock customized prep metrics designed specifically for your career profile.</p>
                <div className="features-grid">
                    {features.map((f, i) => (
                        <div key={i} className="feature-card">
                            <div className="feature-card__icon">{f.icon}</div>
                            <h3>{f.title}</h3>
                            <p>{f.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Page Footer */}
            <footer className="landing-footer">
                <p className="footer-info">&copy; 2026 PrepPilot. All rights reserved.</p>
                <div className="footer-links">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Help Center</a>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
