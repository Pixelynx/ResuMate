const axios = require("axios");
require("dotenv").config();
const { calculateEmbeddingSimilarity } = require('./openaiService');

/**
 * Prepares resume content for analysis
 * @param {Object} resume - Resume object
 * @returns {String} Formatted resume content
 */
function prepareResumeContent(resume) {
  const sections = [];
  
  // Add personal title if available
  if (resume.personalDetails && resume.personalDetails.title) {
    sections.push(`PROFESSIONAL TITLE: ${resume.personalDetails.title}`);
  } else if (resume.title) {
    sections.push(`PROFESSIONAL TITLE: ${resume.title}`);
  }
  
  // Add skills
  if (resume.skills && resume.skills.skills_) {
    sections.push(`SKILLS: ${resume.skills.skills_}`);
  }
  
  // Add work experience
  if (resume.workExperience && resume.workExperience.length > 0) {
    const workExp = resume.workExperience.map(exp => 
      `WORK EXPERIENCE: ${exp.jobTitle} at ${exp.companyName}\n${exp.description}`
    ).join('\n\n');
    sections.push(workExp);
  }
  
  // Add projects
  if (resume.projects && resume.projects.length > 0) {
    const projects = resume.projects.map(proj => 
      `PROJECT: ${proj.title}\n${proj.description}\nTechnologies: ${proj.technologies}`
    ).join('\n\n');
    sections.push(projects);
  }
  
  // Add education
  if (resume.education && resume.education.length > 0) {
    const education = resume.education.map(edu => 
      `EDUCATION: ${edu.degree} in ${edu.fieldOfStudy} from ${edu.institutionName}`
    ).join('\n\n');
    sections.push(education);
  }
  
  return sections.join('\n\n');
}

/**
 * Calculates job fit score based on resume content and job description
 * @param {Object} resume - Resume object
 * @param {Object} coverLetter - Cover letter object containing job description
 * @returns {Object} Score and explanation
 */
const calculateJobFitScore = async (resume, coverLetter) => {
  try {
    // Extract job description from cover letter
    const jobDescription = coverLetter.jobDescription;
    if (!jobDescription) {
      throw new Error('Job description is required for scoring');
    }
    
    // Prepare resume content
    const resumeContent = prepareResumeContent(resume);
    
    // Calculate job fit score using embeddings
    try {
      // Use OpenAI embeddings for calculation
      const similarity = await calculateEmbeddingSimilarity(resumeContent, jobDescription);
      
      // Transform similarity (0-1) to a 0-10 score
      const rawScore = Math.min(10, Math.max(0, similarity * 10));
      const score = parseFloat(rawScore.toFixed(1));
      
      // Generate explanation based on score
      let explanation;
      if (score >= 8.5) {
        explanation = "Exceptional match! Your resume aligns extremely well with this job description. Your skills and experience make you an ideal candidate.";
      } else if (score >= 7.0) {
        explanation = "Strong match! Your qualifications align well with this position. Consider highlighting specific experiences that match key requirements.";
      } else if (score >= 5.0) {
        explanation = "Moderate match. You meet some of the job requirements, but consider enhancing your resume to better align with this position.";
      } else {
        explanation = "Limited match. Your current resume may not fully showcase the qualifications needed for this position. Consider tailoring your resume more specifically.";
      }
      
      return { 
        score: score, 
        explanation 
      };
    } catch (embeddingError) {
      console.error('Error with embeddings, falling back to keyword matching:', embeddingError);
      return calculateBasicJobFitScore(resumeContent, jobDescription);
    }
  } catch (error) {
    console.error('Error in job fit calculation:', error);
    return {
      score: 5.0,
      explanation: "Unable to accurately calculate match score due to an error. Please try again later."
    };
  }
};

/**
 * Fallback method for job fit score calculation using keywords
 * @param {String} resumeContent - Resume content
 * @param {String} jobDescription - Job description
 * @returns {Object} Score and explanation
 */
function calculateBasicJobFitScore(resumeContent, jobDescription) {
  // Convert to lowercase for matching
  const resumeLower = resumeContent.toLowerCase();
  const jobLower = jobDescription.toLowerCase();
  
  // Extract potential keywords from job description
  const jobWords = jobLower.split(/\s+/);
  const keywords = jobWords.filter(word => 
    word.length > 4 && 
    !['with', 'from', 'have', 'that', 'this', 'will', 'able', 'about'].includes(word)
  );
  
  // Count matches
  const uniqueKeywords = [...new Set(keywords)];
  let matchCount = 0;
  
  uniqueKeywords.forEach(keyword => {
    if (resumeLower.includes(keyword)) {
      matchCount++;
    }
  });
  
  // Calculate score (0-10 scale)
  const percentMatch = (matchCount / uniqueKeywords.length);
  const score = Math.min(10, Math.max(0, percentMatch * 10));
  
  // Generate explanation
  let explanation;
  if (score >= 7.0) {
    explanation = "Your resume appears to match many key terms from the job description.";
  } else if (score >= 4.0) {
    explanation = "Your resume matches some keywords from the job description, but could be better aligned.";
  } else {
    explanation = "Your resume may need to be tailored more specifically to this job description.";
  }
  
  return { 
    score: parseFloat(score.toFixed(1)), 
    explanation 
  };
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