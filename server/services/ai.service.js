const OpenAI = require('openai');
const { prioritizeContent } = require('./scoring/contentAnalysis');

/**
 * @typedef {Object} ResumeData
 * @property {Object} [personalDetails]
 * @property {string} [firstName]
 * @property {string} [lastName]
 * @property {string} [title]
 * @property {Array<Object>} [workExperience]
 * @property {Array<Object>} [education]
 * @property {Object} [skills]
 * @property {Array<Object>} [projects]
 */

class AIService {
    constructor() {
        try {
            // Only initialize OpenAI if we're not in test mode
            if (process.env.NODE_ENV !== 'test') {
                this.openai = new OpenAI({
                    apiKey: process.env.OPENAI_API_KEY
                });
            }
        } catch (error) {
            console.warn('OpenAI client initialization failed:', error.message);
            console.warn('API functionality will be limited to prompt generation only.');
        }
        
        this.cache = new Map();
        this.retryLimit = 3;
        this.retryDelay = 1000;
        this.isTestMode = process.env.NODE_ENV === 'test';
    }

    async generateCoverLetter(resumeData, jobDetails, options = {}) {
        // If in test mode and no mock mode specified, return test output
        if (this.isTestMode && !options.mockMode) {
            return "This is a mock cover letter for testing purposes. The real AI service is not being called.";
        }
        
        const cacheKey = this.generateCacheKey(resumeData, jobDetails);
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            console.log('Returning cached cover letter');
            return this.cache.get(cacheKey);
        }

