// @ts-check
const axios = require("axios");
require("dotenv").config();
const { calculateEmbeddingSimilarity } = require('./openaiService');
const { calculateComponentScores } = require('./assessment/scoring/componentScoring');
const { 
  calculateTechnicalMismatchPenalty, 
  calculateExperienceMismatchPenalty,
  applyPenalties 
} = require('./assessment/scoring/scoringPenalties');
const { classifyJob, getRelatedSkills, getCategoryWeight } = require('./assessment/analysis/jobCategories');

/** @typedef {import('./assessment/analysis/technicalKeywordLibrary').Resume} Resume */
/** @typedef {import('./assessment/analysis/jobCategories').ClassificationResult} ClassificationResult */

/** @typedef {Object} WorkExperience
 * @property {string} jobtitle
 * @property {string} companyName
 * @property {string} description
 */

/** @typedef {Object} Project
 * @property {string} title
 * @property {string} description
 * @property {string} technologies
 */

/** @typedef {Object} Education
 * @property {string} degree
 * @property {string} fieldOfStudy
 * @property {string} institutionName
 */

/** @typedef {Object} CoverLetter
 * @property {string} jobdescription
 * @property {string} [jobtitle]
 * @property {string} [company]
 */

/** @typedef {Object} JobFitResult
 * @property {number|null} score
 * @property {string} explanation
 * @property {ClassificationResult} [jobClassification]
 */

/**
 * Prepares resume content for analysis
 * @param {Resume} resume - Resume object
 * @returns {string} Formatted resume content
 */
const prepareResumeContent = (resume) => {
  const sections = [];
  
  // Add personal title if available
  if (resume.personalDetails?.title) {
    sections.push(`PROFESSIONAL TITLE: ${resume.personalDetails.title}`);
  }
  
  // Add skills
  if (resume.skills?.skills_) {
    sections.push(`SKILLS: ${resume.skills.skills_}`);
  }
  
  // Add work experience
  if (resume.workExperience?.length > 0) {
    const workExp = resume.workExperience.map(exp => 
      `WORK EXPERIENCE: ${exp.jobtitle} at ${exp.companyName}\n${exp.description}`
    ).join('\n\n');
    sections.push(workExp);
  }
  
  // Add projects
  if (resume.projects?.length > 0) {
    const projects = resume.projects.map(proj => 
      `PROJECT: ${proj.title}\n${proj.description}\nTechnologies: ${proj.technologies}`
    ).join('\n\n');
    sections.push(projects);
  }
  
  // Add education
  if (resume.education?.length > 0) {
    const education = resume.education.map(edu => 
      `EDUCATION: ${edu.degree} in ${edu.fieldOfStudy} from ${edu.institutionName}`
    ).join('\n\n');
    sections.push(education);
  }
  
  return sections.join('\n\n');
};

/**
 * Calculates job fit score based on resume content and job description
 * @param {Resume} resume - Resume object
 * @param {CoverLetter} coverLetter - Cover letter object containing job description
 * @returns {Promise<JobFitResult>} Score and explanation
 */
const calculateJobFitScore = async (resume, coverLetter) => {
  try {
    console.log('Starting job fit score calculation...');
    
    if (!coverLetter?.jobdescription) {
      throw new Error('Job description is required for scoring');
    }
    
    // Classify the job
    const jobClassification = classifyJob(
      coverLetter.jobtitle ?? '',
      coverLetter.jobdescription
    );
    console.log('Job classified as:', jobClassification);
    
    // Prepare resume content
    const resumeContent = prepareResumeContent(resume);
    console.log(`Resume content prepared (${resumeContent.length} chars)`);
    
    try {
      // Calculate component-based score with job category context
      console.log('Calculating component scores...');
      const componentResult = calculateComponentScores(
        resume, 
        coverLetter.jobdescription,
        coverLetter.jobtitle ?? ''
      );
      
      // Calculate penalties with job category context
      console.log('Calculating penalties...');
      const technicalMismatch = calculateTechnicalMismatchPenalty(
        coverLetter.jobdescription,
        resumeContent,
        coverLetter.jobtitle ?? ''
      );
      
      const experienceMismatch = calculateExperienceMismatchPenalty(
        resume.workExperience ?? [],
        coverLetter.jobdescription,
        coverLetter.jobtitle ?? ''
      );
      
      // Use embeddings as a minor adjustment factor
      console.log('Calculating embedding similarity...');
      const similarity = await calculateEmbeddingSimilarity(resumeContent, coverLetter.jobdescription);
      
      // Calculate base score (0-10)
      const baseScore = componentResult.score * 10;
      
      // Apply embedding adjustment (±20% max)
      const embeddingAdjustment = (similarity - 0.5) * 2; // Convert 0-1 to -1 to 1
      const adjustedScore = baseScore * (1 + (embeddingAdjustment * 0.2));
      
      // Apply penalties with category context
      console.log('Applying penalties...');
      const { finalScore, analysis: penaltyAnalysis } = applyPenalties(
        adjustedScore,
        {
          technicalMismatch,
          experienceMismatch
        }
      );
      
      console.log(`Final score calculated: ${finalScore}/10`);
      
      // Generate explanation with job category context
      console.log('Generating explanation...');
      const explanation = await generateScoreExplanation(
        resume,
        coverLetter,
        finalScore,
        {
          ...componentResult,
          penalties: {
            technical: technicalMismatch,
            experience: experienceMismatch
          },
          penaltyAnalysis,
          jobClassification
        }
      );
      
      return {
        score: parseFloat(finalScore.toFixed(1)),
        explanation,
        jobClassification
      };
      
    } catch (calculationError) {
      console.error('Error in score calculation:', calculationError);
      throw new Error(`Unable to calculate job fit score: ${calculationError.message}`);
    }
  } catch (error) {
    console.error('Error in job fit calculation:', error);
    return {
      score: null,
      explanation: `Unable to calculate job fit score: ${error.message}`,
      jobClassification: undefined
    };
  }
};

