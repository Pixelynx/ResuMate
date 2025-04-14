'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Add job description column
    await queryInterface.addColumn('coverletters', 'jobdescription', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    // 2. Update the foreign key constraint to cascade on delete
    await queryInterface.removeConstraint('coverletters', 'coverletters_resumeid_fkey');

    await queryInterface.addConstraint('coverletters', {
      fields: ['resumeid'],
      type: 'foreign key',
      name: 'coverletters_resumeid_fkey',
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
    await queryInterface.removeConstraint('coverletters', 'coverletters_resumeid_fkey');

    await queryInterface.addConstraint('coverletters', {
      fields: ['resumeid'],
      type: 'foreign key',
      name: 'coverletters_resumeid_fkey',
      references: {
        table: 'resumes',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // 2. Remove the added column
    await queryInterface.removeColumn('coverletters', 'jobdescription');
  }
}; 
