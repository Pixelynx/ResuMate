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
      `WORK EXPERIENCE: ${exp.jobtitle} at ${exp.companyName}\n${exp.description}`
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
    console.log('Starting job fit score calculation...');
    
    // Extract job description from cover letter
    const jobdescription = coverLetter.jobdescription;
    if (!jobdescription) {
      throw new Error('Job description is required for scoring');
    }
    
    // Prepare resume content
    const resumeContent = prepareResumeContent(resume);
    console.log(`Resume content prepared (${resumeContent.length} chars)`);
    
    // Calculate weights for different resume components
    const componentScores = calculateComponentScores(resume, jobdescription);
    
    // Calculate job fit score using embeddings
    try {
      // Use OpenAI embeddings for calculation
      console.log('Starting embedding similarity calculation...');
      const similarity = await calculateEmbeddingSimilarity(resumeContent, jobdescription);
      
      // Transform similarity (0-1) to a 0-10 score
      const rawScore = Math.min(10, Math.max(0, similarity * 10));
      const score = parseFloat(rawScore.toFixed(1));
      console.log(`Job fit score calculated: ${score}/10`);
      
      // Generate personalized explanation
      console.log('Generating personalized explanation...');
      const explanation = await generateScoreExplanation(
        resume, 
        coverLetter, 
        score, 
        componentScores
      );
      
      console.log('Job fit analysis complete');
      return { 
        score: score, 
        explanation 
      };
    } catch (embeddingError) {
      console.error('Error with embeddings:', embeddingError);
      console.error('Stack trace:', embeddingError.stack);
      // Instead of falling back to keyword matching, throw an error to be caught by the outer try-catch
      throw new Error('Unable to calculate job fit score at this time. The embedding service is currently unavailable.');
    }
  } catch (error) {
    console.error('Error in job fit calculation:', error);
    return {
      score: null,
      explanation: "Unable to calculate job fit score at this time. Please try again later."
    };
  }
};

/**
 * Calculate individual component scores for a resume against a job description
 * @param {Object} resume - Resume data
 * @param {String} jobdescription - Job description text
 * @returns {Object} Component scores
 */
function calculateComponentScores(resume, jobdescription) {
  const jobDescLower = jobdescription.toLowerCase();
  
  // Calculate a basic score for skills match
  let skillsScore = 0;
  if (resume.skills && resume.skills.skills_) {
    const skills = resume.skills.skills_.split(',').map(s => s.trim().toLowerCase());
    let matchedSkills = 0;
    
    skills.forEach(skill => {
      if (jobDescLower.includes(skill)) {
        matchedSkills++;
      }
    });
    
    skillsScore = skills.length > 0 ? matchedSkills / skills.length : 0;
  }
  
  // Basic score for work experience match
  let workExperienceScore = 0;
  if (resume.workExperience && resume.workExperience.length > 0) {
    const jobtitles = resume.workExperience.map(exp => exp.jobtitle.toLowerCase());
    let titleMatches = 0;
    
    jobtitles.forEach(title => {
      if (jobDescLower.includes(title)) {
        titleMatches++;
      }
    });
    
    workExperienceScore = jobtitles.length > 0 ? titleMatches / jobtitles.length : 0;
  }
  
  // Basic score for projects match
  let projectsScore = 0;
  if (resume.projects && resume.projects.length > 0) {
    const technologies = resume.projects
      .map(proj => proj.technologies ? proj.technologies.toLowerCase() : '')
      .filter(tech => tech.length > 0);
    
    let techMatches = 0;
    technologies.forEach(tech => {
      if (jobDescLower.includes(tech)) {
        techMatches++;
      }
    });
    
    projectsScore = technologies.length > 0 ? techMatches / technologies.length : 0;
  }
  
  // Job title match
  let jobtitleScore = 0;
  if (resume.personalDetails && resume.personalDetails.title) {
    const title = resume.personalDetails.title.toLowerCase();
    jobtitleScore = jobDescLower.includes(title) ? 1.0 : 0.2;
  }
  
  // Education match
  let educationScore = 0;
  if (resume.education && resume.education.length > 0) {
    const fields = resume.education.map(edu => edu.fieldOfStudy.toLowerCase());
    let fieldMatches = 0;
    
    fields.forEach(field => {
      if (jobDescLower.includes(field)) {
        fieldMatches++;
      }
    });
    
    educationScore = fields.length > 0 ? fieldMatches / fields.length : 0;
  }
  
  return {
    skills: skillsScore,
    workExperience: workExperienceScore,
    projects: projectsScore,
    jobtitle: jobtitleScore,
    education: educationScore
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
        console.log('Requesting AI explanation for score:', score);
        
        const prompt = `
          You are an AI career advisor analyzing a job application. Based on the following information, provide personalized feedback on why the candidate received a job fit score of ${score}/10.0.

          Job Details:
          - Title: ${coverLetter.jobtitle || "Not specified"}
          - Company: ${coverLetter.company || "Not specified"}
          - Description: ${coverLetter.jobdescription || "Not provided"}

          Candidate's Resume:
          - Skills: ${resume.skills?.skills_ || "Not provided"}
          - Work Experience: ${resume.workExperience?.map(exp => `${exp.jobtitle} at ${exp.companyName}`).join(', ') || "Not provided"}
          - Projects: ${resume.projects?.map(proj => proj.title).join(', ') || "Not provided"}
          - Education: ${resume.education?.map(edu => `${edu.degree} in ${edu.fieldOfStudy}`).join(', ') || "Not provided"}

          Component Match Scores (0-1 scale):
          - Skills match: ${componentScores.skills.toFixed(2)}
          - Work Experience match: ${componentScores.workExperience.toFixed(2)}
          - Projects match: ${componentScores.projects.toFixed(2)}
          - Job Title match: ${componentScores.jobtitle.toFixed(2)}
          - Education match: ${componentScores.education.toFixed(2)}

          IMPORTANT: Provide a 3-7 sentence explanation of the job fit score with the following elements:
          1. Maintain a helpful, friendly tone throughout
          2. Specifically highlight details that make the candidate a good match for this role
          3. Provide specific, actionable suggestions for how they could improve their resume to better match this job description
          4. If their background doesn't align with the role (e.g., a frontend developer applying for a program manager position), suggest how they could highlight transferable skills or relevant experiences from their background

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