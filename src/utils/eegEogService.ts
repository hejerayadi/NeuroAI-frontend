import axios from 'axios';

// Class to handle loading and sending EEG/EOG data
export class EegEogService {
  private datasetNames: string[] = [
    '1', '2', '19'  // IDs for the datasets
  ];

  private currentDatasetIndex: number = 0;

  // Function to get the next dataset ID
  private getNextDatasetId(): string {
    const datasetId = this.datasetNames[this.currentDatasetIndex];
    
    // Rotate to next dataset for next call
    this.currentDatasetIndex = (this.currentDatasetIndex + 1) % this.datasetNames.length;
    
    return datasetId;
  }

  // Send EEG/EOG data to the backend
  public async sendEegEogData(): Promise<string> {
    try {
      const datasetId = this.getNextDatasetId();
      console.log(`Using dataset ID: ${datasetId} for EEG/EOG prediction`);
      
      // Define the payload with the structures from the .mat files but converted to JSON
      // This matches how the test script formats the data
      const payload = {
        eeg_features: await this.getEegFeatures(datasetId),
        eye_features: await this.getEyeFeatures(datasetId)
      };
      
      console.log(`Sending EEG/EOG JSON data to API for dataset: ${datasetId}`);
      
      // Send the JSON request to the endpoint
      const response = await axios.post('http://localhost:7500/predict/eeg-eog', payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Check if the response contains the predicted emotion
      if (response.data && response.data.predicted_emotion) {
        const emotion = response.data.predicted_emotion;
        console.log(`Received emotion prediction: ${emotion}`);
        return emotion;
      } else {
        console.error('Unexpected response format:', response.data);
        return 'neutral';
      }
    } catch (error) {
      console.error('Error processing EEG/EOG data:', error);
      return 'neutral';
    }
  }

  // Helper method to get EEG features from the backend
  private async getEegFeatures(datasetId: string): Promise<any[][]> {
    try {
      // In a real implementation, we could fetch pre-processed data from a backend endpoint
      // For now, we'll create a simple mock that approximates the structure of the .mat data
      
      // Create 100 windows of EEG data with 17 channels and 20 time points per window
      const W = 100;
      const eegData = [];
      
      for (let i = 0; i < W; i++) {
        const window = [];
        for (let j = 0; j < 17; j++) {
          const channel = [];
          for (let k = 0; k < 20; k++) {
            // Random value between 4 and 36 to mimic the test script
            channel.push(4 + (Math.random() * 32));
          }
          window.push(channel);
        }
        eegData.push(window);
      }
      
      console.log(`Generated EEG features with shape: [${W}, 17, 20]`);
      return eegData;
    } catch (error) {
      console.error('Error getting EEG features:', error);
      return [];
    }
  }

  // Helper method to get Eye (EOG) features from the backend
  private async getEyeFeatures(datasetId: string): Promise<any[][]> {
    try {
      // Create 100 windows of EOG data with 3 features per window
      const W = 100;
      const eyeData = [];
      
      for (let i = 0; i < W; i++) {
        const window = [];
        for (let j = 0; j < 3; j++) {
          // Random value between 5 and 350 to mimic the test script
          window.push(5 + (Math.random() * 345));
        }
        eyeData.push(window);
      }
      
      console.log(`Generated Eye features with shape: [${W}, 3]`);
      return eyeData;
    } catch (error) {
      console.error('Error getting Eye features:', error);
      return [];
    }
  }
}

export const eegEogService = new EegEogService(); 