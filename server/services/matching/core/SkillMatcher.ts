import { SkillMatcherType, SkillMatch, SkillMatchResult, SkillMatchConfig, SkillCompensation } from './interfaces/SkillMatcherType';
import { TechnologyMapper } from './TechnologyMapper';
import { SkillNormalizer } from './SkillNormalizer';

/**
 * Default configuration for skill matching
 */
const DEFAULT_CONFIG: SkillMatchConfig = {
  baseWeight: 1.0,
  contextMultiplier: 1.2,
  compensationFactor: 0.8,
  minThreshold: 0.6
};

/**
 * Implementation of the skill matching system
 */
export class SkillMatcher implements SkillMatcherType {
  /**
   * Match candidate skills against job requirements
   */
  public async matchSkills(
    jobSkills: string[],
    candidateSkills: string[],
    config: Partial<SkillMatchConfig> = {}
  ): Promise<SkillMatchResult> {
    try {
      const finalConfig = { ...DEFAULT_CONFIG, ...config };
      const matches: SkillMatch[] = [];
      const compensations: SkillCompensation[] = [];
      const missingCritical: string[] = [];
      const processedSkills = new Set<string>();

      // Normalize all skills
      const normalizedJobSkills = jobSkills.map(skill => SkillNormalizer.normalizeSkill(skill));
      const normalizedCandidateSkills = candidateSkills.map(skill => SkillNormalizer.normalizeSkill(skill));

      // Process direct matches first
      for (const jobSkill of normalizedJobSkills) {
        const directMatch = this.findDirectMatch(jobSkill, normalizedCandidateSkills);
        
        if (directMatch) {
          matches.push({
            skill: jobSkill,
            confidence: 1.0,
            matchType: 'direct'
          });
          processedSkills.add(jobSkill);
        } else {
          const relatedMatch = await this.findRelatedMatch(
            jobSkill,
            normalizedCandidateSkills,
            finalConfig
          );

          if (relatedMatch) {
            matches.push(relatedMatch.match);
            compensations.push(relatedMatch.compensation);
            processedSkills.add(jobSkill);
          } else {
            missingCritical.push(jobSkill);
          }
        }
      }

      // Calculate overall score
      const score = this.calculateOverallScore(matches, compensations, finalConfig);

      // Generate suggestions for missing skills
      const suggestions = this.generateSuggestions(missingCritical);

      return {
        score,
        matches,
        compensations,
        missingCritical,
        suggestions
      };
    } catch (error) {
      console.error('Error in skill matching:', error);
      throw new Error('Failed to perform skill matching');
    }
  }

  /**
   * Calculate relevance of a skill in a given context
   */
  public async calculateSkillRelevance(skill: string, context: string): Promise<number> {
    try {
      const normalizedSkill = SkillNormalizer.normalizeSkill(skill);
      const normalizedContext = context.toLowerCase();

      // Find the technology group for the skill
      const groupInfo = TechnologyMapper.findGroupForSkill(normalizedSkill);
      if (!groupInfo) return 0.5; // Default relevance for unknown skills

      // Check if the context mentions the technology group or related terms
      const groupSkills = TechnologyMapper.getSkills(groupInfo.category, groupInfo.subcategory);
      const contextRelevance = groupSkills.some((s: string) => normalizedContext.includes(s)) ? 1.0 : 0.7;

      return contextRelevance;
    } catch (error) {
      console.error('Error calculating skill relevance:', error);
      return 0.5; // Default relevance on error
    }
  }

  /**
   * Find related skills for a given skill
   */
  public async findRelatedSkills(skill: string): Promise<string[]> {
    try {
      const normalizedSkill = SkillNormalizer.normalizeSkill(skill);
      return TechnologyMapper.getRelatedSkills(normalizedSkill);
    } catch (error) {
      console.error('Error finding related skills:', error);
      return [];
    }
  }

  /**
   * Find a direct match for a job skill in candidate skills
   */
  private findDirectMatch(jobSkill: string, candidateSkills: string[]): boolean {
    return candidateSkills.some(skill => 
      SkillNormalizer.areSimilarSkills(jobSkill, skill)
    );
  }

