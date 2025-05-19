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
export const getRandomAssessment = () => {
  const assessments = [
    {
      emotionalState: "Mild anxiety with occasional stress responses",
      recommendations: [
        "Practice deep breathing exercises",
        "Consider regular meditation sessions",
        "Maintain consistent sleep schedule"
      ],
      riskLevel: "low" as const,
      insights: [
        "Elevated heart rate during stressful situations",
        "Normal brain wave patterns during rest",
        "Positive emotional baseline"
      ]
    },
    {
      emotionalState: "Moderate depression with anxiety symptoms",
      recommendations: [
        "Schedule regular therapy sessions",
        "Implement daily exercise routine",
        "Consider medication consultation"
      ],
      riskLevel: "medium" as const,
      insights: [
        "Consistent negative emotional patterns",
        "Irregular sleep patterns detected",
        "Reduced positive emotional responses"
      ]
    },
    {
      emotionalState: "ADHD symptoms with emotional dysregulation",
      recommendations: [
        "Implement structured daily routines",
        "Practice mindfulness techniques",
        "Consider cognitive behavioral therapy"
      ],
      riskLevel: "medium" as const,
      insights: [
        "Inconsistent attention patterns",
        "Rapid emotional fluctuations",
        "High energy levels during tasks"
      ]
    },
    {
      emotionalState: "PTSD symptoms with anxiety",
      recommendations: [
        "Seek trauma-focused therapy",
        "Practice grounding techniques",
        "Consider EMDR therapy"
      ],
      riskLevel: "high" as const,
      insights: [
        "Heightened stress responses",
        "Sleep disturbances detected",
        "Hypervigilance patterns"
      ]
    },
    {
      emotionalState: "Generalized anxiety with stress",
      recommendations: [
        "Regular exercise and physical activity",
        "Practice progressive muscle relaxation",
        "Consider anxiety management techniques"
      ],
      riskLevel: "medium" as const,
      insights: [
        "Elevated baseline anxiety",
        "Stress response to daily triggers",
        "Normal cognitive function"
      ]
    }
  ];

  return assessments[Math.floor(Math.random() * assessments.length)];
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

// Add these functions to generate realistic EEG data for different wave types

// Generate data for different EEG wave types with appropriate frequencies
export const generateEegWaveData = (type: 'gamma' | 'beta' | 'alpha' | 'theta' | 'delta', points: number = 100) => {
  // Define frequency ranges and amplitudes for each wave type
  const waveProperties = {
    gamma: { minFreq: 30, maxFreq: 80, amplitude: 0.5, noise: 0.2 },
    beta: { minFreq: 13, maxFreq: 30, amplitude: 1, noise: 0.3 },
    alpha: { minFreq: 8, maxFreq: 13, amplitude: 2, noise: 0.5 },
    theta: { minFreq: 4, maxFreq: 8, amplitude: 2.5, noise: 0.7 },
    delta: { minFreq: 0.5, maxFreq: 4, amplitude: 5, noise: 1 }
  };

  const properties = waveProperties[type];
  const data = [];
  
  // Generate a primary frequency within the proper range for this wave type
  const primaryFreq = properties.minFreq + Math.random() * (properties.maxFreq - properties.minFreq);
  // Add a secondary frequency for more realistic patterns
  const secondaryFreq = properties.minFreq + Math.random() * (properties.maxFreq - properties.minFreq);
  
  for (let i = 0; i < points; i++) {
    // Create compound wave with primary and secondary frequencies
    const primaryWave = Math.sin(i * primaryFreq * 0.01) * properties.amplitude;
    const secondaryWave = Math.sin(i * secondaryFreq * 0.02) * (properties.amplitude * 0.4);
    // Add some noise for realism
    const noise = (Math.random() - 0.5) * properties.noise;
    
    const value = primaryWave + secondaryWave + noise;
    
    data.push({
      time: `${i * 10}ms`, 
      value: value
    });
  }
  
  return data;
};

// Generate all EEG wave types at once for synchronized charts
export const generateAllEegWaves = (points: number = 100) => {
  return {
    gamma: generateEegWaveData('gamma', points),
    beta: generateEegWaveData('beta', points),
    alpha: generateEegWaveData('alpha', points),
    theta: generateEegWaveData('theta', points),
    delta: generateEegWaveData('delta', points)
  };
};
