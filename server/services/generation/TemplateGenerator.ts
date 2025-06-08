import { SkillMatchResult } from '../matching/core/interfaces/SkillMatcherType';
import { SkillHighlighter } from './SkillHighlighter';

/**
 * Template section configuration
 */
interface TemplateSectionConfig {
  minLength: number;
  maxLength: number;
  required: boolean;
  priority: number;
}

/**
 * Template generation options
 */
interface TemplateGenerationOptions {
  tone: 'professional' | 'enthusiastic' | 'balanced';
  focusAreas: ('skills' | 'experience' | 'culture' | 'achievements')[];
  maxLength: number;
  includeCompanyInfo: boolean;
}

/**
 * Template generation result
 */
interface TemplateGenerationResult {
  sections: {
    introduction: string;
    skillsHighlight: string;
    relevantExperience: string;
    closing: string;
  };
  metadata: {
    totalLength: number;
    highlightedSkills: string[];
    matchScore: number;
    suggestedImprovements: string[];
  };
}

/**
 * Error types for template generation
 */
enum TemplateGenerationError {
  INSUFFICIENT_DATA = 'INSUFFICIENT_DATA',
  INVALID_CONFIGURATION = 'INVALID_CONFIGURATION',
  GENERATION_FAILED = 'GENERATION_FAILED',
  VALIDATION_FAILED = 'VALIDATION_FAILED'
}

/**
 * Template generator for cover letters using job matching data
 */
export class TemplateGenerator {
  private skillHighlighter: SkillHighlighter;
  private readonly sectionConfigs: Record<string, TemplateSectionConfig>;

  constructor() {
    this.skillHighlighter = new SkillHighlighter();
    this.sectionConfigs = {
      introduction: {
        minLength: 100,
        maxLength: 200,
        required: true,
        priority: 1
      },
      skillsHighlight: {
        minLength: 150,
        maxLength: 300,
        required: true,
        priority: 2
      },
      relevantExperience: {
        minLength: 200,
        maxLength: 400,
        required: true,
        priority: 3
      },
      closing: {
        minLength: 75,
        maxLength: 150,
        required: true,
        priority: 4
      }
    };
  }

  /**
   * Generate a cover letter template using job matching results
   */
  public async generateTemplate(
    matchResult: SkillMatchResult,
    candidateInfo: {
      experience: string[];
      achievements: string[];
      education: string;
    },
    companyInfo: {
      name: string;
      culture?: string;
      values?: string[];
    },
    options: Partial<TemplateGenerationOptions> = {}
  ): Promise<TemplateGenerationResult> {
    try {
      this.validateInputs(matchResult, candidateInfo, companyInfo);

      const finalOptions = this.getDefaultOptions(options);
      const sections = await this.generateSections(
        matchResult,
        candidateInfo,
        companyInfo,
        finalOptions
      );

      const metadata = this.generateMetadata(matchResult, sections);
      
      await this.validateTemplate(sections, finalOptions);

      return { sections, metadata };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Template generation failed: ${error.message}`);
      }
      throw new Error('Template generation failed: Unknown error');
    }
  }

  /**
   * Validate input data for template generation
   */
  private validateInputs(
    matchResult: SkillMatchResult,
    candidateInfo: { experience: string[]; achievements: string[]; education: string },
    companyInfo: { name: string; culture?: string; values?: string[] }
  ): void {
    if (!matchResult || !matchResult.matches || matchResult.matches.length === 0) {
      throw new Error(TemplateGenerationError.INSUFFICIENT_DATA);
    }

    if (!candidateInfo.experience || candidateInfo.experience.length === 0) {
      throw new Error(TemplateGenerationError.INSUFFICIENT_DATA);
    }

    if (!companyInfo.name) {
      throw new Error(TemplateGenerationError.INSUFFICIENT_DATA);
    }
  }

  /**
   * Get default options merged with provided options
   */
  private getDefaultOptions(options: Partial<TemplateGenerationOptions>): TemplateGenerationOptions {
    return {
      tone: options.tone || 'professional',
      focusAreas: options.focusAreas || ['skills', 'experience'],
      maxLength: options.maxLength || 800,
      includeCompanyInfo: options.includeCompanyInfo ?? true
    };
  }

  /**
   * Generate individual sections of the cover letter
   */
  private async generateSections(
    matchResult: SkillMatchResult,
    candidateInfo: { experience: string[]; achievements: string[]; education: string },
    companyInfo: { name: string; culture?: string; values?: string[] },
    options: TemplateGenerationOptions
  ): Promise<TemplateGenerationResult['sections']> {
    const introduction = await this.generateIntroduction(matchResult, companyInfo, options);
    const skillsHighlight = await this.generateSkillsSection(matchResult, options);
    const relevantExperience = await this.generateExperienceSection(
      candidateInfo.experience,
      matchResult,
      options
    );
    const closing = await this.generateClosing(companyInfo, options);

    return {
      introduction,
      skillsHighlight,
      relevantExperience,
      closing
    };
  }

  /**
   * Generate metadata for the template
   */
  private generateMetadata(
    matchResult: SkillMatchResult,
    sections: TemplateGenerationResult['sections']
  ): TemplateGenerationResult['metadata'] {
    return {
      totalLength: Object.values(sections).reduce((sum, section) => sum + section.length, 0),
      highlightedSkills: matchResult.matches.map(match => match.skill),
      matchScore: matchResult.score,
      suggestedImprovements: matchResult.suggestions
    };
  }

  /**
   * Validate the generated template
   */
  private async validateTemplate(
    sections: TemplateGenerationResult['sections'],
    options: TemplateGenerationOptions
  ): Promise<void> {
    const totalLength = Object.values(sections).reduce((sum, section) => sum + section.length, 0);
    
    if (totalLength > options.maxLength) {
      throw new Error(TemplateGenerationError.VALIDATION_FAILED);
    }

    for (const [name, content] of Object.entries(sections)) {
      const config = this.sectionConfigs[name];
      if (config.required && (!content || content.length < config.minLength)) {
        throw new Error(TemplateGenerationError.VALIDATION_FAILED);
      }
    }
  }

  /**
   * Generate introduction section
   */
  private async generateIntroduction(
    matchResult: SkillMatchResult,
    companyInfo: { name: string; culture?: string; values?: string[] },
    options: TemplateGenerationOptions
  ): Promise<string> {
    // Implementation would go here
    return "Introduction placeholder";
  }

  /**
   * Generate skills section
   */
  private async generateSkillsSection(
    matchResult: SkillMatchResult,
    options: TemplateGenerationOptions
  ): Promise<string> {
    // Implementation would go here
    return "Skills section placeholder";
  }

  /**
   * Generate experience section
   */
  private async generateExperienceSection(
    experience: string[],
    matchResult: SkillMatchResult,
    options: TemplateGenerationOptions
  ): Promise<string> {
    // Implementation would go here
    return "Experience section placeholder";
  }

  /**
   * Generate closing section
   */
  private async generateClosing(
    companyInfo: { name: string; culture?: string; values?: string[] },
    options: TemplateGenerationOptions
  ): Promise<string> {
    // Implementation would go here
    return "Closing placeholder";
  }
} 