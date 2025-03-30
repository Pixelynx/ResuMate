'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
    async up(queryInterface, Sequelize) {
        // Create resume IDs upfront so they can be referenced consistently
        const resumeIds = {
            softwareEngineer: uuidv4(),
            dataScientist: uuidv4(),
            fullStackDev: uuidv4(),
            devOpsEngineer: uuidv4(),
            backendDev: uuidv4(),
            marketingCoord: uuidv4(),
            hrSpecialist: uuidv4()
        };

        await queryInterface.bulkInsert('resumes', [
            // Technical Role 1: Software Engineer
            {
                id: resumeIds.softwareEngineer,
                firstName: 'John',
                lastName: 'Doe',
                title: 'Software Engineer',
                email: 'john.doe@example.com',
                phone: '123-456-7890',
                location: 'New York, NY',
                linkedin: 'https://www.linkedin.com/in/johndoe',
                website: 'https://johndoe.com',
                github: 'https://github.com/johndoe',
                instagram: 'https://instagram.com/johndoe',
                workExperience: JSON.stringify([
                    {
                        companyName: 'Tech Company',
                        jobTitle: 'Frontend Developer',
                        location: 'Remote',
                        startDate: new Date('2022-01-01'),
                        endDate: new Date('2023-01-01'),
                        description: 'Developed user interfaces for web applications.'
                    }
                ]),
                education: JSON.stringify([
                    {
                        institutionName: 'University of Example',
                        degree: 'Bachelor of Science in Computer Science',
                        fieldOfStudy: 'Computer Science',
                        location: 'Example City, EX',
                        graduationDate: new Date('2021-05-01')
                    }
                ]),
                skills: JSON.stringify({
                    skills_: 'JavaScript, React, Node.js',
                    languages: 'English, Spanish'
                }),
                certifications: JSON.stringify([
                    {
                        name: 'Certified JavaScript Developer',
                        organization: 'Example Certification Body',
                        dateObtained: new Date('2021-06-01'),
                        expirationDate: null,
                        credentialUrl: 'https://example.com/certification/johndoe'
                    }
                ]),
                projects: JSON.stringify([
                    {
                        title: 'Personal Portfolio',
                        role: 'Lead Developer',
                        duration: '3 months',
                        description: 'Created a personal portfolio website to showcase projects.',
                        technologies: 'React, CSS, JavaScript',
                        projectUrl: 'https://johndoe.com/portfolio'
                    }
                ]),
                createdAt: new Date(),
                updatedAt: new Date()
            },
            // Technical Role 2: Data Scientist
            {
                id: resumeIds.dataScientist,
                firstName: 'Jane',
                lastName: 'Smith',
                title: 'Data Scientist',
                email: 'jane.smith@example.com',
                phone: '987-654-3210',
                location: 'San Francisco, CA',
                linkedin: 'https://www.linkedin.com/in/janesmith',
                website: 'https://janesmith.com',
                github: 'https://github.com/janesmith',
                instagram: 'https://instagram.com/janesmith',
                workExperience: JSON.stringify([
                    {
                        companyName: 'Data Corp',
                        jobTitle: 'Data Analyst',
                        location: 'Remote',
                        startDate: new Date('2020-01-01'),
                        endDate: new Date('2021-12-31'),
                        description: 'Analyzed data to provide insights for business decisions.'
                    }
                ]),
                education: JSON.stringify([
                    {
                        institutionName: 'Example University',
                        degree: 'Master of Science in Data Science',
                        fieldOfStudy: 'Data Science',
                        location: 'Example City, EX',
                        graduationDate: new Date('2019-05-01')
                    }
                ]),
                skills: JSON.stringify({
                    skills_: 'Python, R, SQL',
                    languages: 'English, French'
                }),
                certifications: JSON.stringify([
                    {
                        name: 'Certified Data Scientist',
                        organization: 'Data Science Institute',
                        dateObtained: new Date('2019-06-01'),
                        expirationDate: null,
                        credentialUrl: 'https://example.com/certification/janesmith'
                    }
                ]),
                projects: JSON.stringify([
                    {
                        title: 'Sales Forecasting Model',
                        role: 'Data Scientist',
                        duration: '2 months',
                        description: 'Developed a model to forecast sales using historical data.',
                        technologies: 'Python, Pandas, Scikit-learn',
                        projectUrl: 'https://janesmith.com/sales-forecasting'
                    }
                ]),
                createdAt: new Date(),
                updatedAt: new Date()
            },
            // Technical Role 3: Full Stack Developer
            {
                id: resumeIds.fullStackDev,
                firstName: 'Alice',
                lastName: 'Johnson',
                title: 'Full Stack Developer',
                email: 'alice.johnson@example.com',
                phone: '555-123-4567',
                location: 'Austin, TX',
                linkedin: 'https://www.linkedin.com/in/alicejohnson',
                website: 'https://alicejohnson.dev',
                github: 'https://github.com/alicejohnson',
                instagram: null,
                workExperience: JSON.stringify([
                    {
                        companyName: 'Web Solutions Inc.',
                        jobTitle: 'Software Engineer',
                        location: 'Austin, TX',
                        startDate: new Date('2021-06-01'),
                        endDate: new Date('2024-12-31'),
                        description: 'Developed and maintained full-stack applications using React and Node.js.'
                    },
                    {
                        companyName: 'Startup Hub',
                        jobTitle: 'Junior Developer',
                        location: 'Remote',
                        startDate: new Date('2019-01-01'),
                        endDate: new Date('2021-05-31'),
                        description: 'Collaborated on building MVPs for various startups.'
                    }
                ]),
                education: JSON.stringify([
                    {
                        institutionName: 'Tech University',
                        degree: 'Bachelor of Science in Software Engineering',
                        fieldOfStudy: 'Software Engineering',
                        location: 'Austin, TX',
                        graduationDate: new Date('2018-05-01')
                    }
                ]),
                skills: JSON.stringify({
                    skills_: 'JavaScript, React, Node.js, MongoDB, Docker',
                    languages: 'English'
                }),
                certifications: JSON.stringify([
                    {
                        name: 'AWS Certified Developer - Associate',
                        organization: 'Amazon Web Services',
                        dateObtained: new Date('2022-03-01'),
                        expirationDate: null,
                        credentialUrl: 'https://aws.amazon.com/certification'
                    }
                ]),
                projects: JSON.stringify([
                    {
                        title: 'E-commerce Platform',
                        role: 'Lead Developer',
                        duration: '6 months',
                        description:
                            'Built a scalable e-commerce platform with features like user authentication and payment integration.',
                        technologies: 'React, Redux, Node.js, PostgreSQL',
                        projectUrl: null
                    }
                ]),
                createdAt: new Date(),
                updatedAt: new Date()
            },
            // Technical Role 4: DevOps Engineer
            {
                id: resumeIds.devOpsEngineer,
                firstName: 'Bob',
                lastName: 'Lee',
                title: 'DevOps Engineer',
                email: 'bob.lee@example.com',
                phone: '555-987-6543',
                location: 'Seattle, WA',
                linkedin: null,
                website: null,
                github: null,
                instagram: null,
                workExperience: JSON.stringify([
                    {
                        companyName: 'CloudOps LLC',
                        jobTitle: 'DevOps Engineer',
                        location: 'Remote',
                        startDate: new Date('2020-05-01'),
                        endDate: null,
                        description:
                            'Implemented CI/CD pipelines and automated infrastructure using Terraform and Kubernetes.'
                    }
                ]),
                education: JSON.stringify([]), // Empty array rather than string
                skills: JSON.stringify({
                    skills_: "Kubernetes, Terraform, Jenkins",
                    languages: "English"
                }),
                certifications: JSON.stringify([
                    { 
                        name: "Certified Kubernetes Administrator",
                        organization: "Cloud Native Computing Foundation",
                        dateObtained: new Date('2022-01-15')
                    }
                ]),
                projects: JSON.stringify([]), // Empty array rather than null
                createdAt: new Date(),
                updatedAt: new Date()
            },
            // Technical Role 5: Backend Developer
            {
                id: resumeIds.backendDev,
                firstName: 'Ethan',
                lastName: 'Brown',
                title: 'Backend Developer',
                email: 'ethan.brown@example.com',
                phone: '555-789-1234',
                location: 'Denver, CO',
                linkedin: 'https://www.linkedin.com/in/ethanbrown',
                website: null,
                github: 'https://github.com/ethanbrown',
                instagram: null,
                workExperience: JSON.stringify([
                    {
                        companyName: 'Cloud Solutions Inc.',
                        jobTitle: 'Backend Developer',
                        location: 'Remote',
                        startDate: new Date('2021-07-01'),
                        endDate: null,
                        description:
                            'Designed and optimized RESTful APIs, improving response times by 30%.'
                    },
                    {
                        companyName: 'DataTech LLC',
                        jobTitle: 'Junior Backend Developer',
                        location: 'Denver, CO',
                        startDate: new Date('2019-06-01'),
                        endDate: new Date('2021-06-30'),
                        description:
                            'Maintained and enhanced database schemas for large-scale applications.'
                    }
                ]),
                education: JSON.stringify([
                    {
                        institutionName: 'State University of Colorado',
                        degree: 'Bachelor of Science in Computer Engineering',
                        fieldOfStudy: 'Computer Engineering',
                        location: 'Denver, CO',
                        graduationDate: new Date('2019-05-01')
                    }
                ]),
                skills: JSON.stringify({
                    skills_: 'Python, Django, PostgreSQL, Docker, AWS',
                    languages: 'English'
                }),
                certifications: JSON.stringify([
                    {
                        name: 'AWS Certified Solutions Architect - Associate',
                        organization: 'Amazon Web Services',
                        dateObtained: new Date('2023-04-01'),
                        expirationDate: null,
                        credentialUrl:
                            'https://aws.amazon.com/certification/certified-solutions-architect-associate/'
                    }
                ]),
                projects: JSON.stringify([
                    {
                        title: 'Inventory Management System',
                        role: 'Lead Backend Developer',
                        duration: '4 months',
                        description:
                            'Developed an inventory management system for tracking stock levels and sales.',
                        technologies:
                            'Django, PostgreSQL, Redis, Docker, AWS Lambda',
                        projectUrl: null
                    }
                ]),
                createdAt: new Date(),
                updatedAt: new Date()
            },
            // Non-Technical Role 1: Marketing Coordinator
            {
                id: resumeIds.marketingCoord,
                firstName: 'Sophia',
                lastName: 'Williams',
                title: 'Marketing Coordinator',
                email: 'sophia.williams@example.com',
                phone: '555-321-9876',
                location: 'Chicago, IL',
                linkedin: 'https://www.linkedin.com/in/sophiawilliams',
                website: null,
                github: null,
                instagram: null,
                workExperience: JSON.stringify([
                    {
                        companyName: 'Creative Agency Co.',
                        jobTitle: 'Marketing Coordinator',
                        location: 'Chicago, IL',
                        startDate: new Date('2022-03-01'),
                        endDate: null,
                        description:
                            'Managed social media campaigns and increased engagement by 40%. Coordinated marketing events and created promotional materials.'
                    },
                    {
                        companyName: 'Brand Builders LLC',
                        jobTitle: 'Marketing Assistant',
                        location: 'Remote',
                        startDate: new Date('2020-06-01'),
                        endDate: new Date('2022-02-28'),
                        description:
                            'Assisted in developing marketing strategies and analyzed campaign performance metrics.'
                    }
                ]),
                education: JSON.stringify([
                    {
                        institutionName: 'University of Illinois',
                        degree: 'Bachelor of Arts in Marketing',
                        fieldOfStudy: 'Marketing',
                        location: 'Chicago, IL',
                        graduationDate: new Date('2020-05-01')
                    }
                ]),
                skills: JSON.stringify({
                    skills_: 'Communication, Organization, Creativity, Social Media Management, Data Analysis',
                    languages: 'English'
                }),
                certifications: JSON.stringify([]), // Empty array instead of null
                projects: JSON.stringify([]), // Empty array instead of null
                createdAt: new Date(),
                updatedAt: new Date()
            },
            // Non-Technical Role 2: Human Resources Specialist
            {
                id: resumeIds.hrSpecialist,
                firstName: 'Michael',
                lastName: 'Taylor',
                title: 'Human Resources Specialist',
                email: 'michael.taylor@example.com',
                phone: '555-654-7890',
                location: 'Atlanta, GA',
                linkedin: null,
                website: null,
                github: null,
                instagram: null,
                workExperience: JSON.stringify([
                    {
                        companyName: 'People First Inc.',
                        jobTitle: 'HR Specialist',
                        location: 'Atlanta, GA',
                        startDate: new Date('2021-04-01'),
                        endDate: null,
                        description:
                            'Managed recruitment processes and onboarding for over 50 employees. Resolved workplace conflicts and improved employee satisfaction by 20%.'
                    },
                    {
                        companyName: 'Talent Solutions LLC',
                        jobTitle: 'HR Assistant',
                        location: 'Remote',
                        startDate: new Date('2019-08-01'),
                        endDate: new Date('2021-03-31'),
                        description:
                            'Supported HR operations including payroll processing and benefits administration.'
                    }
                ]),
                education: JSON.stringify([
                    {
                        institutionName: 'Emory University',
                        degree: 'Bachelor of Science in Human Resources Management',
                        fieldOfStudy: 'Human Resources',
                        location: 'Atlanta, GA',
                        graduationDate: new Date('2019-05-15')
                    }
                ]),
                skills: JSON.stringify({
                    skills_: 'Recruitment, Employee Relations, Benefits Administration, Conflict Resolution',
                    languages: 'English'
                }),
                certifications: JSON.stringify([]), // Empty array instead of invalid object
                projects: JSON.stringify([]), // Empty array instead of null
                createdAt: new Date(),
                updatedAt: new Date()
            },
        ]);

        console.log('Resume seed data inserted with predefined IDs for consistent referencing');
        return Promise.resolve();
    },

    async down(queryInterface, Sequelize) {
        // Will cascade delete related cover letters due to foreign key constraint
        await queryInterface.bulkDelete('resumes', null, {});
        console.log('Resume seed data deleted (including cascade delete of related cover letters)');
        return Promise.resolve();
    }
};