  /**
   * Find a related match for a job skill
   */
  private async findRelatedMatch(
    jobSkill: string,
    candidateSkills: string[],
    config: SkillMatchConfig
  ): Promise<{ match: SkillMatch; compensation: SkillCompensation } | null> {
    const relatedSkills = await this.findRelatedSkills(jobSkill);
    
    for (const candidateSkill of candidateSkills) {
      if (relatedSkills.some(related => 
        SkillNormalizer.areSimilarSkills(related, candidateSkill)
      )) {
        const groupInfo = TechnologyMapper.findGroupForSkill(jobSkill);
        const compensationFactor = groupInfo 
          ? groupInfo.group.compensation
          : config.compensationFactor;

        return {
          match: {
            skill: jobSkill,
            confidence: compensationFactor,
            matchType: 'related',
            context: `Related to ${candidateSkill}`
          },
          compensation: {
            requiredSkill: jobSkill,
            relatedSkill: candidateSkill,
            factor: compensationFactor,
            reason: `${candidateSkill} is related to ${jobSkill} in the ${groupInfo?.category || 'technology'} category`
          }
        };
      }
    }

    return null;
  }

  /**
   * Calculate the overall score based on matches and compensations
   */
  private calculateOverallScore(
    matches: SkillMatch[],
    compensations: SkillCompensation[],
    config: SkillMatchConfig
  ): number {
    const directMatches = matches.filter(m => m.matchType === 'direct').length;
    const relatedMatches = matches.filter(m => m.matchType === 'related').length;
    
    const directScore = directMatches * config.baseWeight;
    const relatedScore = relatedMatches * config.baseWeight * config.compensationFactor;
    
    const totalPossibleScore = matches.length * config.baseWeight;
    const actualScore = directScore + relatedScore;

    return Math.min(1, Math.max(0, actualScore / totalPossibleScore));
  }

  /**
   * Generate suggestions for missing skills
   */
  private generateSuggestions(missingSkills: string[]): string[] {
    return missingSkills.map(skill => {
      const group = TechnologyMapper.findGroupForSkill(skill);
      if (!group) return `Consider learning ${skill}`;

      const relatedSkills = TechnologyMapper.getRelatedSkills(skill);
      const suggestion = relatedSkills.length > 0
        ? `Consider learning ${skill} or related technologies like ${relatedSkills.slice(0, 3).join(', ')}`
        : `Consider learning ${skill}`;

      return suggestion;
    });
  }

  /**
   * Check if a skill is valid/known
   */
  public isValidSkill(skill: string): boolean {
    const normalizedSkill = SkillNormalizer.normalizeSkill(skill);
    return TechnologyMapper.findGroupForSkill(normalizedSkill) !== null;
  }

  /**
   * Find direct and related matches
   */
  private findMatches(
    required: string[],
    candidate: string[]
  ): { skill: string; matchType: 'direct' | 'related' | 'potential' }[] {
    const matches: { skill: string; matchType: 'direct' | 'related' | 'potential' }[] = [];

    required.forEach(skill => {
      // Check for direct match
      if (candidate.some(s => SkillNormalizer.areSimilarSkills(s, skill))) {
        matches.push({ skill, matchType: 'direct' });
        return;
      }

      // Check for related match
      const relatedSkills = TechnologyMapper.getRelatedSkills(skill);
      if (candidate.some(s => relatedSkills.includes(s))) {
        matches.push({ skill, matchType: 'related' });
        return;
      }

      // Check for potential match (same technology group)
      const skillGroup = TechnologyMapper.findGroupForSkill(skill);
      if (skillGroup && candidate.some(s => {
        const candidateGroup = TechnologyMapper.findGroupForSkill(s);
        return candidateGroup && candidateGroup.category === skillGroup.category;
      })) {
        matches.push({ skill, matchType: 'potential' });
      }
    });

    return matches;
  }
} 