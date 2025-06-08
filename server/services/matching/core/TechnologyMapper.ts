/**
 * Technology categories with their respective skills and related technologies
 */
export interface TechnologyGroup {
  skills: string[];
  relatedGroups: string[];
  compensationFactor: number;
}

export interface TechnologyMap {
  [key: string]: TechnologyGroup;
}

/**
 * Comprehensive technology mapping system
 */
export class TechnologyMapper {
  private static readonly technologyMap: TechnologyMap = {
    frontend: {
      skills: [
        'react', 'vue', 'angular', 'javascript', 'typescript', 'html', 'css',
        'sass', 'less', 'webpack', 'babel', 'redux', 'vuex', 'next.js',
        'gatsby', 'tailwind', 'bootstrap', 'material-ui', 'styled-components'
      ],
      relatedGroups: ['fullstack', 'mobile'],
      compensationFactor: 0.8
    },
    backend: {
      skills: [
        'node.js', 'python', 'java', 'c#', 'php', 'ruby', 'go', 'rust',
        'express', 'django', 'spring', 'laravel', 'rails', 'postgresql',
        'mysql', 'mongodb', 'redis', 'graphql', 'rest'
      ],
      relatedGroups: ['fullstack', 'devops'],
      compensationFactor: 0.8
    },
    devops: {
      skills: [
        'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jenkins', 'gitlab-ci',
        'github-actions', 'terraform', 'ansible', 'prometheus', 'grafana',
        'elk stack', 'nginx', 'linux', 'bash', 'shell scripting'
      ],
      relatedGroups: ['backend', 'cloud'],
      compensationFactor: 0.7
    },
    mobile: {
      skills: [
        'react native', 'flutter', 'swift', 'kotlin', 'ios', 'android',
        'xamarin', 'ionic', 'mobile development', 'app development',
        'mobile ui/ux', 'mobile testing', 'mobile security'
      ],
      relatedGroups: ['frontend'],
      compensationFactor: 0.7
    },
    cloud: {
      skills: [
        'aws', 'azure', 'gcp', 'cloud architecture', 'serverless',
        'microservices', 'lambda', 'cloud functions', 'dynamodb',
        'cloud storage', 'cdn', 'cloud security'
      ],
      relatedGroups: ['devops', 'backend'],
      compensationFactor: 0.75
    },
    fullstack: {
      skills: [
        'javascript', 'typescript', 'python', 'java', 'node.js',
        'react', 'angular', 'vue', 'express', 'django', 'spring',
        'full stack development', 'web development'
      ],
      relatedGroups: ['frontend', 'backend'],
      compensationFactor: 0.9
    },
    data: {
      skills: [
        'sql', 'python', 'r', 'pandas', 'numpy', 'scikit-learn',
        'tensorflow', 'pytorch', 'data analysis', 'machine learning',
        'data visualization', 'statistics', 'big data'
      ],
      relatedGroups: ['backend'],
      compensationFactor: 0.6
    }
  };

  /**
   * Get all skills in a specific technology group
   */
  public static getGroupSkills(group: string): string[] {
    return this.technologyMap[group]?.skills || [];
  }

  /**
   * Get related technology groups for a given group
   */
  public static getRelatedGroups(group: string): string[] {
    return this.technologyMap[group]?.relatedGroups || [];
  }

  /**
   * Get compensation factor for a technology group
   */
  public static getCompensationFactor(group: string): number {
    return this.technologyMap[group]?.compensationFactor || 0;
  }

  /**
   * Find the technology group for a given skill
   */
  public static findGroupForSkill(skill: string): string | null {
    const normalizedSkill = skill.toLowerCase().trim();
    
    for (const [group, data] of Object.entries(this.technologyMap)) {
      if (data.skills.includes(normalizedSkill)) {
        return group;
      }
    }
    return null;
  }

  /**
   * Get all related skills for a given skill
   */
  public static getRelatedSkills(skill: string): string[] {
    const group = this.findGroupForSkill(skill);
    if (!group) return [];

    const relatedGroups = [group, ...this.getRelatedGroups(group)];
    const relatedSkills = new Set<string>();

    relatedGroups.forEach(g => {
      this.getGroupSkills(g).forEach(s => {
        if (s !== skill) relatedSkills.add(s);
      });
    });

    return Array.from(relatedSkills);
  }
} 