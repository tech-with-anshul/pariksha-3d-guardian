
/**
 * Model index file
 * 
 * This file exports all model-related components, types, and utilities
 * from the model directory to provide a clean import interface.
 */

// Export API for pose detection service
export const API_ENDPOINT = 'http://localhost:8080';

// Face detection and pose estimation types
export interface PoseDetectionResponse {
  img?: string;
  pose?: string;
  message?: string;
}

/**
 * Sends an image to the pose detection API and gets back pose information
 * @param imageData Base64 encoded image data
 * @returns Promise with pose detection results
 */
export const detectPose = async (imageData: string): Promise<PoseDetectionResponse> => {
  try {
    const response = await fetch(`${API_ENDPOINT}/predict_pose`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ img: imageData }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to detect pose');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in pose detection:', error);
    return { message: 'Failed to detect pose' };
  }
};

/**
 * Detects number of people in the frame
 * @param imageData Base64 encoded image data
 * @returns Promise with count of people detected
 */
export const detectPeople = async (imageData: string): Promise<{people: number}> => {
  try {
    const response = await fetch(`${API_ENDPOINT}/predict_people`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ img: imageData }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to detect people');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error detecting people:', error);
    return { people: 0 };
  }
};

/**
 * Save image to the server for monitoring purposes
 * @param imageData Base64 encoded image data
 * @param userId User identifier
 * @returns Promise with path to saved image
 */
export const saveImage = async (imageData: string, userId: string): Promise<{path: string}> => {
  try {
    const response = await fetch(`${API_ENDPOINT}/save_img`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ img: imageData, user: userId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save image');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving image:', error);
    return { path: '' };
  }
};
