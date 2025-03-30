const axios = require("axios");
require("dotenv").config();

/**
 * Gets the embedding for a text using OpenAI's embedding API
 * @param {string} text - The text to get an embedding for
 * @returns {Promise<number[]>} The embedding vector
 */
async function getEmbedding(text) {
    try {
        const response = await axios.post(
            "https://api.openai.com/v1/embeddings",
            { input: text, model: "text-embedding-ada-002" },
            { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } }
        );
        return response.data.data[0].embedding;
    } catch (error) {
        console.error("Error getting embedding:", error.response?.data || error.message);
        throw new Error("Failed to generate embedding");
    }
}

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} vecA - First vector
 * @param {number[]} vecB - Second vector
 * @returns {number} Cosine similarity (0-1)
 */
function cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
    const normA = Math.sqrt(vecA.reduce((sum, val) => sum + val ** 2, 0));
    const normB = Math.sqrt(vecB.reduce((sum, val) => sum + val ** 2, 0));
    return dotProduct / (normA * normB);
}

/**
 * Calculate the job fit score based on resume and job description
 * @param {Object} resume - The resume data
 * @param {Object} coverLetter - The cover letter data with job details
 * @returns {Promise<{score: number, explanation: string}>} The job fit score and explanation
 */
async function calculateJobFitScore(resume, coverLetter) {
    try {
        // Extract relevant texts from resume
        const skillsText = resume.skills && resume.skills.skills_ ? resume.skills.skills_ : '';
        const educationText = resume.education ? resume.education.map(edu => 
            `${edu.degree} in ${edu.fieldOfStudy} from ${edu.institutionName}`
        ).join('. ') : '';

        const workExperienceText = resume.workExperience ? resume.workExperience.map(exp => 
            `${exp.jobTitle} at ${exp.companyName}: ${exp.description}`
        ).join('. ') : '';

        const projectsText = resume.projects ? resume.projects.map(proj => 
            `${proj.title}: ${proj.description}. Technologies: ${proj.technologies}`
        ).join('. ') : '';

        // Job details
        const jobTitle = coverLetter.jobTitle || '';
        const jobDescription = coverLetter.jobDescription || '';

        // Get embeddings for each component
        const [
            skillsEmbedding, 
            workExperienceEmbedding, 
            projectsEmbedding,
            educationEmbedding,
            jobTitleEmbedding,
            jobDescriptionEmbedding
        ] = await Promise.all([
            getEmbedding(skillsText),
            getEmbedding(workExperienceText),
            getEmbedding(projectsText),
            getEmbedding(educationText),
            getEmbedding(jobTitle),
            getEmbedding(jobDescription)
        ]);

        // Calculate component similarities with different weights
        const skillsScore = cosineSimilarity(skillsEmbedding, jobDescriptionEmbedding) * 0.35; // 35%
        const workExperienceScore = cosineSimilarity(workExperienceEmbedding, jobDescriptionEmbedding) * 0.25; // 25%
        const projectsScore = cosineSimilarity(projectsEmbedding, jobDescriptionEmbedding) * 0.20; // 20%
        const jobTitleScore = cosineSimilarity(jobTitleEmbedding, jobDescriptionEmbedding) * 0.15; // 15%
        const educationScore = cosineSimilarity(educationEmbedding, jobDescriptionEmbedding) * 0.05; // 5%

        // Calculate total weighted score (0-1)
        const totalScore = skillsScore + workExperienceScore + projectsScore + jobTitleScore + educationScore;
        
        // Scale to 0-10 for display
        const scaledScore = (totalScore * 10).toFixed(1);

        // Get explanation from GPT
        const explanation = await generateScoreExplanation(
            resume, 
            coverLetter, 
            scaledScore, 
            {
                skills: (skillsScore / 0.35).toFixed(2),
                workExperience: (workExperienceScore / 0.25).toFixed(2),
                projects: (projectsScore / 0.20).toFixed(2),
                jobTitle: (jobTitleScore / 0.15).toFixed(2),
                education: (educationScore / 0.05).toFixed(2)
            }
        );

        return {
            score: parseFloat(scaledScore),
            explanation
        };
    } catch (error) {
        console.error("Error calculating job fit score:", error);
        throw error;
    }
}

/**
 * Generate an explanation for the job fit score using OpenAI
 * @param {Object} resume - The resume data
 * @param {Object} coverLetter - The cover letter data
 * @param {number} score - The calculated score
 * @param {Object} componentScores - Individual component scores
 * @returns {Promise<string>} An explanation of the score
 */
async function generateScoreExplanation(resume, coverLetter, score, componentScores) {
    try {
        const prompt = `
You are an AI career advisor analyzing a job application. Based on the following information, explain why the candidate received a job fit score of ${score}/10.0.

Job Details:
- Title: ${coverLetter.jobTitle}
- Company: ${coverLetter.company}
- Description: ${coverLetter.jobDescription || "Not provided"}

Candidate's Resume:
- Skills: ${resume.skills?.skills_ || "Not provided"}
- Work Experience: ${resume.workExperience?.map(exp => `${exp.jobTitle} at ${exp.companyName}`).join(', ') || "Not provided"}
- Projects: ${resume.projects?.map(proj => proj.title).join(', ') || "Not provided"}
- Education: ${resume.education?.map(edu => `${edu.degree} in ${edu.fieldOfStudy}`).join(', ') || "Not provided"}

Component Match Scores (0-1 scale):
- Skills match: ${componentScores.skills}
- Work Experience match: ${componentScores.workExperience}
- Projects match: ${componentScores.projects}
- Job Title match: ${componentScores.jobTitle}
- Education match: ${componentScores.education}

Provide a 3-4 sentence explanation of the job fit score, highlighting the candidate's strengths and areas for potential improvement. Be specific about which qualifications align well with the job and which ones could be better aligned.
`;

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a helpful career advisor providing job fit analysis." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 200
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error("Error generating explanation:", error.response?.data || error.message);
        return "Unable to generate explanation for the job fit score at this time.";
    }
}

module.exports = {
    calculateJobFitScore
}; 