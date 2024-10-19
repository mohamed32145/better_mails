chrome.runtime.onInstalled.addListener(() => {
  console.log("Gmail Enhancer Extension Installed");
});

chrome.storage.local.set({ apiKey: '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' }, function() {
  console.log('API key is stored securely.');
});

async function fetchWithRetry(url, options, retries = 2) {
  try {
    const response = await fetch(url, options);
    
    if (response.status === 429 && retries > 0) {
      // Check for Retry-After header and use it to delay the retry
      const retryAfter = response.headers.get('Retry-After') || 1;
      console.warn(`Rate limit exceeded. Retrying after ${retryAfter} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return fetchWithRetry(url, options, retries - 1);
    }

    // Check if the response is a quota error
    if (response.status === 403) {
      const data = await response.json();
      if (data.error && data.error.code === 'insufficient_quota') {
        console.error('Quota error:', data.error.message);
        throw new Error('Quota exceeded');
      }
    }

    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'improveEmailContent') {
    chrome.storage.local.get('apiKey', async (result) => {
      const apiKey = result.apiKey;
      if (!apiKey) {
        sendResponse({ error: 'API key not found' });
        return;
      }

      try {
        const response = await fetchWithRetry('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You are an assistant that improves email content.' },
              { role: 'user', content: `Improve the following email content:\n\n${message.emailContent}` }
            ],
            max_tokens: 500
          })
        });

        if (response.ok) {
          const data = await response.json();
          sendResponse({ improvedContent: data.choices[0].message.content });
        } else {
          const errorDetails = await response.json();
          sendResponse({ error: 'API request failed', details: errorDetails });
        }
      } catch (error) {
        sendResponse({ error: 'Error during API call', details: error.message });
      }
    });
    return true; // This keeps the message channel open
  }
});










/*
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log('Received message:', message);
  
  if (message.action === 'improveEmailContent') {
    try {
      chrome.storage.local.get('apiKey', async function(result) {
        const apiKey = result.apiKey;
        console.log('API key retrieved:', apiKey);

        if (!apiKey) {
          sendResponse({ error: 'API key not found' });
          return;
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { "role": 'system', content: 'You are an assistant that improves email content.' },
              { "role": 'user', content: `Improve the following email content:\n\n${message.emailContent}` }
            ],
            ma
 */