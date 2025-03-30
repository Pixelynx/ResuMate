'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Add job description column
    await queryInterface.addColumn('coverLetters', 'jobDescription', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    // 2. Update the foreign key constraint to cascade on delete
    await queryInterface.removeConstraint('coverLetters', 'coverLetters_resumeId_fkey');

    await queryInterface.addConstraint('coverLetters', {
      fields: ['resumeId'],
      type: 'foreign key',
      name: 'coverLetters_resumeId_fkey',
      references: {
        table: 'resumes',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // 1. Restore the original foreign key constraint behavior
    await queryInterface.removeConstraint('coverLetters', 'coverLetters_resumeId_fkey');

    await queryInterface.addConstraint('coverLetters', {
      fields: ['resumeId'],
      type: 'foreign key',
      name: 'coverLetters_resumeId_fkey',
      references: {
        table: 'resumes',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // 2. Remove the added column
    await queryInterface.removeColumn('coverLetters', 'jobDescription');
  }
}; 