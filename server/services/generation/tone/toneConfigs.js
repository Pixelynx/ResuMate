// @ts-check

/**
 * @typedef {'formal' | 'semiformal' | 'casual'} VocabularyLevel
 * @typedef {'minimal' | 'moderate' | 'high'} EnthusiasmLevel
 * @typedef {'minimal' | 'balanced' | 'prominent'} PersonalityShow
 * @typedef {'concise' | 'moderate' | 'detailed'} LengthPreference
 * @typedef {'high' | 'moderate' | 'relaxed'} FormalityLevel
 */

/**
 * @typedef {Object} ToneAttributes
 * @property {VocabularyLevel} vocabularyLevel - Level of vocabulary formality
 * @property {EnthusiasmLevel} enthusiasmLevel - Level of enthusiasm to express
 * @property {PersonalityShow} personalityShow - How much personality to show
 * @property {LengthPreference} lengthPreference - Preferred content length
 * @property {FormalityLevel} formalityLevel - Overall formality level
 */

/**
 * @typedef {Object} ToneModifiers
 * @property {string[]} preferredTransitions - Transition phrases fitting the tone
 * @property {string[]} avoidPhrases - Phrases to avoid for this tone
 * @property {Object.<string, number>} sectionEmphasis - Section emphasis adjustments
 * @property {(content: string) => string} contentFilter - Content filtering function
 */

/**
 * @typedef {Object} ToneConfig
 * @property {string} id - Unique identifier for the tone
 * @property {string} name - Display name of the tone
 * @property {string} description - Description of when to use this tone
 * @property {ToneAttributes} attributes - Core tone attributes
 * @property {ToneModifiers} modifiers - Tone-specific modifications
 * @property {Object.<string, string[]>} vocabulary - Tone-specific vocabulary guidelines
 * @property {string[]} promptInstructions - Special instructions for AI prompt
 */

/** @type {Object.<string, ToneConfig>} */
const TONE_CONFIGS = {
  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'Formal and business-appropriate tone suitable for most professional contexts',
    attributes: {
      vocabularyLevel: 'formal',
      enthusiasmLevel: 'moderate',
      personalityShow: 'minimal',
      lengthPreference: 'concise',
      formalityLevel: 'high'
    },
    modifiers: {
      preferredTransitions: [
        'Furthermore,',
        'Additionally,',
        'Moreover,',
        'In addition to',
        'With regard to',
        'Consequently,'
      ],
      avoidPhrases: [
        'I think',
        'kind of',
        'sort of',
        'basically',
        'you know',
        'like'
      ],
      sectionEmphasis: {
        workExperience: 1.2,
        skills: 1.1,
        education: 1.0,
        projects: 1.0
      },
      contentFilter: (content) => {
        // Remove casual language and ensure professional tone
        return content
          .replace(/(?:^|\s)(?:really|very|pretty)(?:\s|$)/g, ' ')
          .replace(/(?:^|\s)(?:great|awesome|amazing)(?:\s|$)/g, ' excellent')
          .replace(/!+/g, '.');
      }
    },
    vocabulary: {
      powerVerbs: [
        'implemented',
        'developed',
        'orchestrated',
        'facilitated',
        'streamlined',
        'optimized'
      ],
      transitions: [
        'Furthermore',
        'Additionally',
        'Moreover',
        'Consequently',
        'Subsequently'
      ],
      qualifiers: [
        'significantly',
        'effectively',
        'systematically',
        'strategically',
        'efficiently'
      ]
    },
    promptInstructions: [
      'Maintain a formal and professional tone throughout',
      'Use industry-standard terminology',
      'Focus on concrete achievements and metrics',
      'Avoid casual language or colloquialisms',
      'Emphasize professional growth and expertise',
      'Use measured enthusiasm appropriate for business context'
    ]
  }
};

/**
 * Validates and retrieves a tone configuration
 * @param {string} toneId - Tone identifier
 * @returns {ToneConfig} Tone configuration
 */
const getToneConfig = (toneId) => {
  const config = TONE_CONFIGS[toneId?.toLowerCase()];
  if (!config) {
    return TONE_CONFIGS.professional; // Default to professional tone
  }
  return config;
};

/**
 * Applies tone-specific content modifications
 * @param {string} content - Original content
 * @param {ToneConfig} toneConfig - Tone configuration
 * @returns {string} Modified content
 */
const applyToneModifications = (content, toneConfig) => {
  return toneConfig.modifiers.contentFilter(content);
};

/**
 * Gets tone-specific section emphasis
 * @param {string} section - Section name
 * @param {ToneConfig} toneConfig - Tone configuration
 * @returns {number} Emphasis multiplier
 */
const getSectionEmphasis = (section, toneConfig) => {
  return toneConfig.modifiers.sectionEmphasis[section] || 1.0;
};

/**
 * Generates tone-specific prompt instructions
 * @param {ToneConfig} toneConfig - Tone configuration
 * @returns {string} Formatted instructions
 */
const getToneInstructions = (toneConfig) => {
  return `
    TONE-SPECIFIC INSTRUCTIONS:
    
    Tone: ${toneConfig.name}
    
    Voice and Style:
    - Vocabulary Level: ${toneConfig.attributes.vocabularyLevel}
    - Enthusiasm Level: ${toneConfig.attributes.enthusiasmLevel}
    - Personality Show: ${toneConfig.attributes.personalityShow}
    - Length Preference: ${toneConfig.attributes.lengthPreference}
    - Formality Level: ${toneConfig.attributes.formalityLevel}
    
    Preferred Transitions:
    ${toneConfig.modifiers.preferredTransitions.map(t => `- ${t}`).join('\n    ')}
    
    Avoid These Phrases:
    ${toneConfig.modifiers.avoidPhrases.map(p => `- ${p}`).join('\n    ')}
    
    Recommended Vocabulary:
    - Power Verbs: ${toneConfig.vocabulary.powerVerbs.join(', ')}
    - Transitions: ${toneConfig.vocabulary.transitions.join(', ')}
    - Qualifiers: ${toneConfig.vocabulary.qualifiers.join(', ')}
    
    Special Instructions:
    ${toneConfig.promptInstructions.map(i => `- ${i}`).join('\n    ')}
  `;
};

module.exports = {
  getToneConfig,
  applyToneModifications,
  getSectionEmphasis,
  getToneInstructions
}; 