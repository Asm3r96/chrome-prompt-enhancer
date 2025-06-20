/* global chrome */
const PROVIDERS = {
  openai: {
    label: 'OpenAI GPT‑4o',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    buildRequest: (apiKey, userPrompt) => ({
      url: 'https://api.openai.com/v1/chat/completions',
      init: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an expert prompt engineer. Improve the following prompt for clarity, completeness and efficiency.' },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 400
        })
      },
      parse: async res => (await res.json()).choices[0].message.content.trim()
    })
  },
  anthropic: {
    label: 'Anthropic Claude 3',
    endpoint: 'https://api.anthropic.com/v1/messages',
    buildRequest: (apiKey, userPrompt) => ({
      url: 'https://api.anthropic.com/v1/messages',
      init: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 400,
          messages: [
            { role: 'user', content: `Improve the following prompt for clarity, completeness and efficiency.\n\nPROMPT:\n${userPrompt}` }
          ]
        })
      },
      parse: async res => (await res.json()).content[0].text.trim()
    })
  },
  gemini: {
    label: 'Google Gemini 1.5',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
    buildRequest: (apiKey, userPrompt) => ({
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      init: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: 'Improve the following prompt for clarity, completeness and efficiency.' },
                { text: userPrompt }
              ]
            }
          ]
        })
      },
      parse: async res => (await res.json()).candidates[0].content.parts.map(p => p.text).join('').trim()
    })
  }
};

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'ENHANCE_PROMPT') {
    (async () => {
      try {
        const { provider = 'openai', apiKey } = await chrome.storage.sync.get(['provider', 'apiKey']);
        if (!apiKey) throw new Error('API key not set');
        const cfg = PROVIDERS[provider];
        const { url, init, parse } = cfg.buildRequest(apiKey, msg.prompt);
        const res = await fetch(url, init);
        if (!res.ok) throw new Error(`${cfg.label} returned ${res.status}`);
        const improved = await parse(res);
        sendResponse({ ok: true, improved });
      } catch (err) {
        console.error(err);
        sendResponse({ ok: false, error: err.message });
      }
    })();
    // Return true to indicate async response
    return true;
  }
});