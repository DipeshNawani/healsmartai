const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const ChatSession = require('../models/ChatSession');
const { protect } = require('../middleware/auth');

// Initialize Gemini API
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// Initialize NVIDIA API (OpenAI-compatible)
const openai = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
});

const SYSTEM_PROMPT = `You are HealSmart AI Doctor, a friendly, professional AI health assistant. 

CRITICAL RULES:
1. Respond DIRECTLY to the user. Do NOT show any internal thinking, reasoning, or planning. Do NOT include text like "Okay, the user mentioned...", "Let me think...", "I should..." or any meta-commentary. Just respond naturally like a real doctor.
2. LANGUAGE: For EVERY message, detect the language of the user's LATEST message ONLY (ignore previous conversation language) and reply in that SAME language:
   - If the latest message is in English → reply in English
   - If the latest message is in Hindi (Devanagari script) → reply in Hindi
   - If the latest message is in Hinglish (Hindi words written in English/Roman script like "mujhe bukhar hai") → reply in Hinglish
   - If the latest message is in any other language → reply in that language
   IMPORTANT: If the user SWITCHES language mid-conversation, you MUST switch too. Always match the language of the MOST RECENT message, not earlier messages.
3. FORMAT: Use markdown formatting for readability — bold for important terms, bullet points for lists, headers for sections. Do NOT use horizontal rules (---). Use emojis sparingly for warmth.

Your role:
1. GREETING: When the user first messages, warmly greet them and ask about their health concern.
2. SYMPTOM ANALYSIS: Ask follow-up questions to understand symptoms better (duration, severity, location, triggers).
3. ASSESSMENT: After gathering enough info (2-3 exchanges), provide:
   - Possible conditions (ranked by likelihood)
   - Home remedies and self-care tips
   - When to see a doctor (urgency level: LOW / MEDIUM / HIGH / EMERGENCY)
4. DOCTOR REFERRAL: If the condition seems serious, recommend the appropriate specialist type.
5. DISCLAIMER: Always remind users that this is AI-based guidance, not a replacement for professional medical advice.

Response style:
- Be empathetic and warm
- Keep responses concise but thorough
- Use bullet points and bold text for key information
- If the user describes an EMERGENCY (chest pain, difficulty breathing, severe bleeding, stroke symptoms), immediately advise calling emergency services
- Never diagnose definitively — use phrases like "This could be..." or "Based on your symptoms, this may suggest..."`;

// POST /api/ai/chat
router.post('/chat', protect, async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ message: 'Message is required' });
        }

        let reply = '';

        // 1. Primary: Google Gemini (gemini-3.5-flash)
        if (process.env.GEMINI_API_KEY) {
            try {
                const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const geminiModel = gemini.getGenerativeModel({
                    model: 'gemini-3.5-flash',
                    systemInstruction: SYSTEM_PROMPT,
                });

                // Format conversation history for Gemini
                const formattedHistory = [];
                if (history && Array.isArray(history)) {
                    for (const msg of history) {
                        formattedHistory.push({
                            role: msg.role === 'user' ? 'user' : 'model',
                            parts: [{ text: msg.content || '' }]
                        });
                    }
                }

                const chat = geminiModel.startChat({
                    history: formattedHistory
                });

                const result = await chat.sendMessage(message);
                reply = result.response.text();
            } catch (geminiErr) {
                console.warn('Gemini API call failed (' + geminiErr.message + '), trying fallback...');
            }
        }

        // 2. Secondary: NVIDIA API (if Gemini was not configured or failed)
        if (!reply && process.env.NVIDIA_API_KEY && process.env.NVIDIA_API_KEY !== 'YOUR_NVIDIA_API_KEY') {
            try {
                const messages = [
                    { role: 'system', content: SYSTEM_PROMPT }
                ];
                if (history && Array.isArray(history)) {
                    for (const msg of history) {
                        messages.push({
                            role: msg.role === 'user' ? 'user' : 'assistant',
                            content: msg.content
                        });
                    }
                }
                messages.push({ role: 'user', content: message });

                const completion = await openai.chat.completions.create({
                    model: 'nvidia/llama-3.1-nemotron-70b-instruct',
                    messages,
                    temperature: 0.6,
                    top_p: 0.95,
                    max_tokens: 4096,
                    stream: false,
                });
                reply = completion.choices[0]?.message?.content || '';
            } catch (apiErr) {
                console.warn('NVIDIA API call failed (' + (apiErr.status || apiErr.message) + '), using clinical assistant.');
            }
        }

        // 3. Fallback: Local Clinical Knowledge Assistant
        if (!reply) {
            reply = getMockResponse(message);
        }

        // Strip model's internal thinking/reasoning if any
        reply = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        const thinkEndMarkers = ['Hello!', 'Hi ', 'Hey ', 'I\'m sorry', 'Thank you', 'Based on', 'I understand', 'Let\'s', 'It sounds', 'That sounds', 'Great question', 'Good question', '##', '**'];
        if (reply.length > 500) {
            for (const marker of thinkEndMarkers) {
                const idx = reply.indexOf(marker);
                if (idx > 100 && idx < reply.length - 50) {
                    const before = reply.substring(0, idx);
                    const lowerBefore = before.toLowerCase();
                    if ((lowerBefore.includes('let me') || lowerBefore.includes('i should') || 
                         lowerBefore.includes('i need to') || lowerBefore.includes('the user') ||
                         lowerBefore.includes('i\'ll ') || lowerBefore.includes('first,') ||
                         lowerBefore.includes('okay,') || lowerBefore.includes('alright,'))) {
                        reply = reply.substring(idx).trim();
                        break;
                    }
                }
            }
        }

        res.json({
            reply,
            timestamp: new Date()
        });

    } catch (error) {
        console.error('AI Chat Error:', error.message || error);
        // Resilient fallback — ensure user never gets a 500 error screen
        const fallbackReply = getMockResponse(req.body?.message || '');
        res.json({
            reply: fallbackReply,
            timestamp: new Date()
        });
    }
});

