/* global chrome */

chrome.commands.onCommand.addListener(command => {
  if (command === 'open_prompt_overlay') {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const tab = tabs[0];
      if (tab && tab.id) {
        chrome.tabs.sendMessage(tab.id, { type: 'OPEN_OVERLAY' });
      }
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'ENHANCE_PROMPT') {
    enhancePrompt(request.prompt, request.enhancementSettings)
      .then(response => sendResponse({ success: true, enhancedPrompt: response }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Indicates that sendResponse will be called asynchronously
  } else if (request.type === 'SAVE_ENHANCEMENT') {
    saveEnhancement(request.data)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Indicates that sendResponse will be called asynchronously
  }
});

async function saveEnhancement(data) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get({ enhancements: [] }, (result) => {
      const enhancements = result.enhancements;
      enhancements.unshift({ id: Date.now(), ...data }); // Add new enhancement to the beginning
      // Keep only the last 100 enhancements to prevent excessive storage use
      chrome.storage.local.set({ enhancements: enhancements.slice(0, 100) }, () => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        resolve();
      });
    });
  });
}

async function enhancePrompt(prompt, enhancementSettings) {
  const { selectedApiProvider, selectedApiModel, geminiApiKey, openaiApiKey, claudeApiKey } = await chrome.storage.sync.get(['selectedApiProvider', 'selectedApiModel', 'geminiApiKey', 'openaiApiKey', 'claudeApiKey']);
  
  let apiKey;
  let apiUrl;
  let headers = { 'Content-Type': 'application/json' };
  let body;
  let model;

  const fullPrompt = `Enhance the following prompt for an AI model. Consider these instructions: ${enhancementSettings.customPrompt || 'Make it more detailed and clear.'} Also, adjust the tone to be ${enhancementSettings.tone} and the length to be ${enhancementSettings.length}.

Original Prompt: "${prompt}"

Enhanced Prompt:`;

  switch (selectedApiProvider) {
    case 'gemini':
      apiKey = geminiApiKey;
      if (!apiKey) throw new Error('Gemini API key not set.');
      model = selectedApiModel || 'gemini-2.5-flash';
      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      body = JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: fullPrompt }]
        }]
      });
      break;
    case 'openai':
      apiKey = openaiApiKey;
      if (!apiKey) throw new Error('OpenAI API key not set.');
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      headers['Authorization'] = `Bearer ${apiKey}`;
      model = selectedApiModel || 'gpt-4o-mini-2024-07-18';
      body = JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: fullPrompt }]
      });
      break;
    case 'claude':
      apiKey = claudeApiKey;
      if (!apiKey) throw new Error('Anthropic Claude API key not set.');
      apiUrl = 'https://api.anthropic.com/v1/messages';
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
      headers['Content-Type'] = 'application/json';
      model = selectedApiModel || 'claude-3-haiku-20240307';
      body = JSON.stringify({
        model: model,
        max_tokens: 1024, // Max tokens for Claude response
        messages: [{ role: 'user', content: fullPrompt }]
      });
      break;
    default:
      throw new Error('No API provider selected.');
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: headers,
    body: body
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`API Error (${selectedApiProvider}): ${errorData.error?.message || errorData.message || response.statusText}`);
  }

  const data = await response.json();

  switch (selectedApiProvider) {
    case 'gemini':
      return data.candidates[0].content.parts[0].text;
    case 'openai':
      return data.choices[0].message.content;
    case 'claude':
      return data.content[0].text;
    default:
      throw new Error('Unknown API provider response.');
  }
}