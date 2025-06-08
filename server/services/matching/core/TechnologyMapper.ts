/**
 * Technology group with related skills and compensation
 */
export interface TechGroup {
  primary: string;
  related: string[];
  compensation: number;
  context: string[];
}

/**
 * Detailed technology category mapping
 */
export interface TechnologyCategory {
  frameworks?: TechGroup[];
  libraries?: TechGroup[];
  tools?: TechGroup[];
  languages?: TechGroup[];
  databases?: TechGroup[];
  core?: TechGroup[];
}

/**
 * Complete technology mapping structure
 */
export interface TechnologyMap {
  [key: string]: TechnologyCategory;
}

/**
 * Comprehensive technology mapping system
 */
export class TechnologyMapper {
  private static readonly technologyMap: TechnologyMap = {
    frontend: {
      frameworks: [
        {
          primary: 'react',
          related: ['react-router', 'redux', 'next.js', 'gatsby'],
          compensation: 0.8,
          context: ['web development', 'ui', 'frontend', 'spa']
        },
        {
          primary: 'vue',
          related: ['vuex', 'nuxt.js', 'vue-router'],
          compensation: 0.8,
          context: ['web development', 'ui', 'frontend', 'spa']
        },
        {
          primary: 'angular',
          related: ['rxjs', 'ngrx', 'angular material'],
          compensation: 0.8,
          context: ['web development', 'ui', 'frontend', 'enterprise']
        }
      ],
      libraries: [
        {
          primary: 'tailwind',
          related: ['css', 'postcss', 'styled-components'],
          compensation: 0.7,
          context: ['styling', 'ui design', 'css framework']
        },
        {
          primary: 'material-ui',
          related: ['styled-components', 'emotion', 'chakra-ui'],
          compensation: 0.7,
          context: ['ui components', 'design system']
        }
      ],
      tools: [
        {
          primary: 'webpack',
          related: ['babel', 'rollup', 'vite'],
          compensation: 0.6,
          context: ['build tools', 'bundling', 'optimization']
        },
        {
          primary: 'jest',
          related: ['testing-library', 'cypress', 'enzyme'],
          compensation: 0.6,
          context: ['testing', 'unit tests', 'integration tests']
        }
      ]
    },
    backend: {
      languages: [
        {
          primary: 'node.js',
          related: ['javascript', 'typescript', 'deno'],
          compensation: 0.9,
          context: ['server', 'api', 'backend', 'javascript runtime']
        },
        {
          primary: 'python',
          related: ['django', 'flask', 'fastapi'],
          compensation: 0.9,
          context: ['server', 'api', 'backend', 'scripting']
        }
      ],
      frameworks: [
        {
          primary: 'express',
          related: ['koa', 'fastify', 'nest.js'],
          compensation: 0.8,
          context: ['web framework', 'rest api', 'middleware']
        },
        {
          primary: 'django',
          related: ['django-rest-framework', 'flask', 'fastapi'],
          compensation: 0.8,
          context: ['web framework', 'orm', 'full-stack']
        }
      ],
      databases: [
        {
          primary: 'postgresql',
          related: ['mysql', 'sql', 'relational database'],
          compensation: 0.8,
          context: ['database', 'sql', 'data storage']
        },
        {
          primary: 'mongodb',
          related: ['mongoose', 'nosql', 'document database'],
          compensation: 0.8,
          context: ['database', 'nosql', 'data storage']
        }
      ]
    },
    devops: {
      core: [
        {
          primary: 'docker',
          related: ['kubernetes', 'containerization', 'docker-compose'],
          compensation: 0.8,
          context: ['containers', 'deployment', 'infrastructure']
        },
        {
          primary: 'aws',
          related: ['ec2', 's3', 'lambda', 'cloud'],
          compensation: 0.8,
          context: ['cloud', 'infrastructure', 'deployment']
        },
        {
          primary: 'ci/cd',
          related: ['jenkins', 'github actions', 'gitlab ci'],
          compensation: 0.7,
          context: ['automation', 'deployment', 'testing']
        }
      ]
    },
    mobile: {
      core: [
        {
          primary: 'react-native',
          related: ['mobile development', 'ios', 'android'],
          compensation: 0.8,
          context: ['mobile', 'cross-platform', 'app development']
        },
        {
          primary: 'flutter',
          related: ['dart', 'mobile development', 'cross-platform'],
          compensation: 0.8,
          context: ['mobile', 'cross-platform', 'app development']
        }
      ]
    }
  };

  /**
   * Get all skills in a specific technology category and subcategory
   */
  public static getSkills(category: string, subcategory?: string): string[] {
    const categoryData = this.technologyMap[category];
    if (!categoryData) return [];

    if (subcategory) {
      const subcategoryData = categoryData[subcategory as keyof TechnologyCategory] || [];
      return subcategoryData.flatMap((group: TechGroup) => [group.primary, ...group.related]);
    }

    return Object.values(categoryData).flatMap(groups => 
      (groups || []).flatMap((group: TechGroup) => [group.primary, ...group.related])
    );
  }

  /**
   * Find technology group for a given skill
   */
  public static findGroupForSkill(skill: string): { 
    category: string; 
    subcategory: string; 
    group: TechGroup 
  } | null {
    const normalizedSkill = skill.toLowerCase().trim();

    for (const [category, categoryData] of Object.entries(this.technologyMap)) {
      for (const [subcategory, groups] of Object.entries(categoryData)) {
        const group = groups?.find((g: TechGroup) => 
          g.primary === normalizedSkill || 
          g.related.includes(normalizedSkill)
        );

        if (group) {
          return { category, subcategory, group };
        }
      }
    }

    return null;
  }

  /**
   * Get compensation factor for a skill
   */
  public static getCompensationFactor(skill: string): number {
    const groupInfo = this.findGroupForSkill(skill);
    return groupInfo?.group.compensation || 0.5;
  }

  /**
   * Get context keywords for a skill
   */
  public static getSkillContext(skill: string): string[] {
    const groupInfo = this.findGroupForSkill(skill);
    return groupInfo?.group.context || [];
  }

  /**
   * Get related skills for a given skill
   */
  public static getRelatedSkills(skill: string): string[] {
    const groupInfo = this.findGroupForSkill(skill);
    if (!groupInfo) return [];

    const { category, subcategory } = groupInfo;
    const categoryData = this.technologyMap[category];
    const relatedGroups = categoryData[subcategory as keyof TechnologyCategory] || [];

    return Array.from(new Set(
      relatedGroups.flatMap(group => [group.primary, ...group.related])
        .filter(s => s !== skill)
    ));
  }

  /**
   * Check if two skills are related
   */
  public static areSkillsRelated(skill1: string, skill2: string): boolean {
    const group1 = this.findGroupForSkill(skill1);
    const group2 = this.findGroupForSkill(skill2);

    if (!group1 || !group2) return false;

    // Same category and subcategory
    if (group1.category === group2.category && 
        group1.subcategory === group2.subcategory) {
      return true;
    }

    // Check if one skill is in the related array of the other
    return group1.group.related.includes(skill2.toLowerCase()) ||
           group2.group.related.includes(skill1.toLowerCase());
  }
} 