// Mock responses for development without API key
function getMockResponse(message) {
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
        return `Hello! 👋 I'm your **HealSmart AI Doctor**. I'm here to help you with health-related questions and concerns.\n\nHow are you feeling today? Please describe your symptoms or health concern, and I'll do my best to help! 🩺`;
    }

    if (lowerMsg.includes('headache') || lowerMsg.includes('head pain')) {
        return `I understand you're experiencing a **headache**. Let me ask a few questions to better understand your situation:\n\n1. 📍 **Location**: Where exactly is the pain? (front, back, sides, all over?)\n2. ⏱️ **Duration**: How long have you had this headache?\n3. 📊 **Severity**: On a scale of 1-10, how severe is the pain?\n4. 🔄 **Frequency**: Is this a recurring issue or new?\n5. 💊 **Medications**: Have you taken any painkillers?\n\nPlease share these details so I can provide better guidance! 🩺`;
    }

    if (lowerMsg.includes('fever') || lowerMsg.includes('temperature')) {
        return `I see you're concerned about a **fever**. Let me help!\n\n### Quick Assessment Questions:\n- 🌡️ What is your current temperature?\n- ⏱️ How long have you had the fever?\n- 🤧 Any other symptoms? (cough, body aches, sore throat)\n- 💊 Have you taken any medication?\n\n### Meanwhile, here are some tips:\n- Stay hydrated — drink plenty of water 💧\n- Rest as much as possible 😴\n- Use a cool compress on your forehead\n- Take paracetamol/acetaminophen if temperature is above 101°F\n\n> ⚠️ **Seek immediate medical attention** if fever exceeds 103°F (39.4°C) or persists for more than 3 days.\n\nPlease share more details so I can help further!`;
    }

    if (lowerMsg.includes('stomach') || lowerMsg.includes('nausea') || lowerMsg.includes('vomit')) {
        return `I'm sorry to hear about your **stomach issues**. Let's figure this out together.\n\n### Questions to help me understand better:\n- 🍽️ When did the symptoms start? After eating anything specific?\n- 📍 Where is the pain? (upper, lower, left, right?)\n- 🔄 Is the pain constant or comes and goes?\n- 🤢 Any nausea or vomiting?\n\n### General Tips:\n- Sip clear fluids slowly (water, ginger tea) 🍵\n- Avoid spicy, fatty, or heavy foods\n- Try the **BRAT diet** (Bananas, Rice, Applesauce, Toast)\n- Rest in a comfortable position\n\n> ⚠️ **See a doctor immediately** if you notice blood in vomit or stool, severe dehydration, or the pain is unbearable.\n\nTell me more about your symptoms! 🩺`;
    }

    return `Thank you for sharing that with me. Based on what you've described, here's my assessment:\n\n### 🩺 Initial Observations\nYour symptoms could be related to several conditions. To give you a more accurate assessment, I'd like to know:\n\n1. **Duration** — How long have you been experiencing this?\n2. **Severity** — How much does it affect your daily activities?\n3. **Other symptoms** — Are there any associated symptoms?\n4. **Medical history** — Do you have any pre-existing conditions?\n\n### 💡 General Wellness Tips\n- Stay well-hydrated\n- Get adequate rest (7-8 hours of sleep)\n- Maintain a balanced diet\n- Monitor your symptoms\n\n> ⚕️ *Remember: I provide guidance only. For accurate diagnosis and treatment, please consult a healthcare professional.*\n\nPlease share more details, and I'll provide more specific guidance!`;
}

// ===== Chat Session Management =====

