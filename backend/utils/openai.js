const axios = require("axios");


const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/";
const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

/**
 * Transforms an OpenAI-formatted messages array to the Gemini format.
 * @param {Array<Object>} messages - OpenAI-formatted messages
 * @returns {{contents: Array<Object>, systemInstruction: Object|null}}
 */
function transformMessagesForGemini(messages = []) {
  let systemInstruction = null;
  const contents = [];

  for (const message of messages) {
    if (message.role === "system") {
      systemInstruction = {
        role: "system",
        parts: [{ text: message.content }],
      };
      continue; 
    }

    const role = message.role === "assistant" ? "model" : "user";
    
    contents.push({
      role: role,
      parts: [{ text: message.content }],
    });
  }
  

  if (systemInstruction) {
     return { contents, systemInstruction };
  }
  
  return { contents, systemInstruction: null };
}

/**
 * Calls the Google Gemini API.
 * @param {Array<Object>} [messages=[]] 
 * @param {string} [model=DEFAULT_MODEL] 
 * @param {number} [max_tokens=800] 
 */
async function callAI({ messages = [], model = DEFAULT_MODEL, max_tokens = 800 }) {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY not set in env");
  }

  const fullApiUrl = `${GEMINI_API_URL}${model}:generateContent?key=${process.env.GOOGLE_API_KEY}`;

  const { contents, systemInstruction } = transformMessagesForGemini(messages);

  const payload = {
    contents,
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: max_tokens,
    },
  };
  
  if (systemInstruction) {
    payload.systemInstruction = systemInstruction;
  }

  try {
    const resp = await axios.post(fullApiUrl, payload, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 120000,
    });

    if (resp.data && resp.data.candidates && resp.data.candidates.length > 0) {
      const candidate = resp.data.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        return candidate.content.parts[0].text;
      }
    }
    
    if (resp.data.promptFeedback?.blockReason) {
       throw new Error(`Request blocked due to: ${resp.data.promptFeedback.blockReason}`);
    }

    throw new Error("No valid response content from AI");

  } catch (error) {
    if (error.response) {
      console.error("Error from Gemini API:", JSON.stringify(error.response.data, null, 2));
      throw new Error(`API Error: ${error.response.data.error?.message || error.message}`);
    } else {
      console.error("Error calling AI:", error.message);
      throw error;
    }
  }
}

module.exports = { callAI };