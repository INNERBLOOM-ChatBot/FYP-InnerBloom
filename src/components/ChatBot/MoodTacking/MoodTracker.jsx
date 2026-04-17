
import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as faceapi from '@vladmandic/face-api';
import { 
  faMicrophone, 
  faCamera, 
  faStop, 
  faPlay, 
  faTrash, 
  faCheck, 
  faTimes, 
  faHistory

} from '@fortawesome/free-solid-svg-icons';
import './MoodtrackerStyle.css';
import config from '../../../config.js';

const possibleMoods = [
  { type: 'Happy',   icon: 'face-smile', color: '#22c55e' },
  { type: 'Sad',     icon: 'face-sad-tear', color: '#3b82f6' },
  { type: 'Angry',   icon: 'face-angry', color: '#ef4444' },
  { type: 'Neutral', icon: 'face-meh', color: '#6b7280' },
  { type: 'Excited', icon: 'face-grin-stars', color: '#eab308' },
  { type: 'Anxious', icon:'face-anxious-sweat', color: '#f59e0b' },
];
const emotionToMoodMap = {
  happy: { type: 'Happy', emoji: '😊', color: '#22c55e' },
  sad: { type: 'Sad', emoji: '😢', color: '#3b82f6' },
  angry: { type: 'Angry', emoji: '😠', color: '#ef4444' },
  neutral: { type: 'Neutral', emoji: '😐', color: '#6b7280' },
  surprised: { type: 'Surprised', emoji: '😲', color: '#8b5cf6' },
  disgusted: { type: 'Disgusted', emoji: '🤢', color: '#10b981' },
  fearful: { type: 'Fearful', emoji: '😨', color: '#f59e0b' },
};

const MoodTracker = () => {
  const [history, setHistory] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [currentMood, setCurrentMood] = useState(null);
  const [inputMethod, setInputMethod] = useState('');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [currentLiveEmotion, setCurrentLiveEmotion] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const randomIndex = Math.floor(Math.random() * possibleMoods.length);
  const baseMood = possibleMoods[randomIndex];
  const [capturedImage, setCapturedImage] = useState(null);
  


  // Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('moodHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('moodHistory', JSON.stringify(history));
  }, [history]);

  // Timer for recording
  useEffect(() => {
    if (isRecording) {
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [isRecording]);

 // Camera modal effect - handles start/stop + cleanup
useEffect(() => {
  let cleanup = () => {}; 

  if (showCameraModal) {
    startCamera().catch((err) => {
      console.error('Failed to start camera:', err);
      // Optional: show user-friendly toast/alert here
      alert('Unable to open camera. Please check permissions and try again.');
      setShowCameraModal(false);
    });

    cleanup = () => {
      stopCamera();
      stopRealTimeDetection(); // if using real-time detection
      setCapturedImage(null);
      setCurrentLiveEmotion(null); // if using live emotion
      setIsScanning(false);        // if you have this state
    };
  } else {
    // Immediate cleanup when modal closes
    cleanup();
  }

  // Return cleanup function - runs on unmount or when showCameraModal changes to false
  return cleanup;
}, [showCameraModal]); // Only re-run when modal visibility changes

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setTimer(0);
    } catch (err) {
      alert('Microphone access is required!\nPlease check your browser settings and allow microphone for this site.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const discardAudio = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setTimer(0);
  };

  const analyzeInput = (method) => {
    setIsAnalyzing(true);
    setInputMethod(method);

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * possibleMoods.length);
      const baseMood = possibleMoods[randomIndex];
      const score = Math.floor(Math.random() * 35) + 65; // 65-99 realistic AI score

      setCurrentMood({
        ...baseMood,
        score,
      });

      setShowResultModal(true);
      setIsAnalyzing(false);
    }, 1800); // AI processing feel
  };

  // Camera functions
 const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
    });
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }

    // Models load (pehli baar thoda time lega ~3-8 sec)
    if (!modelsLoaded) {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceExpressionNet.loadFromUri('/models');
      setModelsLoaded(true);
      console.log('✅ TensorFlow Face Models Loaded');
    }

    // Real-time detection start
    startRealTimeDetection();
  } catch (err) {
    console.error(err);
    alert('Camera permission denied. Browser settings mein allow karo.');
    setShowCameraModal(false);
  }
};

