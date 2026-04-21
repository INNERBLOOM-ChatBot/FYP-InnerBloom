const axios = require('axios');

async function test() {
  try {
    const email = 'test' + Date.now() + '@example.com';
    await axios.post('http://localhost:5001/api/register', { name: 'Test', email, password: 'password', gender: 'male', age: 25 });
    const loginRes = await axios.post('http://localhost:5001/api/login', { email, password: 'password' });
    const token = loginRes.data.token;
    
    // Simulate what frontend sends
    const message = 'Hello';
    const chatHistory = [ { text: message, sender: 'user' } ];

    const chatRes = await axios.post('http://localhost:5001/api/chat/general', 
      { message, chatHistory }, 
      { headers: { Authorization: 'Bearer ' + token } }
    );
    console.log('Chat Response:', chatRes.data);
  } catch (err) {
    if (err.response) {
      console.error('Error Response:', err.response.data);
    } else {
      console.error('Error:', err.message);
    }
  }
}
test();
