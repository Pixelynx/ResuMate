const OpenAI = require('openai');
const NodeCache = require('node-cache');

class AIService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour
        this.retryLimit = 3;
        this.retryDelay = 1000;
    }

    generateCacheKey(resumeData, jobDetails) {
        return `${resumeData.id}-${jobDetails.jobTitle}-${jobDetails.company}`.toLowerCase();
    }

    async generateCoverLetter(resumeData, jobDetails, options = {}) {
        const cacheKey = this.generateCacheKey(resumeData, jobDetails);
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            console.log('Returning cached cover letter');
            return this.cache.get(cacheKey);
        }

        try {
            const prompt = this.constructPrompt(resumeData, jobDetails, options);
            const response = await this.makeAPIRequestWithRetry(prompt, options);
            
            // Cache the successful response
            this.cache.set(cacheKey, response);
            return response;
        } catch (error) {
            console.error('Error generating cover letter:', error);
            throw this.handleError(error);
        }
    }

    constructPrompt(resumeData, jobDetails, options = {}) {
        const {
            personalDetails = {},
            workExperience = [],
            skills = {},
            education = []
        } = resumeData;

        const {
            firstName,
            lastName,
            title,
            email,
            phone,
            location
        } = personalDetails;

        const recentExperience = workExperience[0] || {};
        const skillsList = Array.isArray(skills?.skills_) 
            ? skills.skills_.join(', ')
            : '';

        const { tone = 'professional', emphasis = [] } = options;

        const promptParts = [
            `Write a ${tone} cover letter for a ${jobDetails.jobTitle} position at ${jobDetails.company}.`,
            `Candidate Details:`,
            `- Name: ${firstName} ${lastName}`,
            `- Current Title: ${title || 'Professional'}`,
            `- Location: ${location || 'Available for relocation'}`,
            `- Key Skills: ${skillsList}`,
            recentExperience.jobTitle ? `- Recent Role: ${recentExperience.jobTitle} at ${recentExperience.company}` : '',
            education[0] ? `- Education: ${education[0].degree} from ${education[0].institution}` : '',
            `Job Details:`,
            `- Company: ${jobDetails.company}`,
            `- Position: ${jobDetails.jobTitle}`,
            jobDetails.jobDescription ? `- Job Description: ${jobDetails.jobDescription}` : '',
            `Guidelines:`,
            `- Maintain a ${tone} tone throughout the letter`,
            `- Focus on these key skills/experiences: ${emphasis.join(', ')}`,
            `- Highlight relevant skills and experience`,
            `- Show enthusiasm for the role and company`,
            `- Include a strong closing statement`,
            `- Format with proper spacing and paragraphs`,
            options.customInstructions ? `Additional Instructions: ${options.customInstructions}` : ''
        ];

        return promptParts.filter(Boolean).join('\n');
    }

    async makeAPIRequestWithRetry(prompt, options = {}, attempt = 1) {
        try {
            const completion = await this.openai.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are a professional cover letter writer. Create engaging, personalized cover letters that highlight the candidate's relevant skills and experience."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                model: options.model || "gpt-3.5-turbo",
                temperature: options.temperature || 0.7,
                max_tokens: options.maxTokens || 1000,
                top_p: options.topP || 1,
            });

            return completion.choices[0].message.content;
        } catch (error) {
            if (attempt < this.retryLimit && this.shouldRetry(error)) {
                console.log(`Retrying API request, attempt ${attempt + 1}`);
                await this.delay(this.retryDelay * attempt);
                return this.makeAPIRequestWithRetry(prompt, options, attempt + 1);
            }
            throw error;
        }
    }

    shouldRetry(error) {
        // Retry on rate limiting or temporary server errors
        return (
            error.status === 429 || // Rate limit
            error.status === 500 || // Server error
            error.status === 503    // Service unavailable
        );
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    handleError(error) {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    return new Error('Invalid API key. Please check your OpenAI API configuration.');
                case 429:
                    return new Error('Rate limit exceeded. Please try again later.');
                case 500:
                    return new Error('OpenAI service error. Please try again later.');
                default:
                    return new Error(`AI service error: ${error.response.data.error || 'Unknown error'}`);
            }
        }
        return new Error('Failed to generate cover letter. Please try again later.');
    }
}

module.exports = new AIService(); 