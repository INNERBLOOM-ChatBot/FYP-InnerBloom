import React from 'react';
import './ContentAboutStyle.css';
import about1 from "../../../assets/images/about1.webp";
import about2 from "../../../assets/images/about2.jpg";
import about3 from "../../../assets/images/about3.jfif";

import { FaHeart, FaLightbulb, FaShieldAlt, FaGlobe } from 'react-icons/fa';

const ContentAbout = (props) => {  
  return (
    <>
     

    {/* Main Content Container */}
      <div className="aboutcontent-container">
       {/* Our Story */}
        <div className="about-card story-card">
          <h2>Our Story</h2>
          <p>
            InnerBloom is free 
          </p>
          <p>
            Inspired by real-world hospital referral systems, InnerBloom combines cutting-edge AI with evidence-based therapies to offer scalable, stigma-free support. We aim to make mental health care inclusive, engaging, and effective for everyone.
      </p>
      </div>
      
      {/* Our Mission */}
        <div className="about-card mission-card">
          <h2>Our Mission</h2>
          <p>
            Our mission is to break barriers around mental health by making support available to anyone, anytime. InnerBloom aims to reduce stigma and offer a trusted space for emotional support and self-reflection.
          </p>
        </div>

        {/* Why We Stand Out */}
        <div className="about-card standout-card">
          <h2>Why We Stand Out</h2>
          <p>
            Unlike generic chatbots, InnerBloom features intelligent routing, condition-specific treatment, and high-quality 3D exercises. 
          </p>
          <p>
          We're committed to open-source principles for community contributions, multilingual accessibility, and compliance with global privacy standards like HIPAA equivalents.
          </p>
        </div>

        {/* Our Values - Icon Grid */}
        <div className="values-grid">
          <h2>Our Values</h2>
          <div className="values-cards">
            <div className="value-card">
              <FaHeart className="value-icon" />
              <h3>Empathy</h3>
              <p>Non-judgmental, supportive interactions.</p>
            </div>
            <div className="value-card">
              <FaLightbulb className="value-icon" />
              <h3>Innovation</h3>
              <p>Continuously improve to deliver a better experience for our users.</p>
            </div>
            <div className="value-card">
              <FaShieldAlt className="value-icon" />
              <h3>Integrity</h3>
              <p>We are transparent, honest, and committed to responsible use of AI.
</p>
            </div>
            <div className="value-card">
              <FaGlobe className="value-icon" />
              <h3>Inclusivity</h3>
              <p>Support for diverse languages and user needs.</p>
            </div>
          </div>
        </div>

        {/* Visual Inspirations */}
        <div className="visual-gallery">
          <h3>Our Vision in Action</h3>
          <div className="gallery-grid">
            <img src={about1} alt="Through Text" className="gallery-img" />
            <img src={about2} alt="Through voice" className="gallery-img" />
            <img src={about3} alt="Through mood track" className="gallery-img" />
          </div>
        </div>

      </div>
    
    </>
  );
};

export default ContentAbout;