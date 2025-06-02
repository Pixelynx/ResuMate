'use strict';

const { Model } = require('sequelize');

/**
 * @typedef {import('sequelize').Sequelize} Sequelize
 * @typedef {import('sequelize').DataTypes} DataTypes
 */

module.exports = (sequelize, DataTypes) => {
  class CompatibilityAssessment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     * @param {Object} models
     */
    static associate(models) {
      // Define associations here
      CompatibilityAssessment.belongsTo(models.Resume, {
        foreignKey: 'resume_id',
        as: 'resume'
      });
      
      CompatibilityAssessment.belongsTo(models.Job, {
        foreignKey: 'job_id',
        as: 'job'
      });
    }
  }

  CompatibilityAssessment.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    resume_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'resumes',
        key: 'id'
      }
    },
    job_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'jobs',
        key: 'id'
      }
    },
    compatibility_score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 100
      }
    },
    compatibility_level: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['excellent_match', 'good_match', 'potential_match', 'poor_match', 'incompatible', 'assessment_failed']]
      }
    },
    is_compatible: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    assessment_details: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    suggestions: {
      type: DataTypes.JSONB
    }
  }, {
    sequelize,
    modelName: 'CompatibilityAssessment',
    tableName: 'compatibility_assessments',
    underscored: true,
    timestamps: true
  });

  return CompatibilityAssessment;
}; 