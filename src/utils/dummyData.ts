// Generate dummy ECG data
export const generateEcgData = (count: number = 100) => {
  const data = [];
  let baseValue = 70;
  
  for (let i = 0; i < count; i++) {
    // Create realistic ECG pattern with P wave, QRS complex, and T wave
    let value = baseValue;
    
    // Add some randomness to base value to simulate natural heart rate changes
    if (i % 10 === 0) {
      baseValue = 70 + Math.random() * 10 - 5;
    }
    
    // Simulate ECG pattern
    if (i % 10 === 1) value = baseValue + 5; // P wave
    else if (i % 10 === 2) value = baseValue; 
    else if (i % 10 === 3) value = baseValue - 5; // Q
    else if (i % 10 === 4) value = baseValue + 20; // R peak
    else if (i % 10 === 5) value = baseValue - 10; // S
    else if (i % 10 === 6) value = baseValue;
    else if (i % 10 === 7) value = baseValue + 8; // T wave
    else if (i % 10 === 8) value = baseValue;
    
    // Add small random noise
    value += (Math.random() * 2 - 1);
    
    data.push({
      time: `${i}s`,
      value: Math.round(value * 10) / 10
    });
  }
  
  return data;
};

// Generate dummy EEG data with different wave patterns
export const generateEegData = (count: number = 100) => {
  const data = [];
  let baseValue = 0;
  
  for (let i = 0; i < count; i++) {
    // Simulate alpha, beta, delta, and theta waves by changing frequency
    let value = baseValue;
    
    // Create some randomness in base value
    if (i % 20 === 0) {
      baseValue = Math.random() * 4 - 2;
    }
    
    // Combine different wave frequencies
    value += Math.sin(i * 0.5) * 4; // Alpha waves (8-13 Hz)
    value += Math.sin(i * 1.0) * 2; // Beta waves (13-30 Hz)
    value += Math.sin(i * 0.2) * 3; // Delta waves (0.5-4 Hz)
    value += Math.sin(i * 0.3) * 2; // Theta waves (4-8 Hz)
    
    // Add small random noise
    value += (Math.random() * 1 - 0.5);
    
    data.push({
      time: `${i * 10}ms`,
      value: Math.round(value * 100) / 100
    });
  }
  
  return data;
};

// Generate dummy EOG data
export const generateEogData = (count: number) => {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push({
      time: `${i * 5}ms`,
      value: Math.cos(i * 0.05) * 3 + (Math.random() * 1.5 - 0.75)
    });
  }
  return data;
};

// Generate dummy tone data
export const generateToneData = (count: number) => {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push({
      time: `${i * 10}ms`,
      value: Math.sin(i * 0.2) * 4 + (Math.random() * 3 - 1.5)
    });
  }
  return data;
};

// Different emotion types based on analysis sources
export const emotionTypes = {
  ecg: ["Calm", "Stressed", "Anxious", "Relaxed", "Excited"],
  eeg: ["Focused", "Distracted", "Relaxed", "Confused", "Alert"],
  facial: ["Happy", "Sad", "Angry", "Neutral", "Surprised"],
  speech: ["Confident", "Uncertain", "Nervous", "Enthusiastic", "Flat"]
};

// Get a random emotion from a specific source
export const getRandomEmotion = (source: keyof typeof emotionTypes) => {
  const emotions = emotionTypes[source];
  return emotions[Math.floor(Math.random() * emotions.length)];
};

// Generate random brain wave text samples
export const brainWaveTextSamples = [
  "I feel overwhelmed by these tasks",
  "I need more time to process this",
  "The medication is helping me feel better",
  "I'm confused about what's happening",
  "The voices are quieter than before",
  "I'm having trouble focusing today",
  "I feel anxious about going outside",
  "I don't want to talk about this memory",
  "It's hard to explain how I feel right now",
  "I'm having trouble sleeping at night"
];

// Get a random brain wave text
export const getRandomBrainWaveText = () => {
  return brainWaveTextSamples[Math.floor(Math.random() * brainWaveTextSamples.length)];
};

// Assessment states
export const assessmentStates = [
  {
    state: "Mild Anxiety Disorder",
    confidence: 82,
    tags: ["Anxiety", "Stress", "Sleep Issues"],
    recommendation: "Consider cognitive behavioral therapy techniques and monitor stress triggers."
  },
  {
    state: "Depression - Moderate",
    confidence: 75,
    tags: ["Depression", "Fatigue", "Low Motivation"],
    recommendation: "Evaluate current medication effectiveness and consider adjustment after two weeks."
  },
  {
    state: "ADHD - Primarily Inattentive",
    confidence: 68,
    tags: ["Attention Deficit", "Distraction", "Impulsivity"],
    recommendation: "Structured environment strategies and potential medication review."
  },
  {
    state: "Post-Traumatic Stress",
    confidence: 87,
    tags: ["Trauma", "Hypervigilance", "Flashbacks"],
    recommendation: "Continue EMDR therapy sessions and practice grounding techniques."
  },
  {
    state: "Generalized Anxiety",
    confidence: 79,
    tags: ["Worry", "Rumination", "Physical Tension"],
    recommendation: "Mindfulness practice and evaluate efficacy of current anti-anxiety medication."
  }
];

// Get a random assessment
export const getRandomAssessment = () => {
  return assessmentStates[Math.floor(Math.random() * assessmentStates.length)];
};

// Map emotions to types for styling
export const mapEmotionToType = (emotion: string): 'neutral' | 'positive' | 'negative' | 'warning' => {
  const positiveEmotions = ['Calm', 'Relaxed', 'Happy', 'Focused', 'Confident', 'Enthusiastic'];
  const negativeEmotions = ['Stressed', 'Anxious', 'Sad', 'Angry', 'Confused', 'Nervous'];
  const warningEmotions = ['Distracted', 'Uncertain', 'Flat', 'Surprised'];
  
  if (positiveEmotions.includes(emotion)) return 'positive';
  if (negativeEmotions.includes(emotion)) return 'negative';
  if (warningEmotions.includes(emotion)) return 'warning';
  return 'neutral';
};

// Generate dummy patient data
export const getPatientData = () => {
  return {
    name: "Alex Morgan",
    id: "PT-23051",
    sessionTime: "35:42",
    status: "active" as const,
    imageUrl: "",
  };
};
