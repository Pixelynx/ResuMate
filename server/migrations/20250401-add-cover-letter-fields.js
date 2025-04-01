'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // First check if the columns already exist to prevent errors
      const tableInfo = await queryInterface.describeTable('coverLetters');
      
      const columnsToAdd = [];
      
      if (!tableInfo.firstName) {
        columnsToAdd.push(['firstName', {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: '' // Temporary default for existing records
        }]);
      }
      
      if (!tableInfo.lastName) {
        columnsToAdd.push(['lastName', {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: '' // Temporary default for existing records
        }]);
      }
      
      if (!tableInfo.email) {
        columnsToAdd.push(['email', {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: '' // Temporary default for existing records
        }]);
      }
      
      if (!tableInfo.phoneNumber) {
        columnsToAdd.push(['phoneNumber', {
          type: Sequelize.STRING,
          allowNull: true
        }]);
      }
      
      if (!tableInfo.prevEmployed) {
        columnsToAdd.push(['prevEmployed', {
          type: Sequelize.JSON,
          allowNull: true
        }]);
      }
      
      if (!tableInfo.createDate) {
        columnsToAdd.push(['createDate', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }]);
      }
      
      // Add the columns
      for (const [columnName, columnDefinition] of columnsToAdd) {
        await queryInterface.addColumn('coverLetters', columnName, columnDefinition);
      }
      
      console.log(`Successfully added ${columnsToAdd.length} columns to coverLetters table`);
      
      return Promise.resolve();
    } catch (error) {
      console.error('Migration error:', error);
      return Promise.reject(error);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Remove columns in reverse order
      await queryInterface.removeColumn('coverLetters', 'createDate');
      await queryInterface.removeColumn('coverLetters', 'prevEmployed');
      await queryInterface.removeColumn('coverLetters', 'phoneNumber');
      await queryInterface.removeColumn('coverLetters', 'email');
      await queryInterface.removeColumn('coverLetters', 'lastName');
      await queryInterface.removeColumn('coverLetters', 'firstName');
      
      console.log('Successfully removed all added columns from coverLetters table');
      
      return Promise.resolve();
    } catch (error) {
      console.error('Migration rollback error:', error);
      return Promise.reject(error);
    }
  }
}; 