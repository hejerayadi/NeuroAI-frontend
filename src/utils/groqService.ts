const API_KEY = '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';

interface EmotionData {
  time: string;
  emotion: string;
  source: string;
  type?: 'neutral' | 'positive' | 'negative' | 'warning';
}

interface BrainWaveData {
  time: string;
  text: string;
  confidence: number;
}

interface AssessmentData {
  emotionalState: string;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  insights: string[];
}

export const groqService = {
  async getPsychologicalAssessment(
    ecgHistory: EmotionData[],
    eegHistory: EmotionData[],
    speechHistory: EmotionData[],
    brainWaveHistory: BrainWaveData[]
  ): Promise<AssessmentData> {
    try {
      const prompt = `You are an AI psychological assessment expert. Your role is to analyze patient data from multiple sources and provide a comprehensive psychological assessment.

Patient Data:
1. ECG (Heart Rate) History:
${JSON.stringify(ecgHistory, null, 2)}

2. EEG (Brain Activity) History:
${JSON.stringify(eegHistory, null, 2)}

3. Speech Emotion History:
${JSON.stringify(speechHistory, null, 2)}

4. Brain Wave Speech Interpretation History:
${JSON.stringify(brainWaveHistory, null, 2)}

Based on this data, provide a psychological assessment in the following JSON format:
{
  "emotionalState": "A clear, concise, nominal description of the patient's overall emotional state that would be used as a title",
  "recommendations": ["List of 2-3 specific recommendations based on the data"],
  "riskLevel": "One of: 'low', 'medium', or 'high'",
  "insights": ["List of 2-3 key insights derived from the data patterns"]
}

Focus on:
- Patterns in emotional responses
- Consistency or inconsistency across different data sources
- Potential risk factors
- Specific, actionable recommendations
- Clear, professional language

Return ONLY the JSON object, no additional text. do'nt give it in code block format, i want the response to directly start with: { and close with: }`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 1000,
          stream: false
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response from Groq API');
      }

      console.log(content);

      // Parse the response and validate the structure
      const assessment = JSON.parse(content);
      
      // Validate the response structure
      if (!assessment.emotionalState || !Array.isArray(assessment.recommendations) || 
          !['low', 'medium', 'high'].includes(assessment.riskLevel) || !Array.isArray(assessment.insights)) {
        throw new Error('Invalid response structure from Groq API');
      }

      return assessment;
    } catch (error) {
      console.error('Error getting psychological assessment:', error);
      throw error;
    }
  }
}; 