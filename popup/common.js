export async function getApiKey() {
  const { apiKey = '' } = await chrome.storage.sync.get('apiKey');
  return apiKey;
}

export async function requestPromptEnhancement(prompt, apiKey) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { 
                text: `Take the following prompt and rewrite it to be clearer, more detailed, and better structured. Use plain text formatting only - no markdown, no asterisks, no special symbols. If you need to emphasize sections, use clear headings and organize with line breaks. Return ONLY the enhanced prompt - no explanations, no options, no additional text. Just the improved version:

${prompt}` 
              }
            ]
          }
        ]
      })
    }
  );
  if (!res.ok) {
    throw new Error(`Gemini returned ${res.status}`);
  }
  const data = await res.json();
  const improved =
    data.candidates?.[0]?.content?.parts?.map(p => p.text).join('')?.trim() || '';
  return improved;
}