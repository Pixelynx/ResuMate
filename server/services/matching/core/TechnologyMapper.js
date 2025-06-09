/**
 * @typedef {Object} TechGroup
 * @property {string} primary - Primary technology
 * @property {string[]} related - Related technologies
 * @property {number} compensation - Compensation factor
 * @property {string[]} context - Context keywords
 */

/**
 * @typedef {Object} TechnologyCategory
 * @property {TechGroup[]} [frameworks] - Framework groups
 * @property {TechGroup[]} [libraries] - Library groups
 * @property {TechGroup[]} [tools] - Tool groups
 * @property {TechGroup[]} [languages] - Language groups
 * @property {TechGroup[]} [databases] - Database groups
 * @property {TechGroup[]} [core] - Core technology groups
 */

/**
 * @typedef {Object.<string, TechnologyCategory>} TechnologyMap
 */

class TechnologyMapper {
  /**
   * @type {TechnologyMap}
   * @private
   */
  static technologyMap = {
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
   * @param {string} category - Technology category
   * @param {string} [subcategory] - Technology subcategory
   * @returns {string[]} List of skills
   */
  static getSkills(category, subcategory) {
    const categoryData = this.technologyMap[category];
    if (!categoryData) return [];

    if (subcategory) {
      const subcategoryData = categoryData[subcategory] || [];
      return subcategoryData.flatMap(group => [group.primary, ...group.related]);
    }

    return Object.values(categoryData).flatMap(groups => 
      (groups || []).flatMap(group => [group.primary, ...group.related])
    );
  }

  /**
   * Find technology group for a given skill
   * @param {string} skill - Skill to find
   * @returns {{ category: string, subcategory: string, group: TechGroup } | null} Group info
   */
  static findGroupForSkill(skill) {
    const normalizedSkill = skill.toLowerCase().trim();

    for (const [category, categoryData] of Object.entries(this.technologyMap)) {
      for (const [subcategory, groups] of Object.entries(categoryData)) {
        const group = groups?.find(g => 
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
   * @param {string} skill - Skill to evaluate
   * @returns {number} Compensation factor
   */
  static getCompensationFactor(skill) {
    const groupInfo = this.findGroupForSkill(skill);
    return groupInfo?.group.compensation || 0.5;
  }

  /**
   * Get context keywords for a skill
   * @param {string} skill - Skill to get context for
   * @returns {string[]} Context keywords
   */
  static getSkillContext(skill) {
    const groupInfo = this.findGroupForSkill(skill);
    return groupInfo?.group.context || [];
  }

  /**
   * Get related skills for a given skill
   * @param {string} skill - Skill to find related skills for
   * @returns {string[]} Related skills
   */
  static getRelatedSkills(skill) {
    const groupInfo = this.findGroupForSkill(skill);
    if (!groupInfo) return [];

    const { category, subcategory } = groupInfo;
    const categoryData = this.technologyMap[category];
    const relatedGroups = categoryData[subcategory] || [];

    return Array.from(new Set(
      relatedGroups.flatMap(group => [group.primary, ...group.related])
        .filter(s => s !== skill)
    ));
  }

  /**
   * Check if two skills are related
   * @param {string} skill1 - First skill
   * @param {string} skill2 - Second skill
   * @returns {boolean} Whether the skills are related
   */
  static areSkillsRelated(skill1, skill2) {
    const group1 = this.findGroupForSkill(skill1);
    const group2 = this.findGroupForSkill(skill2);

    if (!group1 || !group2) return false;

    return group1.category === group2.category &&
           group1.subcategory === group2.subcategory;
  }
}

module.exports = {
  TechnologyMapper
}; 