        try {
            // Preprocess data to remove empty fields and find relevant skills
            const processedResumeData = this.preprocessResumeData(resumeData, jobDetails);
            const relevantSkills = this.extractRelevantSkills(processedResumeData.skills?.skills_, jobDetails);
            
            // Construct the optimized prompt
            const prompt = this.constructPrompt(processedResumeData, jobDetails, relevantSkills, options);
            
            // If in test mode with mockMode=true, just return the prompt
            if (this.isTestMode && options.mockMode === 'prompt') {
                return prompt;
            }
            
            // Generate the cover letter
            const response = await this.makeAPIRequestWithRetry(prompt);
            
            // Cache the successful response
            this.cache.set(cacheKey, response);
            return response;
        } catch (error) {
            console.error('Error generating cover letter:', error);
            throw this.handleError(error);
        }
    }

    // Preprocess resume data to remove empty fields and null values
    preprocessResumeData(resumeData, jobDetails) {
        // Deep clone the resume data to avoid modifying the original
        const processed = JSON.parse(JSON.stringify(resumeData));
        
        // Clean up personal details
        if (processed.personalDetails) {
            processed.firstName = processed.personalDetails.firstName || processed.firstName || '';
            processed.lastName = processed.personalDetails.lastName || processed.lastName || '';
            processed.title = processed.personalDetails.title || processed.title || '';
        }

        // Clean up work experience
        if (processed.workExperience && Array.isArray(processed.workExperience)) {
            processed.workExperience = processed.workExperience
                .filter(exp => exp && exp.jobTitle && exp.company)
                .map(exp => ({
                    ...exp,
                    description: exp.description || ''
                }));
        } else {
            processed.workExperience = [];
        }

        // Clean up education
        if (processed.education && Array.isArray(processed.education)) {
            processed.education = processed.education
                .filter(edu => edu && (edu.institutionName || edu.degree || edu.fieldOfStudy));
        } else {
            processed.education = [];
        }

        return processed;
    }

    // Extract skills that might be relevant to the job
    extractRelevantSkills(skills, jobDetails) {
        if (!skills || typeof skills !== 'string' || !jobDetails.jobDescription) {
            return skills || '';
        }

        // Split skills into an array
        const skillArray = skills.split(',').map(skill => skill.trim());
        
        // If the job description is available, try to find relevant skills
        if (jobDetails.jobDescription) {
            const jobDescLower = jobDetails.jobDescription.toLowerCase();
            
            // Find skills mentioned in the job description
            const relevantSkills = skillArray.filter(skill => 
                jobDescLower.includes(skill.toLowerCase())
            );
            
            // If we found relevant skills, prioritize them
            if (relevantSkills.length > 0) {
                // Return relevant skills first, then add a few others if needed
                const otherSkills = skillArray.filter(skill => 
                    !relevantSkills.includes(skill)
                );
                
                // Combine relevant skills with some others, up to 5 total
                const combinedSkills = [
                    ...relevantSkills,
                    ...otherSkills.slice(0, Math.max(0, 5 - relevantSkills.length))
                ];
                
                return combinedSkills.join(', ');
            }
        }
        
        // If no relevant skills found or no job description provided,
        // return up to 5 skills from the original list
        return skillArray.slice(0, 5).join(', ');
    }

    constructPrompt(resumeData, jobDetails, relevantSkills, options = {}) {
        // Get content prioritization
        const contentPriority = prioritizeContent(resumeData, jobDetails);
        
        // Build instructions with prioritized content guidance
        const systemInstructions = `
            IMPORTANT INSTRUCTIONS FOR COVER LETTER GENERATION:
            1. Only include information that is actually provided in the data below.
            2. NEVER use placeholder text like [Previous Company], [Degree], or [Key Skill].
            3. Follow this content priority structure:
               ${contentPriority.suggestedOrder.map(section => 
                 `- ${section} (${contentPriority.sections[section].allocationPercentage}% focus)`
               ).join('\n               ')}
            4. For each section priority:
               - PRIMARY (${contentPriority.sections[contentPriority.suggestedOrder[0]]?.focusPoints.join(', ')})
               - SECONDARY (${contentPriority.sections[contentPriority.suggestedOrder[1]]?.focusPoints.join(', ')})
               - MINIMAL (Brief mention if relevant)
            5. Use suggested transitions naturally:
               ${Object.entries(contentPriority.sections)
                 .filter(([,priority]) => priority.tier === 'PRIMARY')
                 .map(([section, priority]) => 
                   `- ${section}: "${priority.suggestedTransitions[0]}"`
                 ).join('\n               ')}
            6. Emphasize these keywords where relevant:
               ${Object.entries(contentPriority.emphasisKeywords)
                 .filter(([,keywords]) => keywords.length > 0)
                 .map(([section, keywords]) => 
                   `- ${section}: ${keywords.join(', ')}`
                 ).join('\n               ')}
            `;

        const {
            firstName = '',
            lastName = '',
            title = '',
            workExperience = [],
            education = []
        } = resumeData;

        const hasName = firstName && lastName;
        const hasTitle = Boolean(title);
        const hasSkills = Boolean(relevantSkills);
        const hasWorkExperience = workExperience.length > 0;
        const hasEducation = education.length > 0;
        const hasJobDescription = Boolean(jobDetails.jobDescription);

        // Build candidate details section only with available information
        const candidateDetails = [
            'Candidate Details:',
            hasName ? `- Name: ${firstName} ${lastName}` : '',
            hasTitle ? `- Current Title: ${title}` : '',
            hasSkills ? `- Key Skills: ${relevantSkills}` : ''
        ].filter(Boolean);

        // Add work experience only if available
        const experienceDetails = [];
        if (hasWorkExperience) {
            experienceDetails.push('Work Experience:');
            workExperience.slice(0, 2).forEach(exp => {
                experienceDetails.push(`- ${exp.jobTitle} at ${exp.company}`);
                if (exp.description) {
                    experienceDetails.push(`  ${exp.description.substring(0, 150)}${exp.description.length > 150 ? '...' : ''}`);
                }
            });
        }

        // Add education only if available
        const educationDetails = [];
        if (hasEducation) {
            educationDetails.push('Education:');
            education.slice(0, 2).forEach(edu => {
                const parts = [
                    edu.degree, 
                    edu.fieldOfStudy, 
                    edu.institutionName
                ].filter(Boolean);
                if (parts.length > 0) {
                    educationDetails.push(`- ${parts.join(', ')}`);
                }
            });
        }

        // Job details section
        const jobDetails_ = [
            'Job Details:',
            `- Company: ${jobDetails.company}`,
            `- Position: ${jobDetails.jobTitle}`
        ];
        
        if (hasJobDescription) {
            jobDetails_.push(`- Job Description Overview: ${jobDetails.jobDescription.substring(0, 300)}${jobDetails.jobDescription.length > 300 ? '...' : ''}`);
        }

        // Add emphasis on highest priority content
        const primarySection = contentPriority.suggestedOrder[0];
        if (primarySection && contentPriority.sections[primarySection].tier === 'PRIMARY') {
            options.emphasis = [
                ...(options.emphasis || []),
                ...contentPriority.sections[primarySection].focusPoints
            ];
        }

        // Build the complete prompt
        const prompt = [
            systemInstructions,
            '',
            `Write a professional cover letter for a ${jobDetails.jobTitle} position at ${jobDetails.company}.`,
            '',
            ...candidateDetails,
            '',
            ...(experienceDetails.length > 0 ? [...experienceDetails, ''] : []),
            ...(educationDetails.length > 0 ? [...educationDetails, ''] : []),
            ...jobDetails_,
            '',
            'Additional Guidelines:',
            '- Highlight relevant skills and experience that match the job requirements',
            '- Show enthusiasm for the role and company',
            '- Include a strong closing statement',
            '- Do not fabricate information or use placeholders for missing data',
            '- Only mention skills, experience, and education that are explicitly provided above',
            options.tone ? `- Use a ${options.tone} tone throughout the letter` : '',
            options.length ? `- Keep the letter ${options.length === 'short' ? 'brief and concise' : options.length === 'long' ? 'detailed and comprehensive' : 'moderately detailed'}` : '',
            ...(options.emphasis && options.emphasis.length > 0 ? [`- Emphasize these aspects if mentioned in the data: ${options.emphasis.join(', ')}`] : [])
        ].filter(Boolean).join('\n');

        return prompt;
    }

    async makeAPIRequestWithRetry(prompt, attempt = 1) {
        // If in test mode, return mock response
        if (this.isTestMode) {
            return "This is a mock API response for testing purposes.";
        }
        
        try {
            if (!this.openai) {
                throw new Error("OpenAI client not initialized. API key may be missing.");
            }
            
            const completion = await this.openai.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are a professional cover letter writer who creates personalized, tailored cover letters. You NEVER include placeholder text or mention missing information. If data is unavailable, you gracefully work around it and focus on what IS available."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                model: "gpt-3.5-turbo",
                temperature: 0.7,
                max_tokens: 1000,
                top_p: 1,
            });

            return completion.choices[0].message.content;
        } catch (error) {
            if (attempt < this.retryLimit && this.shouldRetry(error)) {
                console.log(`Retrying API request, attempt ${attempt + 1}`);
                await this.delay(this.retryDelay * attempt);
                return this.makeAPIRequestWithRetry(prompt, attempt + 1);
            }
            throw error;
        }
    }

    generateCacheKey(resumeData, jobDetails) {
        // Create a unique key based on resume and job details
        return JSON.stringify({
            resumeId: resumeData.id,
            jobTitle: jobDetails.jobTitle,
            company: jobDetails.company,
            timestamp: new Date().toDateString() // Cache expires daily
        });
    }

    shouldRetry(error) {
        // Retry on rate limits or temporary server issues
        return error.status === 429 || // Rate limit
               error.status >= 500;    // Server errors
    }

    handleError(error) {
        if (error.status === 429) {
            return new Error('Rate limit exceeded. Please try again later.');
        }
        if (error.status === 401) {
            return new Error('Authentication error. Please check API key.');
        }
        return new Error('Failed to generate cover letter. Please try again.');
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = new AIService(); 