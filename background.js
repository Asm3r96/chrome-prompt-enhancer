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
  // Provide default settings if undefined
  const settings = enhancementSettings || { customPrompt: '', tone: 'neutral', length: 'same' };
  
  const { selectedApiProvider, selectedApiModel, geminiApiKey, openaiApiKey, claudeApiKey } = await chrome.storage.sync.get(['selectedApiProvider', 'selectedApiModel', 'geminiApiKey', 'openaiApiKey', 'claudeApiKey']);
  
  let apiKey;
  let apiUrl;
  let headers = { 'Content-Type': 'application/json' };
  let body;
  let model;

  // Build the enhancement instruction using GPT-5 best practices
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

  switch (selectedApiProvider) {
    case 'gemini':
      apiKey = geminiApiKey;
      if (!apiKey) throw new Error('Gemini API key not set.');
      model = selectedApiModel || 'gemini-1.5-flash';
      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      body = JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: fullPrompt }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 8192
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE"
          }
        ]
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

  // Retry logic for server errors
  let response;
  let lastError;
  const maxRetries = 3;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: body
      });
      
      // If successful or client error (4xx), break out of retry loop
      if (response.ok || response.status < 500) {
        break;
      }
      
      // Server error (5xx) - retry with exponential backoff
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let errorMessage = `API Error (${selectedApiProvider}): `;
    
    // Handle different API error formats
    if (selectedApiProvider === 'gemini') {
      if (errorData.error?.message) {
        errorMessage += errorData.error.message;
      } else if (errorData.message) {
        errorMessage += errorData.message;
      } else if (response.status === 500) {
        errorMessage += 'Gemini API temporary issue - this usually resolves quickly';
      } else {
        errorMessage += response.statusText || 'Unknown error occurred';
      }
    } else if (selectedApiProvider === 'openai' && errorData.error?.message) {
      errorMessage += errorData.error.message;
    } else if (selectedApiProvider === 'claude' && errorData.error?.message) {
      errorMessage += errorData.error.message;
    } else if (errorData.message) {
      errorMessage += errorData.message;
    } else {
      errorMessage += response.statusText || 'Unknown error occurred';
    }
    
    // Add helpful context for common errors
    if (response.status === 401) {
      errorMessage += ' (Check your API key)';
    } else if (response.status === 429) {
      errorMessage += ' (Rate limit exceeded - try again later)';
    } else if (response.status >= 500) {
      errorMessage += ' (Server error - try again later)';
    }
    
    throw new Error(errorMessage);
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

function buildDefaultInstruction(settings) {
  const { tone, length } = settings;
  
  // Build structured prompt following GPT-5 best practices
  let instruction = `<prompt_enhancement_task>
You are a prompt optimization specialist. Your task is to enhance the user's prompt while maintaining their exact perspective, voice, and intent.

<core_rules>
- Preserve original perspective: Keep 'I', 'my', 'we' unchanged - never convert to 'you', 'your'
- Maintain the requester's identity and relationship to the task
- Enhance clarity and specificity without changing the fundamental request
- Use plain text formatting only - no markdown, asterisks, or special symbols
- Return ONLY the enhanced prompt with no explanations or meta-commentary
</core_rules>

<enhancement_approach>
- Add context and specificity where the original prompt is vague
- Include relevant details that would help achieve better AI responses  
- Structure information logically if the original is disorganized
- Clarify success criteria and expected outcomes when ambiguous
- Preserve any technical terms, proper nouns, or domain-specific language
</enhancement_approach>`;

  // Add tone guidance
  instruction += `\n\n<tone_guidance>`;
  switch (tone) {
    case 'formal':
      instruction += `Apply formal, professional language throughout. Use complete sentences, avoid contractions, and employ business or academic terminology where appropriate.`;
      break;
    case 'casual':
      instruction += `Maintain a casual, friendly tone. Use conversational language, contractions where natural, and approachable phrasing.`;
      break;
    case 'technical':
      instruction += `Use precise, technical language. Include specific terminology, exact specifications, and detailed technical requirements.`;
      break;
    case 'creative':
      instruction += `Apply creative, engaging language. Use vivid descriptions, imaginative phrasing, and expressive terminology.`;
      break;
    case 'persuasive':
      instruction += `Use persuasive, compelling language. Include strong action words, clear benefits, and motivational phrasing.`;
      break;
    default:
      instruction += `Maintain a neutral, clear tone. Use straightforward language that is professional yet accessible.`;
  }
  instruction += `</tone_guidance>`;

  // Add length guidance  
  instruction += `\n\n<length_guidance>`;
  switch (length) {
    case 'shorter':
      instruction += `Make the prompt more concise. Remove redundancy, combine related points, and focus on essential information only.`;
      break;
    case 'longer':
      instruction += `Expand the prompt with additional context, background information, and relevant details that would improve response quality.`;
      break;
    case 'detailed':
      instruction += `Create a comprehensive, detailed prompt. Include specific examples, step-by-step requirements, success criteria, and extensive context.`;
      break;
    default:
      instruction += `Keep the prompt roughly the same length, focusing on clarity improvements rather than significant expansion or reduction.`;
  }
  instruction += `</length_guidance>

<output_format>
Provide only the enhanced prompt. Do not include:
- Explanations of changes made
- Alternative versions or options  
- Meta-commentary about the enhancement process
- Formatting instructions or suggestions
</output_format>
</prompt_enhancement_task>

Original prompt to enhance:`;
  
  return instruction;
}