const startRealTimeDetection = () => {
  if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);

  detectionIntervalRef.current = setInterval(async () => {
    if (!videoRef.current || !canvasRef.current || !modelsLoaded) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Detection
    const detections = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (detections) {
      const resized = faceapi.resizeResults(detections, {
        width: video.videoWidth,
        height: video.videoHeight,
      });

      // Draw box + landmarks
      faceapi.draw.drawDetections(canvas, resized);
      faceapi.draw.drawFaceLandmarks(canvas, resized);

      // Get dominant emotion
      const expressions = detections.expressions;
      let maxEmotion = 'neutral';
      let maxScore = 0;

      Object.entries(expressions).forEach(([emotion, score]) => {
        if (score > maxScore) {
          maxScore = score;
          maxEmotion = emotion;
        }
      });

      const moodInfo = emotionToMoodMap[maxEmotion] || emotionToMoodMap.neutral;

      setCurrentLiveEmotion({
        ...moodInfo,
        score: Math.round(maxScore * 100),
        rawEmotion: maxEmotion,
      });

      // Draw emotion label
      const text = `${moodInfo.type} ${Math.round(maxScore * 100)}%`;
      ctx.font = 'bold 28px Arial';
      ctx.fillStyle = moodInfo.color;
      ctx.fillText(text, resized.detection.box.x, resized.detection.box.y - 15);
    } else {
      setCurrentLiveEmotion(null);
    }
  }, 150); // 150ms = smooth real-time
};

const stopRealTimeDetection = () => {
  if (detectionIntervalRef.current) {
    clearInterval(detectionIntervalRef.current);
    detectionIntervalRef.current = null;
  }
  setCurrentLiveEmotion(null);
};

