'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get the existing resume IDs to link cover letters correctly
    const resumes = await queryInterface.sequelize.query(
      'SELECT id, firstname, lastname, title FROM resumes',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Create cover letters linked to the existing resumes
    const coverletters = [];

    // Cover letter for Software Engineer resume (John Doe)
    if (resumes.length > 0) {
      const softwareEngineerResume = resumes.find(r => r.title === 'Software Engineer');
      if (softwareEngineerResume) {
        coverletters.push({
          id: uuidv4(),
          firstname: 'John',
          lastname: 'Doe',
          title: 'Frontend Developer Application - Tech Innovators',
          content: `Dear Hiring Manager,

I am writing to express my interest in the Frontend Developer position at Tech Innovators. With over 3 years of experience in building responsive and intuitive user interfaces using React and related frontend technologies, I believe I would be a valuable addition to your team.

In my current role at Tech Company, I've successfully implemented performance optimizations that improved page load times by 40%. I've also collaborated closely with UX designers to ensure pixel-perfect implementations of design mockups.

My expertise in JavaScript, React, and modern frontend tools aligns perfectly with the requirements listed in your job description. I'm particularly excited about the opportunity to work on projects that focus on accessibility and performance optimization.

I look forward to discussing how my skills and experience can contribute to Tech Innovators' continued success.

Sincerely,
John Doe`,
          resumeid: softwareEngineerResume.id,
          email: 'johndoe@resumate.com',
          phoneNumber: '+11112223333',
          jobtitle: 'Frontend Developer',
          company: 'Tech Innovators',
          jobdescription: `We are looking for a Frontend Developer who is proficient with React.js. The ideal candidate should have:
- 3+ years of experience with JavaScript and React
- Strong understanding of responsive design
- Experience with performance optimization
- Knowledge of frontend testing frameworks
- Ability to work in an agile team environment
- Experience with TypeScript and Redux is a plus`,
          generationOptions: JSON.stringify({
            tone: 'professional',
            length: 'medium',
            emphasis: ['experience', 'technical skills']
          }),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // Cover letter for Data Scientist resume (Jane Smith)
      const dataScientistResume = resumes.find(r => r.title === 'Data Scientist');
      if (dataScientistResume) {
        coverletters.push({
          id: uuidv4(),
          firstname: 'Jane',
          lastname: 'Smith',
          title: 'Data Scientist Position - DataCrunch Analytics',
          content: `Dear Hiring Team,

I am excited to apply for the Data Scientist position at DataCrunch Analytics. As a data scientist with a strong background in statistical analysis and machine learning, I am confident in my ability to contribute to your team's success.

Throughout my career at Data Corp, I have developed and deployed machine learning models that have directly impacted business decisions, resulting in a 25% increase in operational efficiency. My expertise in Python, R, and SQL has allowed me to effectively clean, analyze, and visualize complex datasets.

I was particularly drawn to this position because of DataCrunch Analytics' focus on leveraging data to solve real-world problems. Your company's commitment to innovation and data-driven decision making aligns perfectly with my professional values.

I would welcome the opportunity to discuss how my skills and experience can help DataCrunch Analytics continue to lead in the field of data science.

Best regards,
Jane Smith`,
          resumeid: dataScientistResume.id,
          email: 'janesmith@resumate.com',
          phoneNumber: '+11112223334',
          jobtitle: 'Data Scientist',
          company: 'DataCrunch Analytics',
          jobdescription: `DataCrunch Analytics is seeking a skilled Data Scientist to join our growing team. Requirements:
- MS or PhD in Statistics, Mathematics, Computer Science or related field
- Strong programming skills in Python and R
- Experience with SQL and database systems
- Knowledge of machine learning algorithms and statistical modeling
- Excellent communication skills to present findings to stakeholders
- Experience with big data technologies (Hadoop, Spark) is a plus`,
          generationOptions: JSON.stringify({
            tone: 'professional',
            length: 'medium',
            emphasis: ['technical skills', 'experience']
          }),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // Cover letter for Full Stack Developer resume (Alice Johnson)
      const fullStackResume = resumes.find(r => r.title === 'Full Stack Developer');
      if (fullStackResume) {
        coverletters.push({
          id: uuidv4(),
          firstname: 'Alice',
          lastname: 'Johnson',
          title: 'Full Stack Developer Application - SaaS Solutions',
          content: `Dear Hiring Manager,

I am writing to express my interest in the Full Stack Developer position at SaaS Solutions. With a strong background in both frontend and backend development, I am excited about the opportunity to contribute to your innovative SaaS platform.

At Web Solutions Inc., I led the development of several key features for our flagship product, resulting in a 30% increase in user engagement. My experience with React, Node.js, and MongoDB has prepared me well for the technology stack mentioned in your job posting.

I am particularly impressed by SaaS Solutions' commitment to creating scalable products that solve real business problems. The opportunity to work on your microservices architecture is especially appealing to me, as I have been focusing on developing my skills in this area.

I look forward to discussing how my technical skills and experience can benefit your team at SaaS Solutions.

Best regards,
Alice Johnson`,
          resumeid: fullStackResume.id,
          phoneNumber: '+11112223335',
          email: 'alicejohnson@resumate.com',
          jobtitle: 'Full Stack Developer',
          company: 'SaaS Solutions',
          jobdescription: `We're looking for a Full Stack Developer to join our team building enterprise SaaS solutions. The ideal candidate will have:
- 3+ years of experience in full stack development
- Proficiency in React or Angular on the frontend
- Experience with Node.js and Express on the backend
- Knowledge of MongoDB or other NoSQL databases
- Understanding of microservices architecture
- Experience with AWS or other cloud platforms
- Excellent problem-solving and communication skills`,
          generationOptions: JSON.stringify({
            tone: 'confident',
            length: 'medium',
            emphasis: ['technical skills', 'problem solving']
          }),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // Cover letter for Marketing Coordinator resume
      const marketingResume = resumes.find(r => r.title === 'Marketing Coordinator');
      if (marketingResume) {
        coverletters.push({
          id: uuidv4(),
          firstname: 'Sophia',
          lastname: 'Williams',
          title: 'Marketing Coordinator Position - Global Brands Inc.',
          content: `Dear Hiring Manager,

I am excited to apply for the Marketing Coordinator position at Global Brands Inc. With my background in marketing coordination and social media management, I believe I can make a significant contribution to your marketing team.

In my current role at Creative Agency Co., I have successfully managed social media campaigns that increased engagement by 40% and led to a 25% growth in our client base. My experience in coordinating marketing events and creating promotional materials has given me the skills needed to excel in this position.

I was particularly drawn to Global Brands Inc. because of your innovative approach to digital marketing and your impressive portfolio of international clients. I am excited about the opportunity to work with your team to develop and implement effective marketing strategies.

Thank you for considering my application. I look forward to the possibility of discussing my qualifications further.

Sincerely,
Sophia Williams`,
          resumeid: marketingResume.id,
          email: 'sophiawilliams@resumate.com',
          phoneNumber: '+11112223336',
          jobtitle: 'Marketing Coordinator',
          company: 'Global Brands Inc.',
          jobdescription: `Global Brands Inc. is seeking a Marketing Coordinator to join our dynamic team. Responsibilities include:
- Developing and implementing social media strategies
- Creating and distributing marketing materials
- Assisting with event planning and coordination
- Analyzing campaign performance metrics
- Collaborating with design and content teams
- Managing email marketing campaigns

Requirements:
- Bachelor's degree in Marketing or related field
- 2+ years of experience in marketing coordination
- Strong social media and communication skills
- Experience with digital marketing tools and analytics
- Ability to manage multiple projects simultaneously`,
          generationOptions: JSON.stringify({
            tone: 'enthusiastic',
            length: 'medium',
            emphasis: ['experience', 'communication skills']
          }),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    await queryInterface.bulkInsert('coverletters', coverletters, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('coverletters', null, {});
  }
}; 