/**
 * Generate an explanation for the job fit score using OpenAI
 * @param {Resume} resume - The resume data
 * @param {CoverLetter} coverLetter - The cover letter data
 * @param {number} score - The calculated score
 * @param {Object} analysis - Detailed score analysis
 * @returns {Promise<string>} An explanation of the score
 */
const generateScoreExplanation = async (resume, coverLetter, score, analysis) => {
  try {
    console.log('Requesting AI explanation for score:', score);
    
    const prompt = `
      You are an AI career advisor analyzing a job application. Based on the following information, provide personalized feedback on why the candidate received a job fit score of ${score}/10.0.

      Job Details:
      - Title: ${coverLetter.jobtitle || "Not specified"}
      - Company: ${coverLetter.company || "Not specified"}
      - Description: ${coverLetter.jobdescription || "Not provided"}
      - Category: ${analysis.jobClassification?.category || "Not specified"} (Confidence: ${analysis.jobClassification?.confidence?.toFixed(2) || "N/A"})
      - Suggested Skills: ${analysis.jobClassification?.suggestedSkills?.join(', ') || "None"}

      Candidate's Resume:
      - Skills: ${resume.skills?.skills_ || "Not provided"}
      - Work Experience: ${resume.workExperience?.map(exp => `${exp.jobtitle} at ${exp.companyName}`).join(', ') || "Not provided"}
      - Projects: ${resume.projects?.map(proj => proj.title).join(', ') || "Not provided"}
      - Education: ${resume.education?.map(edu => `${edu.degree} in ${edu.fieldOfStudy}`).join(', ') || "Not provided"}

      Score Analysis:
      - Skills match: ${(analysis.componentScores.skills * 10).toFixed(1)}/10
      - Work Experience match: ${(analysis.componentScores.experience * 10).toFixed(1)}/10
      - Projects match: ${(analysis.componentScores.projects * 10).toFixed(1)}/10
      - Job Title match: ${(analysis.componentScores.jobTitle * 10).toFixed(1)}/10
      - Education match: ${(analysis.componentScores.education * 10).toFixed(1)}/10

      ${analysis.penalties.technical.hasSevereMismatch ? 
        "Note: A significant technical skills mismatch was detected between the job requirements and the candidate's background." : ""}
      
      ${analysis.penalties.experience.analysis.reason ? 
        `Experience Level Note: ${analysis.penalties.experience.analysis.reason}` : ""}

      IMPORTANT: Provide a 3-7 sentence explanation of the job fit score with the following elements:
      1. Maintain a helpful, friendly tone throughout
      2. Specifically highlight details that make the candidate a good match for this role
      3. Provide specific, actionable suggestions for how they could improve their resume to better match this job description
      4. If their background doesn't align with the role, suggest how they could highlight transferable skills or relevant experiences
      5. Consider the job category and its typical requirements in your suggestions

      Be specific about which qualifications align well with the job and which ones could be better aligned. Provide tangible examples when suggesting improvements.
    `;

    console.log('Sending request to OpenAI...');
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful career advisor providing personalized job fit analysis with constructive feedback." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 350
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const explanation = response.data.choices[0].message.content.trim();
    console.log('Successfully generated personalized explanation');
    return explanation;
  } catch (error) {
    console.error("Error generating explanation:", error.response?.data || error.message);
    console.error("Stack trace:", error.stack);
    
    return "We're unable to provide a detailed analysis of your job fit at this time. Our systems are experiencing some technical difficulties. Please try again later or contact support if the issue persists.";
  }
}

module.exports = {
  calculateJobFitScore
}; 