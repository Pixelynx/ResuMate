'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('compatibility_assessments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      resume_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'resumes',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      job_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'jobs',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      compatibility_score: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      compatibility_level: {
        type: Sequelize.STRING,
        allowNull: false
      },
      is_compatible: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      assessment_details: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      suggestions: {
        type: Sequelize.JSONB
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('compatibility_assessments', ['resume_id', 'job_id']);
    await queryInterface.addIndex('compatibility_assessments', ['compatibility_score']);
    await queryInterface.addIndex('compatibility_assessments', ['compatibility_level']);
    await queryInterface.addIndex('compatibility_assessments', ['is_compatible']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('compatibility_assessments');
  }
}; 