import { Resume } from '../../../models/Resume';
import { JobDescription } from '../../../models/JobDescription';
import { SkillAnalyzer } from '../core/analysis/SkillAnalyzer';
import { ExperienceAnalyzer } from '../core/analysis/ExperienceAnalyzer';
import { ContextAnalyzer } from '../core/analysis/ContextAnalyzer';
import { SkillMatcher } from '../core/SkillMatcher';

/**
 * Props for JobScore component
 */
export interface JobScoreProps {
  resume: Resume;
  jobDescription: JobDescription;
  showDetailed: boolean;
  onScoreCalculated: (score: number) => void;
}

/**
 * Detailed score breakdown
 */
export interface ScoreBreakdown {
  overall: number;
  skills: {
    score: number;
    matches: string[];
    gaps: string[];
  };
  experience: {
    score: number;
    relevantYears: number;
    details: string[];
  };
  context: {
    score: number;
    relevance: string[];
    suggestions: string[];
  };
}

// Add these interfaces
interface ExperienceAnalysisDetail {
  actualYears: number;
  score: number;
  explanation: string;
}

interface ExperienceAnalysisResult {
  score: number;
  details: ExperienceAnalysisDetail[];
}

interface SkillAnalysisDetail {
  skill: string;
  relevance: number;
}

interface SkillAnalysisResult {
  score: number;
  details: SkillAnalysisDetail[];
  suggestions: string[];
}

/**
 * Handles job compatibility scoring and analysis
 */
export class JobScoreAnalyzer {
  private skillAnalyzer: SkillAnalyzer;
  private experienceAnalyzer: ExperienceAnalyzer;
  private contextAnalyzer: ContextAnalyzer;
  private skillMatcher: SkillMatcher;

  constructor() {
    this.skillAnalyzer = new SkillAnalyzer();
    this.experienceAnalyzer = new ExperienceAnalyzer();
    this.contextAnalyzer = new ContextAnalyzer();
    this.skillMatcher = new SkillMatcher();
  }

  /**
   * Calculate detailed job compatibility score
   */
  public async calculateScore(
    resume: Resume,
    jobDescription: JobDescription
  ): Promise<ScoreBreakdown> {
    try {
      // Extract skills from job description
      const requiredSkills = this.extractSkills(jobDescription);
      
      // Match skills
      const skillMatchResult = await this.skillMatcher.matchSkills(
        requiredSkills,
        resume.skills
      );

      // Analyze skills in context
      const skillAnalysis = await this.skillAnalyzer.analyzeSkills(
        requiredSkills,
        resume.skills,
        jobDescription.description
      );

      // Analyze experience
      const experienceAnalysis = this.experienceAnalyzer.evaluateExperience(
        this.extractExperienceRequirements(jobDescription),
        this.calculateExperience(resume),
        jobDescription.description
      );

      // Calculate context score
      const contextScore = this.contextAnalyzer.calculateContextScore({
        skills: resume.skills,
        experienceYears: this.calculateExperience(resume),
        jobContext: jobDescription.description,
        jobLevel: jobDescription.level || '',
        industry: jobDescription.industry || ''
      });

      // Calculate overall score
      const overall = this.calculateOverallScore(
        skillAnalysis.score,
        experienceAnalysis.score,
        contextScore
      );

      return {
        overall,
        skills: {
          score: skillAnalysis.score,
          matches: skillMatchResult.matches.map(m => m.skill),
          gaps: skillAnalysis.suggestions
        },
        experience: {
          score: experienceAnalysis.score,
          relevantYears: this.calculateTotalRelevantYears(experienceAnalysis),
          details: experienceAnalysis.details.map(d => d.explanation)
        },
        context: {
          score: contextScore,
          relevance: this.generateRelevanceInsights(skillAnalysis),
          suggestions: this.generateContextSuggestions(skillAnalysis, experienceAnalysis)
        }
      };
    } catch (error) {
      console.error('Error calculating job score:', error);
      throw new Error('Failed to calculate job compatibility score');
    }
  }

  /**
   * Extract skills from job description
   */
  private extractSkills(job: JobDescription): string[] {
    const skills = new Set<string>();
    const words = job.description.toLowerCase().split(/\s+/);

    words.forEach((word: string) => {
      if (this.skillMatcher.isValidSkill(word)) {
        skills.add(word);
      }
    });

    if (job.requiredSkills) {
      job.requiredSkills.forEach((skill: string) => skills.add(skill.toLowerCase()));
    }

    return Array.from(skills);
  }

  /**
   * Extract experience requirements from job description
   */
  private extractExperienceRequirements(
    job: JobDescription
  ): { [area: string]: number } {
    const requirements: { [area: string]: number } = {};

    if (job.requiredYears) {
      requirements['general'] = job.requiredYears;
    }

    if (job.requiredSkills) {
      job.requiredSkills.forEach(skill => {
        requirements[skill] = job.requiredYears || 1;
      });
    }

    return requirements;
  }

  /**
   * Calculate years of experience per skill/area
   */
  private calculateExperience(resume: Resume): { [area: string]: number } {
    const experience: { [area: string]: number } = {};

    resume.workExperience?.forEach(job => {
      const duration = this.calculateDuration(job.startDate, job.endDate);
      
      // Add to general experience
      experience['general'] = (experience['general'] || 0) + duration;

      // Add to skill-specific experience
      job.skills?.forEach(skill => {
        experience[skill.toLowerCase()] = (experience[skill.toLowerCase()] || 0) + duration;
      });
    });

    return experience;
  }

  /**
   * Calculate duration between dates in years
   */
  private calculateDuration(start: string, end: string | undefined): number {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const diffMs = endDate.getTime() - startDate.getTime();
    return diffMs / (1000 * 60 * 60 * 24 * 365.25); // Account for leap years
  }

  /**
   * Calculate total relevant years of experience
   */
  private calculateTotalRelevantYears(
    analysis: ExperienceAnalysisResult
  ): number {
    return analysis.details.reduce(
      (sum: number, detail: ExperienceAnalysisDetail) => sum + (detail.actualYears || 0),
      0
    );
  }

  /**
   * Generate insights about skill relevance
   */
  private generateRelevanceInsights(
    analysis: SkillAnalysisResult
  ): string[] {
    return analysis.details
      .filter(d => d.relevance >= 0.7)
      .map(d => `Strong match: ${d.skill} (${Math.round(d.relevance * 100)}% relevant)`);
  }

  /**
   * Generate context-aware suggestions
   */
  private generateContextSuggestions(
    skillAnalysis: SkillAnalysisResult,
    experienceAnalysis: ExperienceAnalysisResult
  ): string[] {
    const suggestions: string[] = [];

    suggestions.push(...skillAnalysis.suggestions);

    experienceAnalysis.details.forEach(detail => {
      if (detail.score < 0.7) {
        suggestions.push(detail.explanation);
      }
    });

    return suggestions;
  }

  /**
   * Calculate overall score with weighted components
   */
  private calculateOverallScore(
    skillScore: number,
    experienceScore: number,
    contextScore: number
  ): number {
    const weights = {
      skills: 0.4,
      experience: 0.4,
      context: 0.2
    };

    return (
      skillScore * weights.skills +
      experienceScore * weights.experience +
      contextScore * weights.context
    );
  }
} 