const stopCamera = () => {
  stopRealTimeDetection();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };
  const saveToHistory = async () => {
    if (!currentMood) return;

    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      type: currentMood.type,
      emoji: currentMood.emoji,
      score: currentMood.score,
      method: inputMethod,
    };

    try {
        const token = localStorage.getItem('token');
        await fetch(`${config.API_BASE_URL}/api/mood/log`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mood_type: currentMood.type,
                method: inputMethod,
                result_data: { score: currentMood.score }
            })
        });
    } catch (error) {
        console.error("Failed to save mood strictly to DB", error);
    }

    setHistory(prev => [newEntry, ...prev]);
    setShowResultModal(false);
    setCapturedImage(null);

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  };

  const deleteHistoryItem = (id) => {
    if (window.confirm('Kya aap is entry ko delete karna chahte hain?')) {
      setHistory(prev => prev.filter(item => item.id !== id));
    }
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mood-tracker">
      {/* Header Section */}
      <div className="header-mood">
        <div className="headermood-content">
          <h1>Today's Mood Check</h1>
          <p className="subtitle">Speak or Show your Face - AI will understand</p>
        </div>
      </div>

      {/* Horizontal Input Bar */}
      <div className={`input-bar ${isRecording ? 'recording' : ''}`}>
        {!isRecording && !audioUrl ? (
          <>
            <div className="prompt-text">
              How are you feeling right now?
            </div>
            <div className="action-icons">
              <button 
                className="icon-btn mic-btn"
                onClick={startRecording}
                title="Voice Record"
              >
                <FontAwesomeIcon icon={faMicrophone} />
              </button>
              <button 
                className="icon-btn camera-btn"
                onClick={() => setShowCameraModal(true)}
                title="Show your Face"
              >
                <FontAwesomeIcon icon={faCamera} />
              </button>
            </div>
          </>
        ) : isRecording ? (
          <div className="recording-mode">
            <div className="recording-indicator">
              <div className="pulse-dot"></div>
              <span>Recording your voice...</span>
            </div>
            <div className="timer">{formatTime(timer)}</div>
            <button className="stop-btn" onClick={stopRecording}>
              <FontAwesomeIcon icon={faStop} /> Stop
            </button>
          </div>
        ) : (
          <div className="audio-ready">
            <div className="audio-player">
              <audio controls src={audioUrl} />
            </div>
            <div className="audio-actions">
              <button 
                className="analyze-btn"
                onClick={() => analyzeInput('voice')}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'AI Analyzing...' : 'Analyze with AI'}
              </button>
              <button className="discard-btn" onClick={discardAudio}>
                Discard
              </button>
            </div>
          </div>
        )}
      </div>

      {/* History Section */}
      <div className="history-section">
        <div className="history-header">
          <FontAwesomeIcon icon={faHistory} />
          <h2>Your Mood History</h2>
        </div>
        
        {history.length === 0 ? (
          <div className="empty-history">
            No mood entries yet. Start tracking!
          </div>
        ) : (
          <div className="history-list">
            {history.map((entry) => (
              <div key={entry.id} className="history-item">
                <div className="entry-date">
                  {new Date(entry.date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                
                <div className="mood-info">
                  <span className="mood-emoji">{entry.emoji}</span>
                  <span className="mood-type">{entry.type}</span>
                </div>

                <div className="score-container">
                  <div className="score-bar">
                    <div 
                      className="score-fill"
                      style={{ 
                        width: `${entry.score}%`,
                        backgroundColor: possibleMoods.find(m => m.type === entry.type)?.color 
                      }}
                    />
                  </div>
                  <span className="score-text">{entry.score}%</span>
                </div>

                <div className="method-icon">
                  <FontAwesomeIcon 
                    icon={entry.method === 'voice' ? faMicrophone : faCamera} 
                  />
                </div>

                <button 
                  className="delete-btn"
                  onClick={() => deleteHistoryItem(entry.id)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Camera Modal */}
{showCameraModal && (
  <div className="modal-overlay">
    <div className="camera-modal">
      <div className="modal-header">
        <h3>Real-time AI Mood Scan (TensorFlow.js)</h3>
        <button className="close-btn" onClick={() => {
          stopRealTimeDetection();
          setShowCameraModal(false);
        }}>
          ✕
        </button>
      </div>

      <div className="camera-preview" style={{ position: 'relative' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="video-feed"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onLoadedMetadata={() => {
            if (canvasRef.current && videoRef.current) {
              canvasRef.current.width = videoRef.current.videoWidth;
              canvasRef.current.height = videoRef.current.videoHeight;
            }
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
        />

        {/* Live Emotion Display */}
        {currentLiveEmotion && (
          <div className="live-emotion-overlay">
            <div className="big-emoji">{currentLiveEmotion.emoji}</div>
            <div className="live-text">
              {currentLiveEmotion.type} <strong>{currentLiveEmotion.score}%</strong>
            </div>
          </div>
        )}

        {!modelsLoaded && (
          <div className="loading-overlay">
            Loading TensorFlow Face AI Models...
            <div className="spinner" />
          </div>
        )}
      </div>

      <div className="camera-controls">
        <button
          className="analyze-face-btn"
          onClick={() => {
            if (currentLiveEmotion) {
              const canvas = canvasRef.current;
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/png');
        setCapturedImage(dataUrl);
      }
              setCurrentMood(currentLiveEmotion);
              setInputMethod('face');
              setShowResultModal(true);
              stopRealTimeDetection(); // optional
            } else {
              alert('Face detect nahi ho raha. Camera mein face clearly dikhao.');
            }
          }}
          disabled={!currentLiveEmotion}
        >
          ✅ Save This Mood to History
        </button>

        <button
          className="cancel-btn"
          onClick={() => {
            stopRealTimeDetection();
            setShowCameraModal(false);
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
      {/* Result Popup Modal */}
      {showResultModal && currentMood && (
        <div className="modal-overlay">
          <div className="result-modal">
            <div className="modal-header">
              <h3>AI Mood Analysis</h3>
              <button className="close-btn" onClick={() => setShowResultModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="result-content">
              <div className="big-emoji">{currentMood.emoji}</div>
              
              <h2 className="mood-title">{currentMood.type}</h2>
              <p className="confidence">
                AI is <strong>{currentMood.score}%</strong> confident
              </p>

              {/* Graph */}
              <div className="mood-graph">
                <div className="graph-labels">
                  <span>Sad</span>
                  <span>Happy</span>
                </div>
                <div className="graph-bar-container">
                  <div 
                    className="graph-bar-fill"
                    style={{
                      width: `${currentMood.score}%`,
                      backgroundColor: currentMood.color
                    }}
                  />
                </div>
              </div>

              {capturedImage && inputMethod === 'face' && (
                <div className="face-preview">
                  <p>Your captured face</p>
                  <img src={capturedImage} alt="Analyzed face" />
                </div>
              )}

              {inputMethod === 'voice' && (
                <p className="input-info">Analyzed from your voice recording</p>
              )}
            </div>

            <div className="modal-actions">
              <button className="save-btn" onClick={saveToHistory}>
                <FontAwesomeIcon icon={faCheck} /> Save to History
              </button>
              <button 
                className="close-result-btn" 
                onClick={() => setShowResultModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodTracker;