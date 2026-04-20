import React, { useState, useEffect, useRef } from 'react';
import '../MainChatBot/ChatbotStyles.css';
import GeneralModule from '../modules/GeneralModule';
import AnxietyModule from '../modules/SpecializedModule/AnxietyModule';
import DepressionModule from '../modules/SpecializedModule/DepressionModule';
import BipolarModule from '../modules/SpecializedModule/BipolarModule';
import OCDModule from '../modules/SpecializedModule/OCDModule';
import PhobiasModule from '../modules/SpecializedModule/PhobiasModule';
import MoodTracker from '../MoodTacking/MoodTracker';
import ExercisePlayer from '../Exercises/ExercisePlayer';
import config from '/src/config.js';

const modules = {
  general: GeneralModule,
  anxiety: AnxietyModule,
  depression: DepressionModule,
  bipolar: BipolarModule,
  ocd: OCDModule,
  phobias: PhobiasModule,
};

const MainChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showExercise, setShowExercise] = useState(false);
  const [currentModule, setCurrentModule] = useState(null);
  const [popupMessage, setPopupMessage] = useState('');
  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const recognitionRef = useRef(null);
  const synth = window.speechSynthesis;
  const messagesEndRef = useRef(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const toggleListening = () => {
    setIsListening((prev) => !prev);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      const chunks = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${config.API_BASE_URL}/api/chat/voice`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
          });

          if (!res.ok) throw new Error('Voice API Error');
          const data = await res.json();
          setMessages(prev => [
            ...prev,
            { text: data.userText, sender: 'user' },
            { text: data.botText, sender: 'bot' }
          ]);
          
          if (!currentChatId && data.chatId) {
            setCurrentChatId(data.chatId);
            fetchChats();
          }
          speak(data.botText);
        } catch(err) {
          console.error(err);
        }
        
        stream.getTracks().forEach(track => track.stop());
      };

      setAudioChunks([]);
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied or error:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // ── MISSING FUNCTION ── Add this (was causing "handleBack is not defined")
  const handleBack = () => {
    setShowExercise(false);
    // Optional: reset module if you want
    // setCurrentModule(null);
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${config.API_BASE_URL}/api/chats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load chats');
      const data = await res.json();
      setChats(data);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const speak = (text) => {
    if (synth && text) {
      const utterance = new SpeechSynthesisUtterance(text);
      synth.speak(utterance);
    }
  };

  const handleSend = async (text = input) => {
    if (!text.trim()) return;

    const userMsg = { text, sender: 'user' };
    let currentMsgs = [...messages, userMsg];
    setInput('');

    let activeModule = currentModule || 'general';

    // Auto specialization detection
    if (activeModule === 'general') {
      const matched = checkForSpecialization(text.toLowerCase());
      if (matched) {
        setCurrentModule(matched);
        activeModule = matched;
        
        const switchMsg = {
          text: `Your symptoms match the ${matched} module. Switching to specialized support now.`,
          sender: 'bot',
        };
        currentMsgs = [...currentMsgs, switchMsg];
        
        setPopupMessage(`Now in ${matched.charAt(0).toUpperCase() + matched.slice(1)} Support`);
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 5000);
      }
    }

    setMessages([...currentMsgs]);

    try {
      const token = localStorage.getItem('token');
      const endpoint = activeModule === 'general' ? '/api/chat/general' : '/api/chat/specialized';
      
      const payload = {
        message: text,
        chatId: currentChatId === 0 ? null : currentChatId,
        module: activeModule,
        chatHistory: currentMsgs 
      };

      const res = await fetch(`${config.API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      
      const botResponseMsg = { text: data.response, sender: 'bot' };
      setMessages(prev => [...prev, botResponseMsg]);
      
      if (!currentChatId && data.chatId) {
        setCurrentChatId(data.chatId);
        fetchChats(); 
      }
      
      speak(data.response);
    } catch(e) {
      console.error(e);
      setMessages(prev => [...prev, { text: "I'm having trouble responding right now. Please try again.", sender: 'bot' }]);
    }
  };

  const checkForSpecialization = (text) => {
    const lowerText = text.toLowerCase();

    const anxietyKw = [
      'anxiety', 'anxious', 'worry', 'worried', 'nervous', 'panic', 'fear', 'restless', 'keyed up', 'on edge',
      'fatigued', 'tired easily', 'concentration', 'mind blank', 'irritable', 'muscle tension',
      'sleep disturbance', 'heart racing', 'sweating', 'trembling', 'hyperventilation'
    ];
    if (anxietyKw.some(kw => lowerText.includes(kw))) return 'anxiety';

    const depressionKw = [
      'depression', 'sad', 'depressed', 'hopeless', 'empty', 'tearful', 'no interest', 'anhedonia', 'pleasure',
      'tired', 'fatigue', 'energy low', 'worthless', 'guilt', 'concentration', 'appetite change',
      'weight change', 'insomnia', 'hypersomnia', 'psychomotor', 'suicidal', 'death thoughts'
    ];
    if (depressionKw.some(kw => lowerText.includes(kw))) return 'depression';

    const bipolarKw = [
      'bipolar', 'manic', 'hypomanic', 'elevated mood', 'expansive', 'irritable extreme', 'grandiosity',
      'inflated self', 'decreased sleep', 'need less sleep', 'talkative', 'pressure talk',
      'racing thoughts', 'flight ideas', 'distractible', 'goal directed', 'psychomotor agitation',
      'risky behavior', 'spending spree', 'sexual indiscretion'
    ];
    if (bipolarKw.some(kw => lowerText.includes(kw))) return 'bipolar';

    const ocdKw = [
      'ocd', 'obsession', 'intrusive thought', 'unwanted thought', 'urge', 'compulsion', 'ritual',
      'checking', 'cleaning', 'washing', 'hand wash', 'ordering', 'arranging', 'counting',
      'repeating', 'contamination', 'fear germ', 'doubt', 'symmetry', 'perfect'
    ];
    if (ocdKw.some(kw => lowerText.includes(kw))) return 'ocd';

    const phobiaKw = [
      'phobia', 'intense fear', 'fear of', 'terrified', 'avoid', 'panic', 'heights', 'flying',
      'spider', 'animal', 'blood', 'injection', 'enclosed', 'claustrophobia', 'public speaking',
      'social fear'
    ];
    if (phobiaKw.some(kw => lowerText.includes(kw))) return 'phobias';

    return null;
  };



  const deleteChat = async (id) => {
    if (!window.confirm('Delete this chat permanently?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${config.API_BASE_URL}/api/chats/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      
      const updatedChats = chats.filter((chat) => chat.id !== id);
      setChats(updatedChats);

      if (id === currentChatId) {
        setCurrentChatId(0);
        setMessages([]);
        setCurrentModule(null);
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
      alert('Failed to delete chat session.');
    }
  };

  const startNewChat = () => {
    setCurrentChatId(0);
    setMessages([]);
    setCurrentModule(null);
    setShowHistory(false);
    setShowMoodTracker(false);
    setShowExercise(false);
  };

  const loadChat = async (id) => {
    setShowHistory(false);
    setShowMoodTracker(false);
    setShowExercise(false);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${config.API_BASE_URL}/api/chats/${id}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load messages');
      const data = await res.json();
      
      const selectedChat = chats.find(c => c.id === id);
      setCurrentModule(selectedChat ? selectedChat.module : 'general');
      setCurrentChatId(id);
      
      if (data) {
        setMessages(data.map(m => ({ text: m.text, sender: m.sender })));
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to load chat messages:', error);
      setMessages([]);
    }
  };

  const CurrentModuleComponent = modules[currentModule] || GeneralModule; // fallback to GeneralModule

  return (
    <div className="chatbot-page">
      <div className="chat-main-container">
        <header className="chat-toolbar">
          <div className="toolbar-left">
            <button onClick={startNewChat} className="toolbar-btn primary">
              <i className="fas fa-plus-circle"></i> New Session
            </button>
            <button
              onClick={() => {
                setShowHistory(!showHistory);
                setShowMoodTracker(false);
                setShowExercise(false);
              }}
              className={`toolbar-btn ${showHistory ? 'active' : ''}`}
            >
              <i className="fas fa-history"></i> History
            </button>
          </div>

          <div className="toolbar-right">
            {currentModule && currentModule !== 'general' && (
              <>
                <button
                  className={`toolbar-btn ${showMoodTracker ? 'active' : ''}`}
                  onClick={() => {
                    setShowMoodTracker(true);
                    setShowExercise(false);
                    setShowHistory(false);
                  }}
                >
                  <i className="fas fa-chart-line"></i> Mood Tracker
                </button>
                <button
                  className={`toolbar-btn ${showExercise ? 'active' : ''}`}
                  onClick={() => {
                    setShowExercise(true);
                    setShowMoodTracker(false);
                    setShowHistory(false);
                  }}
                >
                  <i className="fas fa-video"></i> 3D Exercise
                </button>
              </>
            )}
          </div>
        </header>

        <div className="chat-body-wrapper">
          {showHistory ? (
            <div className="history-grid-container">
              <div className="history-header">
                <h2>Your Conversation History</h2>
                <p>Access and manage your previous sessions</p>
              </div>

              {chats.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-comment-slash"></i>
                  <p>No chat history yet. Start a new session above!</p>
                </div>
              ) : (
                <div className="history-cards-grid">
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`history-card-item ${chat.id === currentChatId ? 'active' : ''}`}
                      onClick={() => loadChat(chat.id)}
                    >
                      <div className="card-badge">
                        {chat.module ? chat.module.toUpperCase() : 'GENERAL'}
                      </div>
                      <div className="card-content">
                        <h3>Session #{chat.id}</h3>
                        <p className="last-msg">
                          {new Date(chat.created_at).toLocaleString()}
                        </p>
                      </div>
                      <button
                        className="card-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(chat.id);
                        }}
                      >
                        <i className="fas fa-times-circle"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="chat-interactive-area">
              {showPopup && <div className="module-status-pill">{popupMessage}</div>}

              {showMoodTracker ? (
                <div className="embedded-tool">
                  <MoodTracker onBack={() => setShowMoodTracker(false)} />
                </div>
              ) : showExercise ? (
                <div className="embedded-tool">
                  <ExercisePlayer selectedModule={currentModule} onBack={handleBack} />
                </div>
              ) : (
                <CurrentModuleComponent
                  messages={messages}
                  setMessages={setMessages}
                  input={input}
                  setInput={setInput}
                  handleSend={handleSend}
                  currentModule={currentModule}
                  isListening={isListening}
                  toggleListening={toggleListening}
                  startRecording={startRecording}
                  stopRecording={stopRecording}
                  isRecording={isRecording}
                />
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainChatbot;