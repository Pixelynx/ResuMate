'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const result = await queryInterface.sequelize.query(
        `SELECT data_type FROM information_schema.columns 
         WHERE table_name = 'coverletters' 
         AND column_name = 'generationOptions'`
      );
      
      // If the column doesn't exist, add it directly with JSON type
      if (result[0].length === 0) {
        return queryInterface.addColumn('coverletters', 'generationOptions', {
          type: Sequelize.JSON,
          allowNull: true,
          defaultValue: null
        });
      }
      
      // If column exists but needs conversion
      // First ensure data is safe by converting any NULL or empty strings to valid JSON
      await queryInterface.sequelize.query(`
        UPDATE "coverletters" 
        SET "generationOptions" = '{}' 
        WHERE "generationOptions" IS NOT NULL AND "generationOptions" = ''
      `);
      
      // Convert the column to JSON with safe casting
      return queryInterface.sequelize.query(`
        ALTER TABLE "coverletters" 
        ALTER COLUMN "generationOptions" 
        TYPE JSON USING CASE 
          WHEN "generationOptions" IS NULL THEN NULL
          ELSE "generationOptions"::json
        END
      `);
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // If needed, convert back to TEXT type
    return queryInterface.changeColumn('coverletters', 'generationOptions', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null
    });
  }
};