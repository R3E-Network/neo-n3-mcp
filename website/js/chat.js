/**
 * Neo N3 MCP Chat Interface JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const sendButton = document.getElementById('send-button');
  const chatMessages = document.getElementById('chat-messages');
  const apiKeyInput = document.getElementById('openroute-api-key');
  const apiKeyNotice = document.getElementById('api-key-notice');
  const toggleApiKey = document.getElementById('toggle-api-key');
  const modelSelect = document.getElementById('model-select');
  const temperatureSlider = document.getElementById('temperature-slider');
  const temperatureValue = document.getElementById('temperature-value');
  const streamToggle = document.getElementById('stream-toggle');
  const newChatButton = document.getElementById('new-chat');
  const clearHistoryButton = document.getElementById('clear-history');
  
  // State variables
  let messages = [];
  let isWaitingForResponse = false;
  let currentStreamingMessageElement = null;
  
  // Initialize the chat
  init();
  
  /**
   * Initialize the chat interface
   */
  function init() {
    // Load API key from localStorage
    const savedApiKey = localStorage.getItem('openroute_api_key');
    if (savedApiKey) {
      apiKeyInput.value = savedApiKey;
      enableChat();
    }
    
    // Load preferences from localStorage
    const savedModel = localStorage.getItem('chat_model');
    if (savedModel) {
      modelSelect.value = savedModel;
    }
    
    const savedTemperature = localStorage.getItem('chat_temperature');
    if (savedTemperature) {
      temperatureSlider.value = savedTemperature;
      temperatureValue.textContent = savedTemperature;
    }
    
    const isStreamEnabled = localStorage.getItem('chat_stream');
    if (isStreamEnabled !== null) {
      streamToggle.checked = isStreamEnabled === 'true';
    }
    
    // Load chat history from localStorage
    loadChatHistory();
    
    // Setup event listeners
    setupEventListeners();
    
    // Auto-focus input if API key is set
    if (savedApiKey) {
      chatInput.focus();
    }
  }
  
  /**
   * Setup event listeners
   */
  function setupEventListeners() {
    // API key input
    apiKeyInput.addEventListener('input', handleApiKeyChange);
    
    // Toggle API key visibility
    toggleApiKey.addEventListener('click', toggleApiKeyVisibility);
    
    // Temperature slider
    temperatureSlider.addEventListener('input', handleTemperatureChange);
    
    // Model select
    modelSelect.addEventListener('change', handleModelChange);
    
    // Stream toggle
    streamToggle.addEventListener('change', handleStreamToggle);
    
    // Chat form submission
    chatForm.addEventListener('submit', handleChatSubmit);
    
    // Auto-resize textarea
    chatInput.addEventListener('input', autoResizeTextarea);
    
    // New chat button
    newChatButton.addEventListener('click', startNewChat);
    
    // Clear history button
    clearHistoryButton.addEventListener('click', clearChatHistory);
  }
  
  /**
   * Handle API key change
   */
  function handleApiKeyChange() {
    const apiKey = apiKeyInput.value.trim();
    localStorage.setItem('openroute_api_key', apiKey);
    
    if (apiKey) {
      enableChat();
    } else {
      disableChat();
    }
  }
  
  /**
   * Toggle API key visibility
   */
  function toggleApiKeyVisibility() {
    const type = apiKeyInput.type === 'password' ? 'text' : 'password';
    apiKeyInput.type = type;
    
    const icon = toggleApiKey.querySelector('i');
    if (type === 'text') {
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    } else {
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    }
  }
  
  /**
   * Handle temperature change
   */
  function handleTemperatureChange() {
    const value = temperatureSlider.value;
    temperatureValue.textContent = value;
    localStorage.setItem('chat_temperature', value);
  }
  
  /**
   * Handle model change
   */
  function handleModelChange() {
    const model = modelSelect.value;
    localStorage.setItem('chat_model', model);
  }
  
  /**
   * Handle stream toggle change
   */
  function handleStreamToggle() {
    const isStreamEnabled = streamToggle.checked;
    localStorage.setItem('chat_stream', isStreamEnabled);
  }
  
  /**
   * Enable chat interface
   */
  function enableChat() {
    chatInput.disabled = false;
    sendButton.disabled = false;
    apiKeyNotice.style.display = 'none';
    chatInput.placeholder = "Type your message here...";
    chatInput.focus();
  }
  
  /**
   * Disable chat interface
   */
  function disableChat() {
    chatInput.disabled = true;
    sendButton.disabled = true;
    apiKeyNotice.style.display = 'flex';
  }
  
  /**
   * Auto-resize textarea
   */
  function autoResizeTextarea() {
    chatInput.style.height = 'auto';
    chatInput.style.height = (chatInput.scrollHeight) + 'px';
  }
  
  /**
   * Handle chat form submission
   */
  async function handleChatSubmit(e) {
    e.preventDefault();
    
    const messageText = chatInput.value.trim();
    if (!messageText || isWaitingForResponse) return;
    
    // Add user message to chat
    addMessage('user', messageText);
    
    // Clear input
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    // Send message to API
    await sendMessageToApi(messageText);
  }
  
  /**
   * Add a message to the chat
   */
  function addMessage(role, content, model = '') {
    // Create message object
    const message = {
      role,
      content,
      timestamp: new Date().toISOString(),
      model
    };
    
    // Add to messages array
    messages.push(message);
    
    // Save to localStorage
    saveChatHistory();
    
    // Create message element
    const messageElement = createMessageElement(message);
    
    // Add to chat
    chatMessages.appendChild(messageElement);
    
    // Scroll to bottom
    scrollToBottom();
    
    return messageElement;
  }
  
  /**
   * Create a message element
   */
  function createMessageElement(message) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.role}-message`;
    
    // For assistant and user messages, add an avatar
    if (message.role !== 'system') {
      const avatarElement = document.createElement('div');
      avatarElement.className = `message-avatar ${message.role}-avatar`;
      
      const avatarIcon = document.createElement('i');
      if (message.role === 'user') {
        avatarIcon.className = 'fas fa-user';
      } else {
        avatarIcon.className = 'fas fa-robot';
      }
      
      avatarElement.appendChild(avatarIcon);
      messageElement.appendChild(avatarElement);
    }
    
    const contentElement = document.createElement('div');
    contentElement.className = 'message-content';
    
    // Process the content to handle markdown-like formatting
    contentElement.innerHTML = formatMessageContent(message.content);
    
    messageElement.appendChild(contentElement);
    
    // Add meta information for AI responses (model used)
    if (message.role === 'assistant' && message.model) {
      const metaElement = document.createElement('div');
      metaElement.className = 'message-meta';
      
      const modelElement = document.createElement('span');
      modelElement.className = 'message-model';
      modelElement.textContent = `Model: ${formatModelName(message.model)}`;
      
      const timeElement = document.createElement('span');
      timeElement.className = 'message-time';
      timeElement.textContent = formatTime(message.timestamp);
      
      metaElement.appendChild(modelElement);
      metaElement.appendChild(timeElement);
      contentElement.appendChild(metaElement);
    }
    
    return messageElement;
  }
  
  /**
   * Format the message content with markdown-like syntax
   */
  function formatMessageContent(content) {
    // Handle code blocks
    content = content.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    
    // Handle inline code
    content = content.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Handle paragraphs
    const paragraphs = content.split('\n\n');
    return paragraphs.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
  }
  
  /**
   * Format the model name for display
   */
  function formatModelName(model) {
    if (!model) return 'Unknown model';
    
    // Extract the model name from the full string
    const parts = model.split('/');
    let modelName = parts[parts.length - 1];
    
    // Capitalize provider name
    let provider = parts.length > 1 ? parts[0] : '';
    if (provider) {
      provider = provider.charAt(0).toUpperCase() + provider.slice(1);
      return `${provider} ${modelName}`;
    }
    
    return modelName;
  }
  
  /**
   * Format timestamp for display
   */
  function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  /**
   * Scroll chat to bottom
   */
  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  /**
   * Send message to API
   */
  async function sendMessageToApi(messageText) {
    try {
      // Get API key, model, and settings
      const apiKey = apiKeyInput.value.trim();
      const model = modelSelect.value;
      const temperature = parseFloat(temperatureSlider.value);
      const stream = streamToggle.checked;
      
      if (!apiKey) {
        throw new Error('Please enter your OpenRoute API key');
      }
      
      // Prepare messages for API (excluding 'system' message objects that are for UI only)
      const apiMessages = messages.filter(m => m.role !== 'system' || m.apiSystem)
        .map(({ role, content }) => ({ role, content }));
      
      // Add loading indicator
      isWaitingForResponse = true;
      const loadingElement = addLoadingIndicator();
      
      if (stream) {
        // Handle streaming response
        await handleStreamingResponse(apiKey, model, apiMessages, temperature, loadingElement);
      } else {
        // Handle regular response
        await handleRegularResponse(apiKey, model, apiMessages, temperature, loadingElement);
      }
      
    } catch (error) {
      // Add error message
      addErrorMessage(error.message);
      console.error('Error sending message:', error);
    } finally {
      isWaitingForResponse = false;
    }
  }
  
  /**
   * Handle streaming response from API
   */
  async function handleStreamingResponse(apiKey, model, apiMessages, temperature, loadingElement) {
    try {
      // Remove loading indicator and prepare for streaming
      chatMessages.removeChild(loadingElement);
      
      // Setup streaming message placeholder
      const placeholder = {
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        model: model
      };
      messages.push(placeholder);
      
      const messageElement = createMessageElement(placeholder);
      chatMessages.appendChild(messageElement);
      currentStreamingMessageElement = messageElement;
      
      // Create content element for streaming updates
      const contentEl = messageElement.querySelector('.message-content');
      const originalContent = contentEl.innerHTML;
      contentEl.innerHTML = '<p></p>' + originalContent.replace(/<p>.*?<\/p>/g, '');
      const streamTarget = contentEl.querySelector('p');
      
      // Stream the response
      const response = await fetch('/.netlify/functions/openroute-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey,
          model,
          messages: apiMessages,
          temperature,
          stream: true
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response from API');
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedContent = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const jsonData = JSON.parse(line.slice(6));
              if (jsonData.choices && jsonData.choices[0].delta && jsonData.choices[0].delta.content) {
                const content = jsonData.choices[0].delta.content;
                accumulatedContent += content;
                streamTarget.innerHTML = formatMessageContent(accumulatedContent);
                scrollToBottom();
              }
            } catch (e) {
              console.error('Error parsing stream data:', e);
            }
          }
        }
      }
      
      // Update the message content in the messages array
      const lastMessage = messages[messages.length - 1];
      lastMessage.content = accumulatedContent;
      lastMessage.model = model;
      
      // Save updated history
      saveChatHistory();
      
      // Reset streaming state
      currentStreamingMessageElement = null;
      
    } catch (error) {
      if (currentStreamingMessageElement) {
        chatMessages.removeChild(currentStreamingMessageElement);
        messages.pop(); // Remove incomplete message
      }
      throw error;
    }
  }
  
  /**
   * Handle regular (non-streaming) response from API
   */
  async function handleRegularResponse(apiKey, model, apiMessages, temperature, loadingElement) {
    // Send request to our Netlify function
    const response = await fetch('/.netlify/functions/openroute-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey,
        model,
        messages: apiMessages,
        temperature,
        stream: false
      })
    });
    
    // Remove loading indicator
    chatMessages.removeChild(loadingElement);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get response from API');
    }
    
    const data = await response.json();
    
    // Add assistant message to chat
    addMessage('assistant', data.message.content, data.model);
  }
  
  /**
   * Add loading indicator to chat
   */
  function addLoadingIndicator() {
    const loadingElement = document.createElement('div');
    loadingElement.className = 'message assistant-message loading-indicator';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar assistant-avatar';
    const avatarIcon = document.createElement('i');
    avatarIcon.className = 'fas fa-robot';
    avatar.appendChild(avatarIcon);
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.innerHTML = 'Thinking <div class="loading-dots"><span></span><span></span><span></span></div>';
    
    loadingElement.appendChild(avatar);
    loadingElement.appendChild(content);
    
    chatMessages.appendChild(loadingElement);
    scrollToBottom();
    
    return loadingElement;
  }
  
  /**
   * Add error message to chat
   */
  function addErrorMessage(errorText) {
    const message = {
      role: 'system',
      content: `<strong>Error:</strong> ${errorText}`,
      timestamp: new Date().toISOString()
    };
    
    const messageElement = document.createElement('div');
    messageElement.className = 'message system-message error-message';
    
    const contentElement = document.createElement('div');
    contentElement.className = 'message-content';
    contentElement.innerHTML = message.content;
    
    messageElement.appendChild(contentElement);
    chatMessages.appendChild(messageElement);
    
    scrollToBottom();
  }
  
  /**
   * Save chat history to localStorage
   */
  function saveChatHistory() {
    localStorage.setItem('chat_messages', JSON.stringify(messages));
  }
  
  /**
   * Load chat history from localStorage
   */
  function loadChatHistory() {
    const savedMessages = localStorage.getItem('chat_messages');
    if (savedMessages) {
      messages = JSON.parse(savedMessages);
      
      // Render saved messages
      chatMessages.innerHTML = ''; // Clear default welcome message
      messages.forEach(message => {
        chatMessages.appendChild(createMessageElement(message));
      });
      
      scrollToBottom();
    }
  }
  
  /**
   * Start a new chat
   */
  function startNewChat() {
    if (messages.length > 0 && !confirm('Start a new chat? This will clear your current conversation.')) {
      return;
    }
    
    // Clear messages
    messages = [];
    saveChatHistory();
    
    // Clear chat UI and add welcome message
    chatMessages.innerHTML = '';
    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'message system-message';
    welcomeMessage.innerHTML = `
      <div class="message-content">
        <p>Welcome to Neo N3 MCP Chat! To get started:</p>
        <ol>
          <li>Enter your <a href="https://openrouter.ai/" target="_blank">OpenRoute API key</a> in the sidebar</li>
          <li>Select your preferred AI model</li>
          <li>Start asking questions about Neo N3 blockchain and MCP!</li>
        </ol>
        <p>Example questions you can ask:</p>
        <ul>
          <li>What is Neo N3 blockchain?</li>
          <li>How does the Model Context Protocol work with Neo?</li>
          <li>What smart contracts are supported?</li>
          <li>How can I check my NEO balance using MCP?</li>
        </ul>
      </div>
    `;
    chatMessages.appendChild(welcomeMessage);
    
    // Focus on input
    chatInput.focus();
  }
  
  /**
   * Clear chat history
   */
  function clearChatHistory() {
    if (confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
      localStorage.removeItem('chat_messages');
      startNewChat();
    }
  }
}); 