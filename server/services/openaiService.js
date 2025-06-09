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
    
    console.log('Calculating embedding similarity between resume and job description...');
    
    // Split texts into chunks if they're too long
    const chunks1 = splitTextIntoChunks(text1);
    const chunks2 = splitTextIntoChunks(text2);
    
    // Get embeddings for all chunks
    const embeddings1 = await Promise.all(chunks1.map(chunk => getEmbedding(chunk)));
    const embeddings2 = await Promise.all(chunks2.map(chunk => getEmbedding(chunk)));
    
    // Filter out null embeddings
    const validEmbeddings1 = embeddings1.filter(Boolean);
    const validEmbeddings2 = embeddings2.filter(Boolean);
    
    if (!validEmbeddings1.length || !validEmbeddings2.length) {
      console.warn('Failed to get embeddings, using fallback keyword matching');
      return 0.5;
    }
    
    // Calculate similarity matrix between all chunks
    const similarities = [];
    for (const emb1 of validEmbeddings1) {
      for (const emb2 of validEmbeddings2) {
        similarities.push(cosineSimilarity(emb1, emb2));
      }
    }
    
    // Use the maximum similarity as the final score
    // This helps capture the best matching sections
    const maxSimilarity = Math.max(...similarities);
    
    // Calculate average of top 3 similarities for more stability
    const topSimilarities = similarities
      .sort((a, b) => b - a)
      .slice(0, 3);
    const avgTopSimilarity = topSimilarities.reduce((a, b) => a + b, 0) / topSimilarities.length;
    
    // Combine max and average with weights
    const similarity = maxSimilarity * 0.7 + avgTopSimilarity * 0.3;
    
    console.log(`Embedding similarity calculation successful: ${similarity.toFixed(4)}`);
    console.log('Similarity details:', {
      maxSimilarity: maxSimilarity.toFixed(4),
      avgTopSimilarity: avgTopSimilarity.toFixed(4),
      finalSimilarity: similarity.toFixed(4)
    });
    
    // Convert similarity (-1 to 1) to a 0 to 1 score
    // Apply a sigmoid-like transformation to emphasize mid-range differences
    return transformSimilarityScore(similarity);
  } catch (error) {
    console.error('Error calculating embedding similarity:', error);
    console.error('Stack trace:', error.stack);
    return 0.5; // Return middle value on error
  }
}

/**
 * Splits text into chunks of appropriate size for embedding
 * @param {string} text - Text to split
 * @returns {string[]} Array of text chunks
 */
function splitTextIntoChunks(text) {
  const MAX_CHUNK_LENGTH = 7000; // Slightly below OpenAI's limit
  const chunks = [];
  
  // Split text into sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  let currentChunk = '';
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > MAX_CHUNK_LENGTH) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += ' ' + sentence;
    }
  }
  
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

/**
 * Transforms raw similarity score to final score
 * @param {number} similarity - Raw similarity score (-1 to 1)
 * @returns {number} Transformed score (0 to 1)
 */
function transformSimilarityScore(similarity) {
  // Convert from -1:1 to 0:1 range
  const normalized = (similarity + 1) / 2;
  
  // Apply sigmoid-like transformation to emphasize mid-range differences
  // and de-emphasize extremes
  const k = 12; // Steepness
  const midpoint = 0.5;
  const transformed = 1 / (1 + Math.exp(-k * (normalized - midpoint)));
  
  // Rescale to use full 0-1 range
  return (transformed - 1/(1 + Math.exp(k * midpoint))) / 
         (1/(1 + Math.exp(-k * (1 - midpoint))) - 1/(1 + Math.exp(k * midpoint)));
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
    
    console.log(`Getting embedding for text (length: ${truncatedText.length} chars)`);
    
    // Call OpenAI API
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: truncatedText,
      encoding_format: "float"
    });
    
    // Return embedding vector
    if (response && response.data && response.data.length > 0 && response.data[0].embedding) {
      console.log(`Successfully retrieved embedding with ${response.data[0].embedding.length} dimensions`);
      return response.data[0].embedding;
    }
    
    console.warn('Unexpected response format from OpenAI embeddings:', JSON.stringify(response, null, 2));
    return null;
  } catch (error) {
    console.error('Error getting embedding from OpenAI:');
    if (error.response) {
      console.error('API error response:', error.response.status, error.response.data);
    } else if (error.message) {
      console.error('Error message:', error.message);
    } else {
      console.error('Unknown error:', error);
    }
    console.error('Stack trace:', error.stack);
    return null;
  }
}

module.exports = {
  calculateEmbeddingSimilarity,
  getEmbedding
}; 