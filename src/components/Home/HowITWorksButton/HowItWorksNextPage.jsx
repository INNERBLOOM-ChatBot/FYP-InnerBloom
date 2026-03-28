import React from 'react';
import './HowItWorksNextPageStyle.css';
import howitworks from "../../../assets/images/howitworks.jpg";
import howitworksmood from "../../../assets/images/howitworksmood.jpg";
import howitworks3 from "../../../assets/images/howitworks3.webp";

const HowItWorksNextPage = () => {
  return (
    <div className="how-it-works-page">

      {/* ── HERO / HEADER ── */}
      <section className="servicework-section">
        <div className="servicework-container">
          <div className="servicework-content">
            <h1 className="works-title">How InnerBloom Works</h1>
            <h2 className="works-subtitle">
              Simple, Gentle, and Always Supportive — Your Journey Starts in Just 3 Easy Steps
            </h2>
            
          </div>
        </div>
      </section>
     
      <p className="works-intro">
              InnerBloom is designed to meet you exactly where you are. No complicated forms, no judgment — 
              just a safe, private space powered by empathetic AI. Whether you're feeling overwhelmed, 
              curious, or ready for deeper support, we guide you gently every step of the way using 
              evidence-based techniques. Everything is confidential, available 24/7, and tailored to you.
            </p>
     
      {/* ── 3 STEPS TIMELINE / CARDS ── */}
      <section className="stepswork-section">
        <div className="work-container">
          <div className="stepswork-grid">

            {/* Step 1 */}
            <div className="stepworks-card">
              <div className="stepworks-number">1</div>
              <div className="stepworks-icon-wrapper">
            <img src={howitworks}alt="Share your thoughts" className="step-image" />
              </div>
              <h3 className="step-title">Share Your Thoughts</h3>
              <p className="step-description">
                Start by simply telling us how you're feeling — through easy text chat or voice input 
                (hands-free when you need it). No pressure to explain everything at once. Just type 
                or speak naturally, like talking to a caring friend.
              </p>
            </div>

            {/* Step 2 */}
            <div className="stepworks-card">
              <div className="stepworks-number">2</div>
              <div className="stepworks-icon-wrapper">
                <img src={howitworksmood} alt="AI understands your mood" className="step-image" />
              </div>
              <h3 className="step-title">AI Understands Your Mood</h3>
              <p className="step-description">
                Right away, InnerBloom analyzes your words, tone (if voice), and patterns to detect 
                your current emotional state — whether it's stress, low mood, worry, or something else. 
                If needed, we ask a quick, non-intrusive check-in question to get a clearer picture.
              </p>
              <ul className="key-features">
                <li>Real-time sentiment & emotion detection</li>
                <li>Daily/ongoing mood logging (private to you)</li>
                <li>No data shared — full end-to-end encryption</li>
              </ul>
            </div>

            {/* Step 3 */}
            <div className="stepworks-card">
              <div className="stepworks-number">3</div>
              <div className="stepworks-icon-wrapper">
                <img src={howitworks3} alt="Get supportive guidance" className="step-image" />
              </div>
              <h3 className="step-title">Get Supportive Guidance</h3>
              <p className="step-description">
                Based on what you've shared, we provide immediate, personalized support:
              </p>
              <ul className="key-features">
                <li>Empathetic responses and validation</li>
                <li>Gentle coping suggestions rooted in CBT, mindfulness, or positive psychology</li>
                <li>Intelligent routing to specialized modules (Anxiety, Depression, OCD, Bipolar, Phobias) when needed</li>
                <li>Interactive 3D exercises tailored to your needs</li>
                <li>Ongoing insights like "Your energy has improved this week"</li>
              </ul>
              <p className="control-note">
                You stay in control — skip, pause, or go deeper anytime.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── PRIVACY & SAFETY ── */}
      <section className="privacy-section">
        <div className="container">
          <h2 className="section-title">Privacy & Safety First</h2>
          <p className="privacy-text">
            Your conversations are completely private and encrypted. InnerBloom is <strong>not</strong> a replacement 
            for professional therapy — if we detect severe distress, we gently suggest reaching out to 
            a human professional or helpline (with local Pakistan resources listed). You're always in charge.
          </p>
        </div>
      </section>

      {/* ── WHAT MAKES US DIFFERENT ── */}
      <section className="difference-section">
        <div className="container">
          <h2 className="section-title">What Makes InnerBloom Different?</h2>
          <ul className="difference-list">
            <li>Two-tier intelligent routing (general → specialized)</li>
            <li>Voice + text for accessibility</li>
            <li>3D immersive exercises (not just text)</li>
            <li>Free, stigma-free, and always improving</li>
            <li>Developed by University of Education students with strong ethical focus</li>
          </ul>
        </div>
      </section>

      {/* ── READY TO BEGIN CTA ── */}
      <section className="cta-section">
        <div className="container cta-container">
          <h2 className="cta-title">Ready to Begin?</h2>
          <div className="cta-buttons">
            <a href="/signup" className="btn primary">Start a Gentle Check-in</a>
            <a href="/" className="btn secondary">Back to Home</a>
            <a href="/service" className="btn outline">Learn About Our Modules</a>
          </div>
        </div>
      </section>


    </div>
  );
};

export default HowItWorksNextPage;