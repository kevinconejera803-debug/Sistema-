(function() {
  'use strict';

  const messagesContainer = document.getElementById('chat-messages');
  const inputField = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send-btn');

  if (!messagesContainer || !inputField || !sendBtn) {
    return;
  }

  function addMessage(text, type) {
    const div = document.createElement('div');
    div.className = 'chat-message';
    if (type === 'user') {
      div.className += ' chat-message--user';
    } else if (type === 'ai') {
      div.className += ' chat-message--ai';
    } else if (type === 'error') {
      div.className += ' chat-message--error';
    } else if (type === 'loading') {
      div.className += ' chat-message--loading';
    } else if (type === 'insight') {
      div.className += ' chat-message--ai';
    }
    div.textContent = text;
    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function setLoading(loading) {
    sendBtn.disabled = loading;
    inputField.disabled = loading;
    sendBtn.textContent = loading ? '...' : 'Enviar';
  }

  async function loadProactiveInsights() {
    try {
      const response = await fetch('/api/assistant/insights');
      const data = await response.json();
      
      if (data.status === 'ok' && data.insights && data.insights.length > 0) {
        addMessage('💡 Sugerencias para ti:', 'insight');
        data.insights.forEach(function(insight) {
          addMessage(insight, 'ai');
        });
      }
    } catch (err) {
      console.log('No se pudieron cargar insights:', err.message);
    }
  }

  async function sendMessage() {
    const question = inputField.value.trim();
    if (!question) {
      return;
    }

    inputField.value = '';
    addMessage(question, 'user');
    addMessage('Pensando...', 'loading');
    setLoading(true);

    try {
      const response = await fetch('/api/research/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: question }),
      });

      const data = await response.json();

      messagesContainer.removeChild(messagesContainer.lastChild);

      if (data.error) {
        addMessage('Error: ' + data.error, 'error');
      } else if (data.answer) {
        addMessage(data.answer, 'ai');
      } else {
        addMessage('Sin respuesta', 'error');
      }
    } catch (err) {
      messagesContainer.removeChild(messagesContainer.lastChild);
      addMessage('Error de conexión: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  sendBtn.addEventListener('click', sendMessage);

  inputField.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  loadProactiveInsights();
})();