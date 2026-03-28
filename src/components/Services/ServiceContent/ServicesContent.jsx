import React from 'react';
import './ServicesContentStyle.css';
import UsinganAIBot from "../../../assets/images/UsinganAIBot.jpg";
import exercise from "../../../assets/images/exercise.avif";
import mooddetection from "../../../assets/images/mooddetection.webp";

const ServicesContent = () => {
  return (
    <>
    <div className="services-page">
      {/* ── GENERAL MODULE ── */}
      <section className="module-section general-module">
        <div className="container module-container reverse">
          <div className="module-image-wrapper">
            <img
              src={UsinganAIBot}
              alt="General pic"
              className="floating-module-image"
            />
          </div>
          <div className="module-text">
            <h2 className="module-title">General Module</h2>
            <p className="module-overview">
              The foundation of InnerBloom — your compassionate first point of contact.
            </p>
             <ul className="module-features">
              <li>Allows users to communicate through text or voice in a natural way</li>
              <li>Understands user feelings during conversations and responds accordingly</li>
              <li>Provides guidance based on well-known mental wellness practices</li>
              <li>Offers supportive conversations, helpful tips, and simple exercises to manage emotions</li>
              <li>Remembers the context of the conversation to give more relevant and connected responses</li>
            </ul>
            <p className="module-benefits">
              <strong>Best for:</strong> Everyday stress, uncertainty, or stigma-free starting point — available 24/7.
            </p>
          </div>
        </div>
      </section>

      {/* ── SPECIALIZED MODULES ── */}
      <section className="specialized-section">
        <div className="sectioncontent">
          <h2 className="section-heading">Specialized Modules</h2>
          <p className="section-subheading">
            Targeted second-tier support activated when symptoms match specific conditions (70%+ confidence).
            Each module uses CBT protocols, journaling prompts, and personalized tasks.
          </p>
          </div>
        <div className="container">
          <div className="specialized-layout">
            <div className="specialized-text">
              <h3>When needed, InnerBloom intelligently guides you to:</h3>
            </div>
         
            <div className="cards-grid">
              <div className="specialized-card anxiety">
                <h4>Anxiety</h4>
                <p className="text">
              Designed for those experiencing worry, panic, or restlessness.
            </p>
            <div className="points">
              <p>• Panic attack management techniques</p>
              <p>• Grounding exercises (5-4-3-2-1)</p>
              <p>• Thought challenging & reframing</p>
              <p>• Gradual exposure to triggers</p>
            </div>
            <div className="helpline">
              <p className="helptext">
                Helps build resilience against anxiety spikes, promoting calmer daily living.
              </p>
            </div>
               </div>

              <div className="specialized-card depression">
                <h4>Depression</h4>
                <p className="text">
              Tailored for low mood, lack of motivation, or persistent sadness.
            </p>
            <div className="points">
              <p>• Behavioral activation strategies</p>
              <p>• Cognitive restructuring exercises</p>
              <p>• Mood-boosting journaling prompts</p>
              <p>• Progress tracking & celebration</p>
            </div>
            <div className="helpline">
              <p className="helptext">
                Encourages gradual steps toward renewed energy and positive outlook.
              </p>
            </div>
              </div>

              <div className="specialized-card ocd">
                <h4>OCD</h4>
                <p className="text">
              Supports obsessive thoughts and compulsive behaviors.
            </p>
            <div className="points">
              <p>• Exposure & response prevention</p>
              <p>• Thought challenging exercises</p>
              <p>• Compulsion delay techniques</p>
              <p>• Habit tracking & mindfulness</p>
            </div>
            <div className="helpline">
              <p className="helptext">
                Empowers users to regain control and reduce ritualistic patterns over time.
              </p>
            </div>
              </div>

              <div className="specialized-card bipolar">
                <h4>Bipolar</h4>
              <p className="text">
              Aimed at mood swings, mania, or depressive episodes.
            </p>
            <div className="points">
              <p>• Mood stabilization strategies</p>
              <p>• Early warning sign identification</p>
              <p>• Balanced routine planning</p>
              <p>• High & low phase coping tools</p>
            </div>
            <div className="helpline">
              <p className="helptext">
                Promotes stability and proactive management of mood fluctuations.
              </p>
            </div>
              </div>

              <div className="specialized-card phobia">
                <h4>Phobias</h4>
                <p className="text">
              For fear-based avoidance of specific triggers.
            </p>
            <div className="points">
              <p>• Systematic desensitization</p>
              <p>• Virtual exposure exercises</p>
              <p>• Hierarchy-based challenges</p>
              <p>• Post-exposure relaxation</p>
            </div>
            <div className="helpline">
              <p className="helptext">
                Gradually reduces fear responses, fostering confidence in facing phobias.
              </p>
            </div>
              </div>
            </div>
          </div>
        </div>
      </section>
     </div>
      {/* ── 3D EXERCISES ── */}
      <section className="module-section exercises-module">
        <div className="container module-container">
          <div className="module-image-wrapper">
            <img
              src={exercise}
              alt="3D wellness exercises"
              className="floating-module-image"
            />
          </div>

          <div className="module-text">
            <h2 className="module-title">Interactive 3D Exercises</h2>
            <p className="module-overview">
              Immersive animations that make self-care visual and engaging.
            </p>
            <ul className="module-features">
              <li>Personalized breathing, relaxation & mindfulness videos</li>
              <li>Tailored to your active module (grounding / energizing / calming)</li>
              <li>Step-by-step voice-guided sessions</li>
              <li>Progressive muscle relaxation, yoga poses & gentle stretches</li>
            </ul>
            <p className="module-benefits">
              <strong>Benefit:</strong> Turns abstract techniques into actionable visual steps — improves adherence significantly.
            </p>
          </div>
        </div>
      </section>

      {/* ── MOOD DETECTION ── */}
      <section className="module-section mood-module">
        <div className="container module-container reverse">
          <div className="module-image-wrapper">
            <img
              src={mooddetection}
              alt="Mood Detection"
              className="floating-module-image"
            />
          </div>
          <div className="module-text">
            <h2 className="module-title">Mood Detection & Insights</h2>
            <p className="module-overview">
              Always knows how you're feeling — across every interaction.
            </p>
            <ul className="module-features">
              <li>Quick mood check-in after login or module entry</li>
              <li>Daily logging → weekly/monthly trend graphs</li>
              <li>Sentiment analysis refines responses & suggestions</li>
              <li>Insight messages (e.g. "Energy improved 20% this week")</li>
            </ul>
            <p className="module-benefits">
              <strong>Benefit:</strong> Proactive pattern recognition to prevent escalations and celebrate progress.
            </p>
          </div>
        </div>
      </section>

      {/* Ready to begin  */}
      <section class="ready-section">
        <div class="ready-container">
            <div class="ready-card">
                <h2 class="ready-title">Ready to Begin Your Journey?</h2>
                <p class="ready-description">
                    Start with our General Module today and discover personalized support that adapts to your needs.
                </p>
                <button class="ready-button">
                  <a href="/signup">
                  Get Started Now</a>
                  </button>
            </div>
        </div>
    </section>
   </>
  );
};

export default ServicesContent;