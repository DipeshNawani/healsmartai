import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSend, FiTrash2, FiPlus, FiClock, FiMenu, FiX, FiMic } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import './AiDoctor.css';

const AiDoctor = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [showSidebar, setShowSidebar] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const saveTimeoutRef = useRef(null);
    const recognitionRef = useRef(null);

    const suggestions = [
        "I have a headache",
        "I'm feeling feverish",
        "My stomach hurts",
        "I have a sore throat",
        "I feel tired all the time",
        "I have a skin rash",
    ];

    // Load sessions on mount
    useEffect(() => {
        if (user) loadSessions();
    }, [user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = '24px';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [input]);

    const loadSessions = async () => {
        try {
            const { data } = await API.get('/ai/sessions');
            setSessions(data);
        } catch (err) {
            console.error('Failed to load sessions:', err);
        }
    };

    const loadSession = async (sessionId) => {
        try {
            const { data } = await API.get(`/ai/sessions/${sessionId}`);
            setMessages(data.messages || []);
            setActiveSessionId(sessionId);
            setShowSidebar(false);
        } catch (err) {
            console.error('Failed to load session:', err);
        }
    };

    const createNewChat = async () => {
        try {
            const { data } = await API.post('/ai/sessions');
            setActiveSessionId(data._id);
            setMessages([]);
            await loadSessions();
            setShowSidebar(false);
        } catch (err) {
            console.error('Failed to create session:', err);
        }
    };

    const saveSession = async (msgs) => {
        if (!activeSessionId || msgs.length === 0) return;
        try {
            await API.put(`/ai/sessions/${activeSessionId}`, { messages: msgs });
            loadSessions(); // Refresh sidebar
        } catch (err) {
            console.error('Failed to save session:', err);
        }
    };

    // Debounced save
    const debouncedSave = (msgs) => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => saveSession(msgs), 1000);
    };

    const deleteSession = async (sessionId, e) => {
        e.stopPropagation();
        try {
            await API.delete(`/ai/sessions/${sessionId}`);
            if (activeSessionId === sessionId) {
                setActiveSessionId(null);
                setMessages([]);
            }
            await loadSessions();
        } catch (err) {
            console.error('Failed to delete session:', err);
        }
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;
        if (diff < 86400000) return 'Today';
        if (diff < 172800000) return 'Yesterday';
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    // Markdown renderer for AI responses
    const renderMarkdown = (text) => {
        if (!text) return '';

        let html = text
            // Horizontal rules (--- or ***)
            .replace(/^---+$/gm, '<hr class="md-hr"/>')
            .replace(/^\*\*\*+$/gm, '<hr class="md-hr"/>')
            // Headers
            .replace(/^#### (.*$)/gm, '<h4 class="md-h4">$1</h4>')
            .replace(/^### (.*$)/gm, '<h4 class="md-h4">$1</h4>')
            .replace(/^## (.*$)/gm, '<h3 class="md-h3">$1</h3>')
            // Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Inline code
            .replace(/`(.*?)`/g, '<code>$1</code>')
            // Blockquotes
            .replace(/^> (.*$)/gm, '<div class="md-quote">$1</div>')
            // Unordered lists (- or •)
            .replace(/^[\-•] (.*$)/gm, '<li>$1</li>')
            // Ordered lists
            .replace(/^\d+\. (.*$)/gm, '<li class="md-ol">$1</li>')
            // Line breaks
            .replace(/\n\n/g, '<br/>')
            .replace(/\n/g, '<br/>');

        // Wrap consecutive <li> tags in <ul>
        html = html.replace(/((?:<li[^>]*>.*?<\/li>(?:<br\/?>)?)+)/g, '<ul class="md-list">$1</ul>');
        // Clean up br tags inside ul
        html = html.replace(/<ul[^>]*>(.*?)<\/ul>/gs, (match, content) => {
            return '<ul class="md-list">' + content.replace(/<br\/?>/g, '') + '</ul>';
        });

        return html;
    };

    const sendMessage = async (text) => {
        const messageText = text || input.trim();
        if (!messageText || loading) return;

        // If no active session, create one first
        let sessionId = activeSessionId;
        if (!sessionId) {
            try {
                const { data } = await API.post('/ai/sessions');
                sessionId = data._id;
                setActiveSessionId(data._id);
            } catch (err) {
                console.error('Failed to create session:', err);
            }
        }

        const userMessage = {
            role: 'user',
            content: messageText,
            timestamp: new Date()
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            const history = messages.map(m => ({
                role: m.role,
                content: m.content
            }));

            const { data } = await API.post('/ai/chat', {
                message: messageText,
                history
            });

            const aiMessage = {
                role: 'ai',
                content: data.reply,
                timestamp: data.timestamp || new Date()
            };

            const updatedMessages = [...newMessages, aiMessage];
            setMessages(updatedMessages);

            // Save to DB
            if (sessionId) {
                setActiveSessionId(sessionId);
                debouncedSave(updatedMessages);
            }
        } catch (error) {
            const errorMessage = {
                role: 'ai',
                content: "Something went wrong on my end. Please try again in a moment.",
                timestamp: new Date()
            };
            const updatedMessages = [...newMessages, errorMessage];
            setMessages(updatedMessages);
            if (sessionId) debouncedSave(updatedMessages);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearChat = () => {
        setMessages([]);
        setActiveSessionId(null);
    };

    // If not logged in, show login prompt
    if (!user) {
        return (
            <div className="ai-doctor-page">
                <div className="chat-container">
                    <div className="chat-welcome">
                        <div className="welcome-icon" style={{ fontSize: '22px' }}>&#128274;</div>
                        <h2>Sign in to continue</h2>
                        <p>You need an account to use the AI Doctor. It's free to create one.</p>
                        <Link to="/auth" className="btn btn-primary">Sign In</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="ai-doctor-page">
            {/* Chat History Sidebar */}
            <div className={`chat-sidebar ${showSidebar ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h3><FiClock size={16} /> Chat History</h3>
                    <button className="sidebar-close" onClick={() => setShowSidebar(false)}>
                        <FiX size={18} />
                    </button>
                </div>
                <button className="new-chat-btn" onClick={createNewChat}>
                    <FiPlus size={16} />
                    <span>New Consultation</span>
                </button>
                <div className="session-list">
                    {sessions.length === 0 ? (
                        <div className="no-sessions">No chat history yet</div>
                    ) : (
                        sessions.map(s => (
                            <div
                                key={s._id}
                                className={`session-item ${activeSessionId === s._id ? 'active' : ''}`}
                                onClick={() => loadSession(s._id)}
                            >
                                <div className="session-info">
                                    <div className="session-title">{s.title}</div>
                                    <div className="session-meta">
                                        {formatDate(s.updatedAt)} · {s.messageCount} msgs
                                    </div>
                                </div>
                                <button
                                    className="session-delete"
                                    onClick={(e) => deleteSession(s._id, e)}
                                    title="Delete"
                                >
                                    <FiTrash2 size={13} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Sidebar overlay for mobile */}
            {showSidebar && <div className="sidebar-overlay" onClick={() => setShowSidebar(false)} />}

            <div className="chat-container">
                {/* Chat Header */}
                <div className="chat-header">
                    <button className="history-toggle" onClick={() => setShowSidebar(true)}>
                        <FiMenu size={18} />
                    </button>
                    <div className="chat-header-avatar">🤖</div>
                    <div className="chat-header-info">
                        <h2>AI Doctor</h2>
                        <div className="chat-header-status">
                            <span className="online-dot" />
                            Online - Ready to help
                        </div>
                    </div>
                    {messages.length > 0 && (
                        <button className="chat-clear-btn" onClick={clearChat}>
                            <FiPlus size={14} />
                            <span>New Chat</span>
                        </button>
                    )}
                </div>

                {/* Messages */}
                {messages.length === 0 ? (
                    <div className="chat-welcome">
                        <div className="welcome-icon">+</div>
                        <h2>What's going on?</h2>
                        <p>
                            Tell me your symptoms and I'll walk you through what it might be, what you can try, and whether you should see a doctor.
                        </p>
                        <div className="chat-suggestions">
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    className="suggestion-chip"
                                    onClick={() => sendMessage(s)}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="chat-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`chat-message ${msg.role}`}>
                                <div className="msg-avatar">
                                    {msg.role === 'ai' ? '🤖' : getInitials(user?.name)}
                                </div>
                                <div>
                                    <div
                                        className="msg-bubble"
                                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                                    />
                                    <div className="msg-time">{formatTime(msg.timestamp)}</div>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="typing-indicator">
                                <div className="msg-avatar">🤖</div>
                                <div className="typing-dots">
                                    <span />
                                    <span />
                                    <span />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                )}

                {/* Input */}
                <div className="chat-input-area">
                    <button
                        className={`voice-btn ${isListening ? 'listening' : ''}`}
                        onClick={() => {
                            if (isListening) {
                                recognitionRef.current?.stop();
                                setIsListening(false);
                            } else {
                                const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
                                if (!SR) return;
                                const recognition = new SR();
                                recognition.continuous = false;
                                recognition.interimResults = true;
                                recognition.lang = 'en-IN';
                                recognitionRef.current = recognition;
                                recognition.onresult = (e) => {
                                    const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
                                    setInput(transcript);
                                };
                                recognition.onend = () => setIsListening(false);
                                recognition.start();
                                setIsListening(true);
                            }
                        }}
                        title="Voice input"
                    >
                        <FiMic size={18} />
                    </button>
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Describe your symptoms..."
                        rows={1}
                        disabled={loading}
                    />
                    <button
                        className="chat-send-btn"
                        onClick={() => sendMessage()}
                        disabled={!input.trim() || loading}
                    >
                        <FiSend />
                    </button>
                </div>

                <div className="chat-disclaimer">
                    This is general health guidance, not a diagnosis. Always consult a real doctor for medical advice.
                </div>
            </div>
        </div>
    );
};

export default AiDoctor;
