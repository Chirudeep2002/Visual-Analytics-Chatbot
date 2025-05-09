const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const voiceBtn = document.getElementById('voice-btn');
const roleSelect = document.getElementById('role-select');
const typingIndicator = document.getElementById('typing-indicator');
const fileUpload = document.getElementById('file-upload');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const messagesCount = document.getElementById('messages-count');
const uploadsCount = document.getElementById('uploads-count');

let messageCounter = 0;
let uploadCounter = 0;
let myChart;

window.onload = () => {
  addBotMessage('👋 Welcome to the Visual Chatbot!');
};

sendBtn.onclick = () => sendMessage();
voiceBtn.onclick = () => startVoiceRecognition();

darkModeToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark-mode');
});

fileUpload.addEventListener('change', async () => {
  const file = fileUpload.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('file', file);
  await fetch('/upload', { method: 'POST', body: formData });
  uploadCounter++;
  updateAnalytics();
  addBotMessage(`📂 File uploaded: ${file.name}`);
});

async function sendMessage() {
  if (!roleSelect.value) {
    addBotMessage('❗ Please select your role first.');
    return;
  }
  const message = userInput.value.trim();
  if (message) {
    addUserMessage(message);
    userInput.value = '';
    await queryBot(message);
  }
}

async function queryBot(message) {
  typingIndicator.style.display = 'block';
  const role = roleSelect.value;
  const res = await fetch('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, message })
  });
  const data = await res.json();
  typingIndicator.style.display = 'none';
  addBotMessage(data.reply);
  speakBotReply(data.reply);
}

function addUserMessage(text) {
  const messageDiv = createMessage('You', text, 'user-message');
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
  messageCounter++;
  updateAnalytics();
}

function addBotMessage(text) {
  const messageDiv = createMessage('Bot', text, 'bot-message');
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function createMessage(sender, text, styleClass) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', styleClass);
  messageDiv.innerHTML = `<strong>${sender}:</strong> ${text}<div class="timestamp">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>`;
  return messageDiv;
}

function startVoiceRecognition() {
  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'en-US';
  recognition.start();
  recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    addUserMessage(transcript);
    await queryBot(transcript);
  };
}

function speakBotReply(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  speechSynthesis.speak(utterance);
}

function updateAnalytics() {
  messagesCount.innerText = messageCounter;
  uploadsCount.innerText = uploadCounter;
  if (!myChart) createChart();
  else myChart.data.datasets[0].data = [messageCounter, uploadCounter];
  myChart.update();
}

function createChart() {
  const ctx = document.getElementById('analytics-chart').getContext('2d');
  myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Messages', 'Uploads'],
      datasets: [{
        label: 'Activity',
        data: [messageCounter, uploadCounter],
        backgroundColor: ['#6a11cb', '#2575fc']
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}
