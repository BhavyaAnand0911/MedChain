import React from "react";
import "./Landing.css";
import { Link } from "react-router-dom";
import doctorIllustration from "../images/doctor.jpg";
import blockchainIcon from "../images/secure.png";
import aiIcon from "../images/ai.png";
import predictionIcon from "../images/prediction.png";

const Landing = () => {
  return (
    <div className="landing-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1>
            Revolutionizing Healthcare with <span>MedChain</span>
          </h1>
          <p className="subtitle">
            Secure, decentralized medical records powered by blockchain and
            AI-driven health insights
          </p>
          <div className="cta-buttons">
            <Link to="/login" className="cta-button primary">
              Get Started
            </Link>
            <Link to="/signup" className="cta-button secondary">
              Learn More
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <img
            src={doctorIllustration}
            alt="Doctor using digital healthcare platform"
            className="hero-img"
          />
        </div>
      </div>

      <div className="wave-divider">
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="shape-fill"
          ></path>
        </svg>
      </div>

      <section className="features-section">
        <div className="features-container">
          <h2>Why Choose MedChain?</h2>
          <p className="section-subtitle">
            Innovative healthcare solutions at your fingertips
          </p>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <img src={blockchainIcon} alt="Blockchain" />
              </div>
              <h3>Blockchain Security</h3>
              <p>
                Immutable, tamper-proof medical records stored on decentralized
                blockchain technology
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <img src={aiIcon} alt="AI Chatbot" />
              </div>
              <h3>AI Health Assistant</h3>
              <p>
                24/7 access to our intelligent medical chatbot for instant health
                guidance
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <img src={predictionIcon} alt="Disease Prediction" />
              </div>
              <h3>Predictive Analytics</h3>
              <p>
                Early detection of potential health issues through advanced
                symptom analysis
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number" data-count="10000">250+</div>
            <p>Medical Records Secured</p>
          </div>
          <div className="stat-item">
            <div className="stat-number" data-count="98">85%</div>
            <p>User Satisfaction</p>
          </div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <p>AI Assistance</p>
          </div>
        </div>
      </section>

      <section className="testimonial-section">
        <div className="testimonial-container">
          <h2>What Our Users Say</h2>
          <div className="testimonial-card">
            <div className="testimonial-content">
              "MedChain has transformed how I manage my family's health records.
              The AI assistant caught early warning signs that even my doctor missed!"
            </div>
            <div className="testimonial-author">
              <div className="author-avatar"></div>
              <div className="author-info">
                <h4>Bhavya Anand</h4>
                <p>Patient since 2025</p>
              </div>
            </div>Johnson
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="cta-container">
          <h2>Ready to Experience the Future of Healthcare?</h2>
          <p className="cta-subtitle">
            Join thousands of users who trust MedChain with their health data
          </p>
          <Link to="/signup" className="cta-button primary large">
            Join MedChain Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;