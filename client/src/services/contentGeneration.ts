import { CompatibilityAssessment, CompatibilityMetrics } from '../types/mismatchTypes';

interface ContentTemplate {
  template: string;
  conditions: (metrics: CompatibilityMetrics) => boolean;
}

interface RoleSuggestion {
  title: string;
  reason: string;
  matchScore: number;
}

const SKILL_MISMATCH_TEMPLATES: ContentTemplate[] = [
  {
    template: 'While your background shows strong expertise in {matchedSkills}, this role requires additional proficiency in {missingSkills}.',
    conditions: (metrics) => metrics.missingCriticalSkills.length > 0 && metrics.skillsMatch.length > 0
  },
  {
    template: 'The role requires expertise in {missingSkills}, which are not currently reflected in your resume.',
    conditions: (metrics) => metrics.missingCriticalSkills.length > 0 && metrics.skillsMatch.length === 0
  }
];

const EXPERIENCE_MISMATCH_TEMPLATES: ContentTemplate[] = [
  {
    template: 'This position typically requires more years of experience in {domain}. Consider roles that better align with your current experience level.',
    conditions: (metrics) => metrics.experienceMismatch && !metrics.roleTypeMismatch
  },
  {
    template: 'Your experience is in a different domain than what this role requires. The position focuses on {domain} expertise.',
    conditions: (metrics) => metrics.roleTypeMismatch
  }
];

const POSITIVE_ASPECTS_TEMPLATES: ContentTemplate[] = [
  {
    template: 'Your skills in {matchedSkills} are valuable and align well with many other opportunities.',
    conditions: (metrics) => metrics.skillsMatch.length > 0
  },
  {
    template: 'Your background shows strong potential, particularly in {domain}.',
    conditions: (metrics) => metrics.assessmentDetails.potentialScore > 70
  }
];

/**
 * Generates a professional explanation for the compatibility mismatch
 */
export const generateMismatchExplanation = (assessment: CompatibilityAssessment): string => {
  const { metadata } = assessment;
  const explanations: string[] = [];

  // Add skill mismatch explanation if applicable
  const skillTemplate = SKILL_MISMATCH_TEMPLATES.find(t => t.conditions(metadata));
  if (skillTemplate) {
    explanations.push(skillTemplate.template
      .replace('{matchedSkills}', formatSkillsList(metadata.skillsMatch))
      .replace('{missingSkills}', formatSkillsList(metadata.missingCriticalSkills)));
  }

  // Add experience mismatch explanation if applicable
  const experienceTemplate = EXPERIENCE_MISMATCH_TEMPLATES.find(t => t.conditions(metadata));
  if (experienceTemplate) {
    explanations.push(experienceTemplate.template
      .replace('{domain}', getDomainFromAssessment(metadata)));
  }

  // Add positive aspects
  const positiveTemplate = POSITIVE_ASPECTS_TEMPLATES.find(t => t.conditions(metadata));
  if (positiveTemplate) {
    explanations.push(positiveTemplate.template
      .replace('{matchedSkills}', formatSkillsList(metadata.skillsMatch))
      .replace('{domain}', getDomainFromAssessment(metadata)));
  }

  return explanations.join(' ');
};

/**
 * Generates alternative role suggestions based on the candidate's profile
 */
export const generateAlternativeRoles = (assessment: CompatibilityAssessment): RoleSuggestion[] => {
  const { metadata } = assessment;
  const suggestions: RoleSuggestion[] = [];

  // Generate role suggestions based on matched skills
  if (metadata.skillsMatch.length > 0) {
    const primarySkills = metadata.skillsMatch.slice(0, 3);
    
    if (primarySkills.includes('typescript') || primarySkills.includes('javascript')) {
      suggestions.push({
        title: 'Frontend Developer',
        reason: 'Your JavaScript/TypeScript skills are well-suited for frontend development roles.',
        matchScore: 85
      });
    }

    if (primarySkills.includes('react') || primarySkills.includes('vue') || primarySkills.includes('angular')) {
      suggestions.push({
        title: 'UI Developer',
        reason: 'Your framework experience aligns well with UI development positions.',
        matchScore: 80
      });
    }

    if (primarySkills.includes('node') || primarySkills.includes('express')) {
      suggestions.push({
        title: 'Backend Developer',
        reason: 'Your Node.js experience is valuable for backend development roles.',
        matchScore: 82
      });
    }
  }

  // Add entry-level suggestion if experience is the main mismatch
  if (metadata.experienceMismatch && !metadata.roleTypeMismatch) {
    suggestions.push({
      title: 'Junior Developer',
      reason: 'This level better matches your current experience while using your technical skills.',
      matchScore: 90
    });
  }

  return suggestions;
};

// Helper functions
const formatSkillsList = (skills: string[]): string => {
  if (skills.length === 0) return '';
  if (skills.length === 1) return skills[0];
  if (skills.length === 2) return `${skills[0]} and ${skills[1]}`;
  return `${skills.slice(0, -1).join(', ')}, and ${skills[skills.length - 1]}`;
};

const getDomainFromAssessment = (metrics: CompatibilityMetrics): string => {
  // Extract domain from assessment details or use a default
  const domains = Object.entries(metrics.assessmentDetails)
    .filter(([key]) => key.includes('domain'))
    .sort(([, a], [, b]) => b - a);
  
  return domains.length > 0 ? domains[0][0].replace('domain_', '') : 'software development';
};

export const ContentGenerator = {
  generateMismatchExplanation,
  generateAlternativeRoles,
}; 