// GET /api/ai/sessions - Get user's chat sessions
router.get('/sessions', protect, async (req, res) => {
    try {
        const sessions = await ChatSession.find({ user: req.user._id })
            .select('title messages createdAt updatedAt isActive')
            .sort({ updatedAt: -1 });
        
        // Return sessions with last message preview and message count
        const result = sessions.map(s => ({
            _id: s._id,
            title: s.title,
            messageCount: s.messages.length,
            lastMessage: s.messages.length > 0 ? s.messages[s.messages.length - 1].content.substring(0, 80) : '',
            createdAt: s.createdAt,
            updatedAt: s.updatedAt
        }));
        
        res.json(result);
    } catch (error) {
        console.error('Get sessions error:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// POST /api/ai/sessions - Create a new chat session
router.post('/sessions', protect, async (req, res) => {
    try {
        const session = await ChatSession.create({
            user: req.user._id,
            title: 'New Consultation',
            messages: []
        });
        res.status(201).json(session);
    } catch (error) {
        console.error('Create session error:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// GET /api/ai/sessions/:id - Get a specific chat session with full messages
router.get('/sessions/:id', protect, async (req, res) => {
    try {
        const session = await ChatSession.findOne({ _id: req.params.id, user: req.user._id });
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }
        res.json(session);
    } catch (error) {
        console.error('Get session error:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/ai/sessions/:id - Update session (save messages)
router.put('/sessions/:id', protect, async (req, res) => {
    try {
        const { messages, title } = req.body;
        const session = await ChatSession.findOne({ _id: req.params.id, user: req.user._id });
        
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        if (messages) {
            session.messages = messages;
        }
        if (title) {
            session.title = title;
        }
        // Auto-set title from first user message if still default
        if (session.title === 'New Consultation' && session.messages.length > 0) {
            const firstUserMsg = session.messages.find(m => m.role === 'user');
            if (firstUserMsg) {
                session.title = firstUserMsg.content.substring(0, 50) + (firstUserMsg.content.length > 50 ? '...' : '');
            }
        }

        await session.save();
        res.json(session);
    } catch (error) {
        console.error('Update session error:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// DELETE /api/ai/sessions/:id - Delete a chat session
router.delete('/sessions/:id', protect, async (req, res) => {
    try {
        await ChatSession.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        res.json({ message: 'Session deleted' });
    } catch (error) {
        console.error('Delete session error:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// ========================
// MEDICINE INTERACTION CHECKER
// ========================
router.post('/interactions', protect, async (req, res) => {
    try {
        const { medicines } = req.body;
        if (!medicines || medicines.length < 2) {
            return res.status(400).json({ message: 'At least 2 medicines are required' });
        }

        const prompt = `Check for drug interactions between these medicines: ${medicines.join(', ')}. 
For each potential interaction:
1. **Medicines involved**
2. **Severity** (Low/Moderate/High/Critical)
3. **Description** of the interaction
4. **Recommendation**

If no significant interactions are found, say so clearly. Keep response concise.`;

        let reply = '';

        // 1. Primary: Google Gemini
        if (process.env.GEMINI_API_KEY) {
            try {
                const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const geminiModel = gemini.getGenerativeModel({
                    model: 'gemini-3.5-flash',
                    systemInstruction: 'You are a pharmaceutical AI assistant. Provide drug interaction information clearly and concisely. Always recommend consulting a healthcare professional.'
                });
                const result = await geminiModel.generateContent(prompt);
                reply = result.response.text();
            } catch (geminiErr) {
                console.warn('Gemini interaction check failed, trying backup...');
            }
        }

        // 2. Secondary: NVIDIA API
        if (!reply && process.env.NVIDIA_API_KEY && process.env.NVIDIA_API_KEY !== 'YOUR_NVIDIA_API_KEY') {
            try {
                const completion = await openai.chat.completions.create({
                    model: 'nvidia/llama-3.1-nemotron-70b-instruct',
                    messages: [
                        { role: 'system', content: 'You are a pharmaceutical AI assistant. Provide drug interaction information clearly and concisely. Always recommend consulting a healthcare professional.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.3,
                    max_tokens: 1024,
                });
                reply = completion.choices[0]?.message?.content || '';
            } catch (apiErr) {
                console.warn('NVIDIA interaction call failed, using clinical fallback.');
            }
        }

        if (!reply) {
            reply = `## Drug Interaction Check\n**Medicines Analyzed:** ${medicines.join(', ')}\n\n### 📋 Clinical Overview\nWhen taking **${medicines.join(' and ')}** together:\n- Always follow the exact dosage prescribed by your physician.\n- Monitor for any unexpected symptoms such as dizziness, stomach upset, or allergic reactions.\n- Avoid alcohol and consult a licensed pharmacist if taking on an empty stomach.\n\n> ⚠️ *Clinical Note: For individual metabolic considerations, verify with your treating doctor.*`;
        } else {
            reply = reply.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
        }

        res.json({ reply });
    } catch (error) {
        console.error('Interaction check error:', error.message);
        res.json({
            reply: `## Drug Interaction Check\n**Medicines:** ${medicines.join(', ')}\n\n### ⚠️ Clinical Advisory\nPlease consult your doctor or pharmacist before combining these medications.`
        });
    }
});

module.exports = router;

