const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function testVoice() {
  try {
    const email = 'test' + Date.now() + '@example.com';
    await axios.post('http://localhost:5001/api/register', { name: 'Test', email, password: 'password', gender: 'male', age: 25 });
    const loginRes = await axios.post('http://localhost:5001/api/login', { email, password: 'password' });
    const token = loginRes.data.token;

    // Create a tiny valid webm audio mock if possible, or just a dummy text file to see
    // how Groq SDK reacts. 
    // Actually, Groq will return 'Audio file must be a valid audio file' if it's invalid.
    fs.writeFileSync('dummy.webm', 'RIFF...');
    
    const formData = new FormData();
    formData.append('audio', fs.createReadStream('dummy.webm'));

    const chatRes = await axios.post('http://localhost:5001/api/chat/voice', 
      formData, 
      { headers: { 
        ...formData.getHeaders(),
        Authorization: 'Bearer ' + token 
      } }
    );
    console.log('Voice Response:', chatRes.data);
  } catch (err) {
    if (err.response) {
      console.error('Error Response:', err.response.data);
    } else {
      console.error('Error:', err.message);
    }
  }
}
testVoice();
