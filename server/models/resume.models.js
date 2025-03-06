const db = require('../config/database');

exports.getAll = async () => {
  const { rows } = await db.query('SELECT * FROM resumes');
  return rows;
};

exports.create = async (resume) => {
  const { rows } = await db.query(
    'INSERT INTO resumes (name, email, phone, education, experience) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [resume.name, resume.email, resume.phone, resume.education, resume.experience]
  );
  return rows[0];
};