/*

async function improveEmailContent(emailContent) {
    const response = await fetch('<https://api.openai.com/v1/completions>', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
      
        body: JSON.stringify({
            model: 'text-davinci-003',
            prompt: `Improve the following email content:\\n\\n${emailContent}`,
            max_tokens: 500
        })
    });
    const data = await response.json();
    return data.choices[0].text;
}

// Example usage with a button in the popup
document.getElementById('improveButton').addEventListener('click', async () => {
    const emailBody = document.querySelector('.editable').innerText; // Adjust selector to match Gmail's email body
    const improvedContent = await improveEmailContent(emailBody);
    document.querySelector('.editable').innerText = improvedContent;  // Replace the email content with the improved one
});


*/