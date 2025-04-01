const OpenAI = require('openai');
require('dotenv').config();
// Configure OpenAI API connection
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} v1 - First vector
 * @param {number[]} v2 - Second vector
 * @returns {number} Cosine similarity (between -1 and 1)
 */
function cosineSimilarity(v1, v2) {
  // Calculate dot product
  let dotProduct = 0;
  for (let i = 0; i < v1.length; i++) {
    dotProduct += v1[i] * v2[i];
  }
  
  // Calculate magnitudes
  let v1Magnitude = 0;
  let v2Magnitude = 0;
  for (let i = 0; i < v1.length; i++) {
    v1Magnitude += v1[i] * v1[i];
    v2Magnitude += v2[i] * v2[i];
  }
  v1Magnitude = Math.sqrt(v1Magnitude);
  v2Magnitude = Math.sqrt(v2Magnitude);
  
  // Calculate cosine similarity
  return dotProduct / (v1Magnitude * v2Magnitude);
}

/**
 * Calculate embedding similarity between two texts using OpenAI embeddings
 * @param {string} text1 - First text
 * @param {string} text2 - Second text
 * @returns {Promise<number>} Similarity score between 0 and 1
 */
async function calculateEmbeddingSimilarity(text1, text2) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY not configured');
      return 0.5; // Return middle value if API key not set
    }
    
    // Get embeddings for both texts
    const [embedding1, embedding2] = await Promise.all([
      getEmbedding(text1),
      getEmbedding(text2)
    ]);
    
    if (!embedding1 || !embedding2) {
      console.warn('Failed to get embeddings');
      return 0.5;
    }
    
    // Calculate similarity
    const similarity = cosineSimilarity(embedding1, embedding2);
    
    // Convert similarity (-1 to 1) to a 0 to 1 score
    // Typically for text embeddings, similarity will be positive
    return (similarity + 1) / 2;
  } catch (error) {
    console.error('Error calculating embedding similarity:', error);
    return 0.5; // Return middle value on error
  }
}

/**
 * Get embedding vector for text using OpenAI API
 * @param {string} text - Text to embed
 * @returns {Promise<number[]|null>} Embedding vector or null on error
 */
async function getEmbedding(text) {
  try {
    // Truncate text if too long (OpenAI limits input length)
    const truncatedText = text.substring(0, 8000);
    
    // Call OpenAI API
    const response = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: truncatedText,
    });
    
    // Return embedding vector
    if (response.data && 
        response.data.data && 
        response.data.data[0] && 
        response.data.data[0].embedding) {
      return response.data.data[0].embedding;
    }
    
    console.warn('Unexpected response format from OpenAI embeddings:', response);
    return null;
  } catch (error) {
    console.error('Error getting embedding from OpenAI:', error?.response?.data || error.message);
    return null;
  }
}

module.exports = {
  calculateEmbeddingSimilarity,
  getEmbedding
}; 