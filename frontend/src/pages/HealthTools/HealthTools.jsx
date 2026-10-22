import { useState } from 'react';
import { FiActivity, FiDroplet, FiTarget, FiHeart, FiTrendingUp } from 'react-icons/fi';
import './HealthTools.css';

const HealthTools = () => {
    const [activeTool, setActiveTool] = useState('bmi');

    // BMI State
    const [bmiWeight, setBmiWeight] = useState('');
    const [bmiHeight, setBmiHeight] = useState('');
    const [bmiResult, setBmiResult] = useState(null);

    // Calorie State
    const [calAge, setCalAge] = useState('');
    const [calGender, setCalGender] = useState('male');
    const [calWeight, setCalWeight] = useState('');
    const [calHeight, setCalHeight] = useState('');
    const [calActivity, setCalActivity] = useState('moderate');
    const [calorieResult, setCalorieResult] = useState(null);

    // Water State
    const [waterWeight, setWaterWeight] = useState('');
    const [waterActivity, setWaterActivity] = useState('moderate');
    const [waterResult, setWaterResult] = useState(null);

    // Heart Rate State
    const [hrAge, setHrAge] = useState('');
    const [hrResult, setHrResult] = useState(null);

    const tools = [
        { id: 'bmi', label: 'BMI Calculator', icon: <FiTarget size={18} />, emoji: '⚖️' },
        { id: 'calorie', label: 'Calorie Needs', icon: <FiActivity size={18} />, emoji: '🔥' },
        { id: 'water', label: 'Water Intake', icon: <FiDroplet size={18} />, emoji: '💧' },
        { id: 'heart', label: 'Heart Rate Zones', icon: <FiHeart size={18} />, emoji: '❤️' },
    ];

    // BMI Calculation
    const calculateBMI = () => {
        const w = parseFloat(bmiWeight);
        const h = parseFloat(bmiHeight) / 100; // cm to m
        if (!w || !h) return;
        const bmi = w / (h * h);
        let category, color, advice;
        if (bmi < 18.5) { category = 'Underweight'; color = '#3498db'; advice = 'Consider increasing your calorie intake with nutritious foods.'; }
        else if (bmi < 25) { category = 'Normal'; color = '#00D4AA'; advice = 'Great! Maintain your healthy lifestyle.'; }
        else if (bmi < 30) { category = 'Overweight'; color = '#f39c12'; advice = 'Consider regular exercise and a balanced diet.'; }
        else { category = 'Obese'; color = '#e74c3c'; advice = 'Please consult a healthcare professional for guidance.'; }
        setBmiResult({ value: bmi.toFixed(1), category, color, advice });
    };

    // Calorie Calculation (Mifflin-St Jeor)
    const calculateCalories = () => {
        const w = parseFloat(calWeight);
        const h = parseFloat(calHeight);
        const a = parseFloat(calAge);
        if (!w || !h || !a) return;
        let bmr;
        if (calGender === 'male') bmr = 10 * w + 6.25 * h - 5 * a + 5;
        else bmr = 10 * w + 6.25 * h - 5 * a - 161;
        const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, veryActive: 1.9 };
        const tdee = bmr * multipliers[calActivity];
        setCalorieResult({
            bmr: Math.round(bmr),
            maintenance: Math.round(tdee),
            weightLoss: Math.round(tdee - 500),
            weightGain: Math.round(tdee + 500),
            protein: Math.round(w * 1.6),
            carbs: Math.round((tdee * 0.5) / 4),
            fat: Math.round((tdee * 0.25) / 9),
        });
    };

    // Water Calculation
    const calculateWater = () => {
        const w = parseFloat(waterWeight);
        if (!w) return;
        let base = w * 35; // ml per kg
        const activityMultipliers = { sedentary: 0.9, light: 1, moderate: 1.1, active: 1.2, veryActive: 1.3 };
        base *= activityMultipliers[waterActivity];
        setWaterResult({
            ml: Math.round(base),
            liters: (base / 1000).toFixed(1),
            glasses: Math.round(base / 250),
            bottles: (base / 500).toFixed(1),
        });
    };

    // Heart Rate Zones
    const calculateHeartRate = () => {
        const a = parseFloat(hrAge);
        if (!a) return;
        const maxHR = 220 - a;
        setHrResult({
            max: maxHR,
            zones: [
                { name: 'Warm Up', range: `${Math.round(maxHR * 0.5)}–${Math.round(maxHR * 0.6)}`, pct: '50-60%', color: '#3498db', desc: 'Recovery, easy pace' },
                { name: 'Fat Burn', range: `${Math.round(maxHR * 0.6)}–${Math.round(maxHR * 0.7)}`, pct: '60-70%', color: '#2ecc71', desc: 'Best for fat burning' },
                { name: 'Cardio', range: `${Math.round(maxHR * 0.7)}–${Math.round(maxHR * 0.8)}`, pct: '70-80%', color: '#f39c12', desc: 'Improves cardiovascular fitness' },
                { name: 'Peak', range: `${Math.round(maxHR * 0.8)}–${Math.round(maxHR * 0.9)}`, pct: '80-90%', color: '#e74c3c', desc: 'High intensity training' },
                { name: 'Max', range: `${Math.round(maxHR * 0.9)}–${maxHR}`, pct: '90-100%', color: '#8e44ad', desc: 'Maximum effort (short bursts)' },
            ]
        });
    };

    const getBmiGaugeRotation = () => {
        if (!bmiResult) return -90;
        const bmi = parseFloat(bmiResult.value);
        const clamped = Math.min(Math.max(bmi, 10), 45);
        return ((clamped - 10) / 35) * 180 - 90;
    };

    return (
        <div className="health-tools-page">
            <div className="health-tools-container">
                <div className="ht-header">
                    <h1>🏋️ Health Tools</h1>
                    <p>Track and calculate your health metrics with our interactive tools</p>
                </div>

                {/* Tool Selector */}
                <div className="tool-tabs">
                    {tools.map(t => (
                        <button
                            key={t.id}
                            className={`tool-tab ${activeTool === t.id ? 'active' : ''}`}
                            onClick={() => setActiveTool(t.id)}
                        >
                            {t.emoji} {t.label}
                        </button>
                    ))}
                </div>

                {/* ===== BMI Calculator ===== */}
                {activeTool === 'bmi' && (
                    <div className="tool-card">
                        <div className="tool-card-header">
                            <div className="tool-icon bmi">⚖️</div>
                            <div>
                                <h2>BMI Calculator</h2>
                                <p>Body Mass Index - measure of body fat based on height and weight</p>
                            </div>
                        </div>
                        <div className="tool-inputs">
                            <div className="input-group">
                                <label>Weight (kg)</label>
                                <input type="number" value={bmiWeight} onChange={e => setBmiWeight(e.target.value)} placeholder="e.g. 70" />
                            </div>
                            <div className="input-group">
                                <label>Height (cm)</label>
                                <input type="number" value={bmiHeight} onChange={e => setBmiHeight(e.target.value)} placeholder="e.g. 170" />
                            </div>
                        </div>
                        <button className="calculate-btn" onClick={calculateBMI}>Calculate BMI</button>

                        {bmiResult && (
                            <div className="result-section">
                                <div className="bmi-gauge-area">
                                    <div className="bmi-gauge">
                                        <div className="gauge-bg">
                                            <div className="gauge-fill under" />
                                            <div className="gauge-fill normal" />
                                            <div className="gauge-fill over" />
                                            <div className="gauge-fill obese" />
                                        </div>
                                        <div className="gauge-needle" style={{ transform: `rotate(${getBmiGaugeRotation()}deg)` }} />
                                        <div className="gauge-center">
                                            <div className="gauge-value" style={{ color: bmiResult.color }}>{bmiResult.value}</div>
                                            <div className="gauge-label">{bmiResult.category}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bmi-categories">
                                    <div className="bmi-cat"><span className="dot" style={{ background: '#3498db' }} /> Underweight &lt;18.5</div>
                                    <div className="bmi-cat"><span className="dot" style={{ background: '#00D4AA' }} /> Normal 18.5–24.9</div>
                                    <div className="bmi-cat"><span className="dot" style={{ background: '#f39c12' }} /> Overweight 25–29.9</div>
                                    <div className="bmi-cat"><span className="dot" style={{ background: '#e74c3c' }} /> Obese ≥30</div>
                                </div>
                                <div className="result-advice">
                                    <FiTrendingUp size={16} /> {bmiResult.advice}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ===== Calorie Calculator ===== */}
                {activeTool === 'calorie' && (
                    <div className="tool-card">
                        <div className="tool-card-header">
                            <div className="tool-icon calorie">🔥</div>
                            <div>
                                <h2>Daily Calorie Calculator</h2>
                                <p>Mifflin-St Jeor equation for accurate calorie estimation</p>
                            </div>
                        </div>
                        <div className="tool-inputs">
                            <div className="input-group">
                                <label>Age</label>
                                <input type="number" value={calAge} onChange={e => setCalAge(e.target.value)} placeholder="e.g. 25" />
                            </div>
                            <div className="input-group">
                                <label>Gender</label>
                                <select value={calGender} onChange={e => setCalGender(e.target.value)}>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Weight (kg)</label>
                                <input type="number" value={calWeight} onChange={e => setCalWeight(e.target.value)} placeholder="e.g. 70" />
                            </div>
                            <div className="input-group">
                                <label>Height (cm)</label>
                                <input type="number" value={calHeight} onChange={e => setCalHeight(e.target.value)} placeholder="e.g. 170" />
                            </div>
                            <div className="input-group full">
                                <label>Activity Level</label>
                                <select value={calActivity} onChange={e => setCalActivity(e.target.value)}>
                                    <option value="sedentary">Sedentary (desk job)</option>
                                    <option value="light">Light (1-3 days/week)</option>
                                    <option value="moderate">Moderate (3-5 days/week)</option>
                                    <option value="active">Active (6-7 days/week)</option>
                                    <option value="veryActive">Very Active (athlete)</option>
                                </select>
                            </div>
                        </div>
                        <button className="calculate-btn" onClick={calculateCalories}>Calculate Calories</button>

                        {calorieResult && (
                            <div className="result-section">
                                <div className="calorie-cards">
                                    <div className="cal-card bmr">
                                        <div className="cal-icon">🔋</div>
                                        <div className="cal-value">{calorieResult.bmr}</div>
                                        <div className="cal-label">BMR (Base)</div>
                                    </div>
                                    <div className="cal-card maintain">
                                        <div className="cal-icon">⚖️</div>
                                        <div className="cal-value">{calorieResult.maintenance}</div>
                                        <div className="cal-label">Maintain</div>
                                    </div>
                                    <div className="cal-card lose">
                                        <div className="cal-icon">📉</div>
                                        <div className="cal-value">{calorieResult.weightLoss}</div>
                                        <div className="cal-label">Lose Weight</div>
                                    </div>
                                    <div className="cal-card gain">
                                        <div className="cal-icon">📈</div>
                                        <div className="cal-value">{calorieResult.weightGain}</div>
                                        <div className="cal-label">Gain Weight</div>
                                    </div>
                                </div>
                                <div className="macro-split">
                                    <h4>Recommended Daily Macros</h4>
                                    <div className="macro-bars">
                                        <div className="macro-bar">
                                            <div className="macro-info"><span className="macro-name">🥩 Protein</span><span>{calorieResult.protein}g</span></div>
                                            <div className="bar-bg"><div className="bar-fill protein" style={{ width: `${Math.min((calorieResult.protein / 200) * 100, 100)}%` }} /></div>
                                        </div>
                                        <div className="macro-bar">
                                            <div className="macro-info"><span className="macro-name">🍞 Carbs</span><span>{calorieResult.carbs}g</span></div>
                                            <div className="bar-bg"><div className="bar-fill carbs" style={{ width: `${Math.min((calorieResult.carbs / 400) * 100, 100)}%` }} /></div>
                                        </div>
                                        <div className="macro-bar">
                                            <div className="macro-info"><span className="macro-name">🥑 Fat</span><span>{calorieResult.fat}g</span></div>
                                            <div className="bar-bg"><div className="bar-fill fat" style={{ width: `${Math.min((calorieResult.fat / 120) * 100, 100)}%` }} /></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ===== Water Intake ===== */}
                {activeTool === 'water' && (
                    <div className="tool-card">
                        <div className="tool-card-header">
                            <div className="tool-icon water">💧</div>
                            <div>
                                <h2>Daily Water Intake</h2>
                                <p>How much water you need based on your weight and activity</p>
                            </div>
                        </div>
                        <div className="tool-inputs">
                            <div className="input-group">
                                <label>Weight (kg)</label>
                                <input type="number" value={waterWeight} onChange={e => setWaterWeight(e.target.value)} placeholder="e.g. 70" />
                            </div>
                            <div className="input-group">
                                <label>Activity Level</label>
                                <select value={waterActivity} onChange={e => setWaterActivity(e.target.value)}>
                                    <option value="sedentary">Sedentary</option>
                                    <option value="light">Light Activity</option>
                                    <option value="moderate">Moderate</option>
                                    <option value="active">Active</option>
                                    <option value="veryActive">Very Active</option>
                                </select>
                            </div>
                        </div>
                        <button className="calculate-btn" onClick={calculateWater}>Calculate Water Intake</button>

                        {waterResult && (
                            <div className="result-section">
                                <div className="water-result">
                                    <div className="water-visual">
                                        <div className="water-bottle">
                                            <div className="water-level" style={{ height: `${Math.min((parseFloat(waterResult.liters) / 4) * 100, 100)}%` }} />
                                            <div className="water-amount">{waterResult.liters}L</div>
                                        </div>
                                    </div>
                                    <div className="water-details">
                                        <div className="water-stat">
                                            <span className="ws-icon">💧</span>
                                            <div><strong>{waterResult.ml} ml</strong><span>Total daily</span></div>
                                        </div>
                                        <div className="water-stat">
                                            <span className="ws-icon">🥛</span>
                                            <div><strong>{waterResult.glasses} glasses</strong><span>250ml each</span></div>
                                        </div>
                                        <div className="water-stat">
                                            <span className="ws-icon">🍶</span>
                                            <div><strong>{waterResult.bottles} bottles</strong><span>500ml each</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ===== Heart Rate Zones ===== */}
                {activeTool === 'heart' && (
                    <div className="tool-card">
                        <div className="tool-card-header">
                            <div className="tool-icon heart">❤️</div>
                            <div>
                                <h2>Heart Rate Zones</h2>
                                <p>Training zones based on your maximum heart rate</p>
                            </div>
                        </div>
                        <div className="tool-inputs">
                            <div className="input-group">
                                <label>Age</label>
                                <input type="number" value={hrAge} onChange={e => setHrAge(e.target.value)} placeholder="e.g. 25" />
                            </div>
                        </div>
                        <button className="calculate-btn" onClick={calculateHeartRate}>Calculate Zones</button>

                        {hrResult && (
                            <div className="result-section">
                                <div className="hr-max">Max Heart Rate: <strong>{hrResult.max} BPM</strong></div>
                                <div className="hr-zones">
                                    {hrResult.zones.map((z, i) => (
                                        <div key={i} className="hr-zone" style={{ borderLeftColor: z.color }}>
                                            <div className="zone-header">
                                                <span className="zone-name" style={{ color: z.color }}>{z.name}</span>
                                                <span className="zone-pct">{z.pct}</span>
                                            </div>
                                            <div className="zone-range">{z.range} BPM</div>
                                            <div className="zone-desc">{z.desc}</div>
                                            <div className="zone-bar-bg">
                                                <div className="zone-bar-fill" style={{ width: `${20 + i * 20}%`, background: z.color }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HealthTools;
