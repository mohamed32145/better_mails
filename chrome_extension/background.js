
import  config  from './config.js';


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    if (message.action === 'checkEmail') {
      // Check if the email content needs improvement by sending it to the backend
      fetch('http://localhost:8000/process_email/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email_text: message.content }),
      })
      .then(response => response.json())
      .then(data => {
        // Send the result back to the content script
        sendResponse({ shouldImprove: data.improve });
      })
      .catch(error => {
        console.error('Error checking email content:', error);
        sendResponse({ shouldImprove: false });
      });

      // Keep the channel open for async response
      return true;
    } 
    else if (message.action === 'improveEmail') {
      // Improve the email content using OpenAI API
      sendToOpenAI(message.content)
        .then(improvedContent => {
          // Send the improved content back to the content script
          chrome.tabs.sendMessage(sender.tab.id, {
            action: 'replaceEmailContent',
            body: improvedContent,
          });

          // Send a response to indicate success
          sendResponse({ success: true });
        })
        .catch(error => {
          console.error('Error improving email content:', error);

          // Send a response to indicate failure
          sendResponse({ success: false, error });
        });

      // Keep the channel open for async response
      return true;
    }
  } catch (error) {
    console.error('Error handling message:', error);
    sendResponse({ success: false, error });
  }
});

// Function to send the email content to the OpenAI API
async function sendToOpenAI(content) {
  const apiKey = config.apiKey; // Retrieve API key from config.js
  console.log(apiKey);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an assistant that improves email content.' },
        { role: 'user', content: `Improve the following email content:\n\n${content}` }
      ],
      max_tokens: 300,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content.trim();
}
