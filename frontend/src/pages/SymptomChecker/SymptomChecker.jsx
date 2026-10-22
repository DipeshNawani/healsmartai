import { useState } from 'react';
import { FiChevronRight, FiChevronLeft, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
import './SymptomChecker.css';

const BODY_PARTS = [
    { id: 'head', label: 'Head', emoji: '🧠', symptoms: ['Headache', 'Dizziness', 'Blurred vision', 'Migraine', 'Memory issues', 'Fainting'] },
    { id: 'eyes', label: 'Eyes', emoji: '👁️', symptoms: ['Eye pain', 'Redness', 'Blurred vision', 'Watery eyes', 'Itching', 'Sensitivity to light'] },
    { id: 'ear', label: 'Ear/Nose/Throat', emoji: '👂', symptoms: ['Ear pain', 'Ringing in ear', 'Sore throat', 'Runny nose', 'Nasal congestion', 'Difficulty swallowing'] },
    { id: 'chest', label: 'Chest', emoji: '🫁', symptoms: ['Chest pain', 'Shortness of breath', 'Cough', 'Wheezing', 'Rapid heartbeat', 'Chest tightness'] },
    { id: 'stomach', label: 'Stomach', emoji: '🤢', symptoms: ['Nausea', 'Vomiting', 'Stomach pain', 'Bloating', 'Diarrhea', 'Constipation', 'Acidity', 'Loss of appetite'] },
    { id: 'skin', label: 'Skin', emoji: '🩹', symptoms: ['Rash', 'Itching', 'Redness', 'Swelling', 'Bruising', 'Dry skin', 'Acne', 'Hives'] },
    { id: 'muscles', label: 'Muscles & Joints', emoji: '💪', symptoms: ['Back pain', 'Joint pain', 'Muscle cramps', 'Stiffness', 'Swelling', 'Weakness', 'Neck pain'] },
    { id: 'general', label: 'General', emoji: '🤒', symptoms: ['Fever', 'Fatigue', 'Weight loss', 'Weight gain', 'Night sweats', 'Chills', 'Insomnia', 'Anxiety'] },
];

const SEVERITY_LEVELS = [
    { value: 'mild', label: 'Mild', emoji: '😐', desc: 'Noticeable but not affecting daily life', color: '#00D4AA' },
    { value: 'moderate', label: 'Moderate', emoji: '😟', desc: 'Affecting some activities', color: '#f39c12' },
    { value: 'severe', label: 'Severe', emoji: '😣', desc: 'Significantly impacting daily life', color: '#e74c3c' },
];

const DURATION_OPTIONS = ['Less than a day', '1-3 days', '3-7 days', '1-2 weeks', 'More than 2 weeks', 'Recurring'];

const SymptomChecker = () => {
    const { user } = useAuth();
    const [step, setStep] = useState(0); // 0=body, 1=symptoms, 2=severity, 3=duration, 4=result
    const [selectedPart, setSelectedPart] = useState(null);
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [severity, setSeverity] = useState('');
    const [duration, setDuration] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const toggleSymptom = (s) => {
        setSelectedSymptoms(prev =>
            prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
        );
    };

    const getAIAnalysis = async () => {
        setLoading(true);
        try {
            const prompt = `Patient reports the following:
- Body area: ${selectedPart?.label}
- Symptoms: ${selectedSymptoms.join(', ')}
- Severity: ${severity}
- Duration: ${duration}
${additionalInfo ? `- Additional info: ${additionalInfo}` : ''}

Please provide:
1. **Possible Conditions** (2-3 most likely)
2. **Recommended Actions** (home care + when to see doctor)
3. **Urgency Level** (Low/Medium/High/Emergency)
4. **Specialist to Consult** if needed

Keep it concise and patient-friendly.`;

            const { data } = await API.post('/ai/chat', {
                message: prompt,
                history: []
            });
            setResult(data.reply);
        } catch {
            setResult("I'm having trouble connecting to the AI service. Based on your symptoms, please consult a healthcare professional for proper diagnosis. If symptoms are severe, visit the nearest emergency room.");
        }
        setLoading(false);
        setStep(4);
    };

    const restart = () => {
        setStep(0);
        setSelectedPart(null);
        setSelectedSymptoms([]);
        setSeverity('');
        setDuration('');
        setAdditionalInfo('');
        setResult(null);
    };

    const canProceed = () => {
        if (step === 0) return selectedPart !== null;
        if (step === 1) return selectedSymptoms.length > 0;
        if (step === 2) return severity !== '';
        if (step === 3) return duration !== '';
        return false;
    };

    const steps = ['Body Part', 'Symptoms', 'Severity', 'Details', 'Analysis'];

    if (!user) {
        return (
            <div className="symptom-page">
                <div className="symptom-container">
                    <div className="sc-login">
                        <div className="sc-login-icon">🔒</div>
                        <h2>Login Required</h2>
                        <p>Sign in to use the Symptom Checker</p>
                        <Link to="/auth" className="btn btn-primary">Sign In</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="symptom-page">
            <div className="symptom-container">
                <div className="sc-header">
                    <h1>🩺 Symptom Checker</h1>
                    <p>Answer a few questions and our AI will help assess your symptoms</p>
                </div>

                {/* Progress Bar */}
                <div className="sc-progress">
                    {steps.map((s, i) => (
                        <div key={i} className={`sc-step ${i <= step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
                            <div className="step-dot">{i < step ? '✓' : i + 1}</div>
                            <span>{s}</span>
                        </div>
                    ))}
                    <div className="progress-line">
                        <div className="progress-fill" style={{ width: `${(step / 4) * 100}%` }} />
                    </div>
                </div>

                {/* Step 0: Body Part */}
                {step === 0 && (
                    <div className="sc-card">
                        <h2>Where are you experiencing the issue?</h2>
                        <p className="sc-subtitle">Select the affected area</p>
                        <div className="body-parts-grid">
                            {BODY_PARTS.map(bp => (
                                <button
                                    key={bp.id}
                                    className={`body-part-btn ${selectedPart?.id === bp.id ? 'selected' : ''}`}
                                    onClick={() => { setSelectedPart(bp); setSelectedSymptoms([]); }}
                                >
                                    <span className="bp-emoji">{bp.emoji}</span>
                                    <span className="bp-label">{bp.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 1: Symptoms */}
                {step === 1 && selectedPart && (
                    <div className="sc-card">
                        <h2>{selectedPart.emoji} {selectedPart.label} Symptoms</h2>
                        <p className="sc-subtitle">Select all symptoms you are experiencing</p>
                        <div className="symptoms-grid">
                            {selectedPart.symptoms.map(s => (
                                <button
                                    key={s}
                                    className={`symptom-btn ${selectedSymptoms.includes(s) ? 'selected' : ''}`}
                                    onClick={() => toggleSymptom(s)}
                                >
                                    {selectedSymptoms.includes(s) ? '✓ ' : ''}{s}
                                </button>
                            ))}
                        </div>
                        {selectedSymptoms.length > 0 && (
                            <div className="selected-count">{selectedSymptoms.length} symptom(s) selected</div>
                        )}
                    </div>
                )}

                {/* Step 2: Severity */}
                {step === 2 && (
                    <div className="sc-card">
                        <h2>How severe are your symptoms?</h2>
                        <p className="sc-subtitle">This helps us prioritize your assessment</p>
                        <div className="severity-options">
                            {SEVERITY_LEVELS.map(s => (
                                <button
                                    key={s.value}
                                    className={`severity-btn ${severity === s.value ? 'selected' : ''}`}
                                    onClick={() => setSeverity(s.value)}
                                    style={severity === s.value ? { borderColor: s.color, background: `${s.color}10` } : {}}
                                >
                                    <span className="sev-emoji">{s.emoji}</span>
                                    <div>
                                        <div className="sev-label" style={severity === s.value ? { color: s.color } : {}}>{s.label}</div>
                                        <div className="sev-desc">{s.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Duration & Additional */}
                {step === 3 && (
                    <div className="sc-card">
                        <h2>How long have you had these symptoms?</h2>
                        <p className="sc-subtitle">Select duration and add any other details</p>
                        <div className="duration-options">
                            {DURATION_OPTIONS.map(d => (
                                <button
                                    key={d}
                                    className={`duration-btn ${duration === d ? 'selected' : ''}`}
                                    onClick={() => setDuration(d)}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                        <div className="additional-info">
                            <label>Anything else you'd like to mention? (optional)</label>
                            <textarea
                                value={additionalInfo}
                                onChange={e => setAdditionalInfo(e.target.value)}
                                placeholder="e.g., medications you're taking, allergies, recent travel..."
                                rows={3}
                            />
                        </div>
                    </div>
                )}

                {/* Step 4: AI Analysis Result */}
                {step === 4 && (
                    <div className="sc-card result-card">
                        <div className="result-header">
                            <div className="result-icon">🩺</div>
                            <h2>AI Health Assessment</h2>
                        </div>
                        <div className="result-summary">
                            <div className="summary-chips">
                                <span className="chip">{selectedPart?.emoji} {selectedPart?.label}</span>
                                {selectedSymptoms.map(s => (
                                    <span key={s} className="chip symptom">{s}</span>
                                ))}
                                <span className="chip severity">{severity}</span>
                                <span className="chip duration">{duration}</span>
                            </div>
                        </div>
                        {loading ? (
                            <div className="analysis-loading">
                                <div className="loading-spinner" />
                                <p>Analyzing your symptoms...</p>
                            </div>
                        ) : (
                            <div className="analysis-content" dangerouslySetInnerHTML={{
                                __html: result?.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                    .replace(/^### (.*$)/gm, '<h4>$1</h4>')
                                    .replace(/^## (.*$)/gm, '<h3>$1</h3>')
                                    .replace(/^[\-•] (.*$)/gm, '<li>$1</li>')
                                    .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
                                    .replace(/((?:<li>.*?<\/li>\s*)+)/g, '<ul>$1</ul>')
                                    .replace(/\n\n/g, '<br/>')
                                    .replace(/\n/g, '<br/>') || ''
                            }} />
                        )}
                        <div className="result-disclaimer">
                            <FiAlertCircle size={14} />
                            This is AI-generated guidance, not a medical diagnosis. Always consult a healthcare professional.
                        </div>
                        <div className="result-actions">
                            <button className="sc-btn secondary" onClick={restart}>Check Another Symptom</button>
                            <Link to="/ai-doctor" className="sc-btn primary">Talk to AI Doctor</Link>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                {step < 4 && (
                    <div className="sc-nav">
                        {step > 0 && (
                            <button className="sc-btn secondary" onClick={() => setStep(step - 1)}>
                                <FiChevronLeft size={16} /> Back
                            </button>
                        )}
                        <button
                            className="sc-btn primary"
                            disabled={!canProceed()}
                            onClick={() => {
                                if (step === 3) getAIAnalysis();
                                else setStep(step + 1);
                            }}
                        >
                            {step === 3 ? 'Get AI Analysis' : 'Next'} <FiChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SymptomChecker;
