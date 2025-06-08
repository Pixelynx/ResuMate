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
/** @typedef {import('./assessment/scoring/scoringPenalties').WorkExperience} ScoringWorkExperience */

/**
 * @typedef {Object} WorkExperience
 * @property {string} jobtitle - Job title
 * @property {string} companyName - Company name
 * @property {string} description - Job description
 * @property {string} [startDate] - Start date
 * @property {string} [endDate] - End date
 */

/**
 * @typedef {Object} Project
 * @property {string} title - Project title
 * @property {string} description - Project description
 * @property {string} [technologies] - Technologies used
 */

/**
 * @typedef {Object} Education
 * @property {string} degree - Degree name
 * @property {string} fieldOfStudy - Field of study
 * @property {string} institutionName - Institution name
 */

/**
 * @typedef {Object} CoverLetter
 * @property {string} jobdescription - Job description
 * @property {string} [jobtitle] - Job title
 * @property {string} [company] - Company name
 */

/**
 * @typedef {Object} JobFitResult
 * @property {number|null} score - Job fit score
 * @property {string} explanation - Score explanation
 * @property {ClassificationResult} [jobClassification] - Job classification details
 */

/**
 * @typedef {Object} ComponentScores
 * @property {number} skills - Skills match score
 * @property {number} experience - Experience match score
 * @property {number} projects - Projects match score
 * @property {number} jobTitle - Job title match score
 * @property {number} education - Education match score
 */

/**
 * @typedef {Object} PenaltyAnalysis
 * @property {Object} technical - Technical mismatch analysis
 * @property {boolean} technical.hasSevereMismatch - Whether there's a severe technical mismatch
 * @property {Object} experience - Experience mismatch analysis
 * @property {Object} experience.analysis - Experience analysis details
 * @property {string} experience.analysis.reason - Reason for experience mismatch
 */

/**
 * @typedef {Object} AnalysisResult
 * @property {ComponentScores} componentScores - Component-wise scores
 * @property {PenaltyAnalysis} penalties - Penalty analysis
 * @property {ClassificationResult} [jobClassification] - Job classification
 */

/**
 * @typedef {Object} ExperienceMismatchResult
 * @property {number} penalty - Penalty score
 * @property {Object} analysis - Analysis details
 * @property {string} analysis.reason - Reason for mismatch
 */

/**
 * @typedef {Object} RawComponentScores
 * @property {number} [skills] - Skills match score
 * @property {number} [experience] - Experience match score
 * @property {number} [projects] - Projects match score
 * @property {number} [jobTitle] - Job title match score
 * @property {number} [education] - Education match score
 */

/**
 * @typedef {Object} RawComponentResult
 * @property {RawComponentScores} componentScores - Component-wise scores
 * @property {number} score - Overall score
 * @property {Object} analysis - Analysis details
 */

/**
 * @typedef {Object} ComponentResult
 * @property {ComponentScores} componentScores - Component-wise scores
 * @property {number} score - Overall score
 * @property {Object} analysis - Analysis details
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
      const rawComponentResult = /** @type {RawComponentResult} */ (calculateComponentScores(
        resume, 
        coverLetter.jobdescription,
        coverLetter.jobtitle ?? ''
      ));

      // Ensure proper typing of component scores
      const componentResult = {
        score: rawComponentResult.score,
        componentScores: {
          skills: rawComponentResult.componentScores.skills || 0,
          experience: rawComponentResult.componentScores.experience || 0,
          projects: rawComponentResult.componentScores.projects || 0,
          jobTitle: rawComponentResult.componentScores.jobTitle || 0,
          education: rawComponentResult.componentScores.education || 0
        },
        analysis: rawComponentResult.analysis
      };
      
      // Calculate penalties with job category context
      console.log('Calculating penalties...');
      const technicalMismatch = calculateTechnicalMismatchPenalty(
        coverLetter.jobdescription,
        resumeContent,
        coverLetter.jobtitle ?? ''
      );
      
      // Convert work experience to the expected format
      const workExperience = /** @type {ScoringWorkExperience[]} */ (
        resume.workExperience?.map(exp => ({
          ...exp,
          startDate: exp.startDate || new Date().toISOString(), // Default to current date if missing
          endDate: exp.endDate || new Date().toISOString() // Default to current date if missing
        })) || []
      );
      
      const experienceMismatch = /** @type {ExperienceMismatchResult} */ (
        calculateExperienceMismatchPenalty(
          workExperience,
          coverLetter.jobdescription,
          coverLetter.jobtitle ?? ''
        )
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
          componentScores: componentResult.componentScores,
          penalties: {
            technical: technicalMismatch,
            experience: experienceMismatch
          },
          jobClassification
        }
      );
      
      return {
        score: parseFloat(finalScore.toFixed(1)),
        explanation,
        jobClassification
      };
      
    } catch (calculationError) {
      const err = /** @type {Error} */ (calculationError);
      console.error('Error in score calculation:', err);
      throw new Error(`Unable to calculate job fit score: ${err.message}`);
    }
  } catch (error) {
    const err = /** @type {Error} */ (error);
    console.error('Error in job fit calculation:', err);
    return {
      score: null,
      explanation: `Unable to calculate job fit score: ${err.message}`,
      jobClassification: undefined
    };
  }
};

/**
 * Generate an explanation for the job fit score using OpenAI
 * @param {Resume} resume - The resume data
 * @param {CoverLetter} coverLetter - The cover letter data
 * @param {number} score - The calculated score
 * @param {AnalysisResult} analysis - Detailed score analysis
 * @returns {Promise<string>} An explanation of the score
 */
const generateScoreExplanation = async (resume, coverLetter, score, analysis) => {
  try {
    console.log('Requesting AI explanation for score:', score);
    
    const prompt = `
      You are an AI career advisor analyzing a job application. Based on the following information, provide personalized feedback on why the candidate received a job fit score of ${score.toFixed(2)}/10.00.

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

    const { default: axiosInstance } = await import('axios');
    const response = await axiosInstance.post(
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
    const err = /** @type {Error & { response?: { data?: any } }} */ (error);
    console.error("Error generating explanation:", err.response?.data || err.message);
    console.error("Stack trace:", err.stack);
    
    return "We're unable to provide a detailed analysis of your job fit at this time. Our systems are experiencing some technical difficulties. Please try again later or contact support if the issue persists.";
  }
};

module.exports = {
  calculateJobFitScore
}; 