import React from 'react';
import '../modules/GeneralModulestyle.css'
const startVoiceInput = () => {console.log("Voice input started");};
const GeneralModule =
 ({ messages, setMessages, input, setInput, handleSend,startRecording, stopRecording , isRecording}) => {
  console.log("GeneralModule rendered", { handleSend: !!handleSend });

  const testSend = () => {
    console.log("Send button clicked! handleSend exists?", !!handleSend);
    if (handleSend) handleSend();
  };

  const stopVoiceInput =() =>{
    if (recognition) {
      recognition.stop();
      console.log("Voice input stopped");
    }
  };
  return (
    <>
    <div className='chat-body'>
      <div className="messages-wrapper general-messages">
        {messages.length === 0 ? (
          <div className="welcome">Welcome to InnerBloom <br />Feel free to share your feelings-your voice truly matters....</div>
        ) : (
          <div className="messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="input-area">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSend()}
          placeholder="Text or voice your message..."
        />
        <button onClick={testSend} title="Send" className="send-btn">
      <i className="fas fa-paper-plane"></i>
    </button>
    <button type="button"
      onMouseDown={startRecording}
      onMouseUp={stopRecording}
      onTouchStart={startRecording}
      onTouchEnd={stopRecording}
   className={`voice-btn ${isRecording ? 'recording' : ''}`}
  title={isRecording ? 'Release to send' : 'Hold to speak'}>
  {isRecording ? (
  <i className="fa-solid fa-square" style={{ color: '#ff4444' }}></i>
  ) : (
  <i className="fa-solid fa-microphone"></i>
  )}
</button>
  </div>
  </div>
    </>
  );
};

export default GeneralModule;