export async function getApiKey() {
  const { apiKey = '' } = await chrome.storage.sync.get('apiKey');
  return apiKey;
}

export async function getEnhancementSettings() {
  const defaultSettings = {
    customPrompt: '',
    tone: 'neutral',
    length: 'same'
  };
  
  const { enhancementSettings = defaultSettings } = await chrome.storage.sync.get('enhancementSettings');
  return enhancementSettings;
}

export async function requestPromptEnhancement(prompt, apiKey, customSettings = null) {
  // Get saved settings if no custom settings provided
  const settings = customSettings || await getEnhancementSettings();
  
  // Build the enhancement instruction
  let enhancementInstruction;
  
  if (settings.customPrompt && settings.customPrompt.trim()) {
    // Use custom prompt with placeholders
    enhancementInstruction = settings.customPrompt
      .replace('{tone}', settings.tone)
      .replace('{length}', settings.length);
  } else {
    // Use default enhancement with settings
    enhancementInstruction = buildDefaultInstruction(settings);
  }

  const fullPrompt = `${enhancementInstruction}

${prompt}`;

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
                text: fullPrompt
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

function buildDefaultInstruction(settings) {
  const { tone, length } = settings;
  
  let instruction = "Take the following prompt and rewrite it to be clearer, more detailed, and better structured.";
  
  // Add tone instruction
  switch (tone) {
    case 'formal':
      instruction += " Use a formal, professional tone.";
      break;
    case 'casual':
      instruction += " Use a casual, friendly tone.";
      break;
    case 'technical':
      instruction += " Use precise, technical language.";
      break;
    case 'creative':
      instruction += " Use creative, engaging language.";
      break;
    case 'persuasive':
      instruction += " Use persuasive, compelling language.";
      break;
    default:
      instruction += " Maintain a neutral, clear tone.";
  }
  
  // Add length instruction
  switch (length) {
    case 'shorter':
      instruction += " Make it more concise and to the point.";
      break;
    case 'longer':
      instruction += " Expand it with more detail and explanation.";
      break;
    case 'detailed':
      instruction += " Add comprehensive details, examples, and thorough explanations.";
      break;
    default:
      instruction += " Keep it roughly the same length.";
  }
  
  instruction += " Use plain text formatting only - no markdown, no asterisks, no special symbols. If you need to emphasize sections, use clear headings and organize with line breaks. Return ONLY the enhanced prompt - no explanations, no options, no additional text. Just the improved version:";
  
  return instruction;
}