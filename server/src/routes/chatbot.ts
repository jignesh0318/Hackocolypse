import express, { Request, Response } from 'express';
import axios from 'axios';

const router = express.Router();

interface ChatbotRequest {
  message: string;
  context?: string;
}

interface HFResponse {
  generated_text: string;
}

// Safety context for chatbot responses
const SAFETY_SYSTEM_PROMPT = `You are SafeWatch AI, a friendly safety assistant for the AI Safety Zones app. 
Your purpose is to:
- Provide safety tips and emergency guidance
- Help users understand safe routes and dangerous areas
- Offer quick advice on personal safety, especially for evening/night travel
- Help with emergency contact information
- Provide support for users in distress
- Give location-specific safety recommendations when asked

Keep responses concise (under 150 words), friendly, and action-oriented. 
If someone mentions an emergency, recommend calling local emergency services (dial 911 or local equivalent) immediately.
Always prioritize user safety over other concerns.`;

// Get HuggingFace API token from environment (users must set this)
const HF_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN || '';
const HF_MODEL = process.env.HUGGINGFACE_MODEL || 'mistralai/Mistral-7B-Instruct-v0.1';
const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`;
const USE_API = process.env.USE_HUGGINGFACE_API === 'true' && HF_API_TOKEN.length > 0;

// Fallback responses when API is not configured
const FALLBACK_RESPONSES: { [key: string]: string } = {
  evening: "🌙 Evening Safety Tips:\n• Stay on well-lit routes\n• Share your location with trusted contacts\n• Keep your phone charged\n• Trust your instincts\n• Use buddy system when possible",
  emergency: "🆘 Emergency Help:\n• Call 911 (or local emergency)\n• Share your location with contacts\n• Use app's SOS feature\n• Stay calm and describe your situation clearly",
  area: "📍 Current Area Safety:\nCheck the app's map for nearby safe zones and alert areas. Report incidents to help other users stay safe.",
  default: "Hello! I'm SafeWatch AI. I can help you with safety tips, emergency guidance, and route planning. What would you like to know?",
};

// Rate limiting
const messageLimits = new Map<string, number>();

const checkRateLimit = (identifier: string): boolean => {
  const now = Date.now();
  const lastMessage = messageLimits.get(identifier) || 0;
  
  if (now - lastMessage < 1000) {
    return false; // Rate limited
  }
  
  messageLimits.set(identifier, now);
  return true;
};

router.post('/', async (req: Request, res: Response) => {
  try {
    const { message, context }: ChatbotRequest = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    // Get client IP for rate limiting
    const clientIp = req.ip || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
    }

    // Detect intent from message for fallback responses
    const messageL = message.toLowerCase();
    let intentType = 'default';
    
    if (messageL.includes('evening') || messageL.includes('night') || messageL.includes('dark')) {
      intentType = 'evening';
    } else if (messageL.includes('emergency') || messageL.includes('help') || messageL.includes('danger')) {
      intentType = 'emergency';
    } else if (messageL.includes('area') || messageL.includes('location') || messageL.includes('safe zone')) {
      intentType = 'area';
    }

    // If HF API is disabled or token not configured, use fallback
    if (!USE_API) {
      console.log('Using fallback responses (HuggingFace API disabled or not configured)');
      const fallbackReply = FALLBACK_RESPONSES[intentType] || FALLBACK_RESPONSES.default;
      return res.json({ reply: fallbackReply });
    }

    // Call HuggingFace Inference API
    try {
      const response = await axios.post(
        HF_API_URL,
        {
          inputs: `${SAFETY_SYSTEM_PROMPT}\n\nUser: ${message}\n\nAssistant:`,
          parameters: {
            max_new_tokens: 150,
            temperature: 0.7,
            top_p: 0.95,
            do_sample: true,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${HF_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      // Extract text from response
      let reply = '';
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        const hfResponse = response.data[0] as HFResponse;
        reply = hfResponse.generated_text;
        
        // Clean up the response - remove the prompt part
        const assistantIndex = reply.indexOf('Assistant:');
        if (assistantIndex !== -1) {
          reply = reply.substring(assistantIndex + 10).trim();
        }
      } else if (response.data.generated_text) {
        reply = response.data.generated_text;
      }

      // Fallback if response is empty
      if (!reply || reply.length === 0) {
        reply = FALLBACK_RESPONSES[intentType] || FALLBACK_RESPONSES.default;
      }

      // Truncate response if too long
      if (reply.length > 500) {
        reply = reply.substring(0, 500) + '...';
      }

      res.json({ reply });
    } catch (apiError) {
      console.error('HuggingFace API error:', apiError);
      
      // Fallback to keyword-based responses on API error
      if (axios.isAxiosError(apiError)) {
        console.error('API Status:', apiError.response?.status);
        console.error('API Error:', apiError.response?.data);
        
        if (apiError.response?.status === 503) {
          return res.json({
            reply: "I'm having trouble connecting to my brain right now. Please try again in a moment. For immediate help, use the SOS feature.",
          });
        }
        if (apiError.message.includes('timeout')) {
          return res.json({
            reply: "The response took too long. For urgent safety concerns, please use the SOS feature or call emergency services.",
          });
        }
      }
      
      // Always return something helpful
      const fallbackReply = FALLBACK_RESPONSES[intentType] || FALLBACK_RESPONSES.default;
      return res.json({ reply: fallbackReply });
    }
  } catch (error) {
    console.error('Chatbot error:', error);

    // Provide helpful fallback on error
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 503) {
        return res.json({
          reply: "I'm having trouble connecting to my brain right now. Please try again in a moment. For immediate help, use the SOS feature.",
        });
      }
      if (error.message.includes('timeout')) {
        return res.json({
          reply: "The response took too long. For urgent safety concerns, please use the SOS feature or call emergency services.",
        });
      }
    }

    res.json({
      reply: "Sorry, I encountered an error. For immediate emergencies, please call 911 or use the app's SOS feature.",
    });
  }
});

export default router;
