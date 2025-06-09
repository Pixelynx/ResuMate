// @ts-check

/**
 * Feature flags configuration
 * Each flag should have:
 * - enabled: boolean to toggle the feature
 * - description: what the feature does
 * - owner: team/person responsible
 * - addedDate: when the feature was added
 * - expiryDate: when the feature should be reviewed/removed
 */
const featureFlags = {
  LENIENT_JOB_FIT_SCORING: {
    enabled: process.env.ENABLE_LENIENT_SCORING === 'true',
    description: 'Temporary fix to make job fit scoring more lenient for candidates with transferable skills',
    owner: 'Scoring Team',
    addedDate: '2024-03-19',
    expiryDate: '2024-06-19',
    details: {
      changes: [
        'Reduced technical mismatch penalties',
        'Added transferable skills credit',
        'Increased minimum scores',
        'Added partial credit for related roles'
      ]
    }
  }
};

/**
 * Checks if a feature flag is enabled
 * @param {string} flagName - Name of the feature flag
 * @returns {boolean} Whether the feature is enabled
 */
function isFeatureEnabled(flagName) {
  return featureFlags[flagName]?.enabled || false;
}

/**
 * Gets all feature flags and their status
 * @returns {Object} Feature flags configuration
 */
function getAllFeatureFlags() {
  return featureFlags;
}

/**
 * Gets details about a specific feature flag
 * @param {string} flagName - Name of the feature flag
 * @returns {Object|null} Feature flag configuration or null if not found
 */
function getFeatureDetails(flagName) {
  return featureFlags[flagName] || null;
}

module.exports = {
  isFeatureEnabled,
  getAllFeatureFlags,
  getFeatureDetails
}; 