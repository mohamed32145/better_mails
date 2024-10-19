document.addEventListener('DOMContentLoaded', () => {
  const improveButton = document.getElementById('improveButton');
  const emailContentInput = document.getElementById('emailContent');
  const improvedContentOutput = document.getElementById('improvedContent');

  if (improveButton) {
    improveButton.addEventListener('click', () => {
      const emailContent = emailContentInput.value;

      chrome.runtime.sendMessage({
        action: 'improveEmailContent',
        emailContent: emailContent
      }, (response) => {
        if (chrome.runtime.lastError) {
          improvedContentOutput.value = `Error: ${chrome.runtime.lastError.message}`;
          console.error('Runtime error:', chrome.runtime.lastError);
          return;
        }

        if (response && response.error) {
          improvedContentOutput.value = `Error: ${response.error}`;
          console.error(response.details);
        } else if (response && response.improvedContent) {
          improvedContentOutput.value = response.improvedContent;
        } else {
          improvedContentOutput.value = 'No response from the background script.';
        }
      });
    });
  }
});
