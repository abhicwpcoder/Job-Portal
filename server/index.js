import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || '',
  user: process.env.DB_USER || '',
  password: 'Abhijeet#1802',
  database: process.env.DB_NAME || ''
};

// Create database connection
let db;
try {
  db = await mysql.createConnection(dbConfig);
  console.log('Connected to MySQL database');
  await initializeDatabase();
} catch (error) {
  console.error('Database connection failed:', error);
}

// Initialize database tables
async function initializeDatabase() {
  try {
    // Create users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create jobs table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS jobs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        salary VARCHAR(100),
        description TEXT NOT NULL,
        requirements TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create applications table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        job_id INT NOT NULL,
        user_id INT NOT NULL,
        cover_letter TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Insert default jobs if table is empty
    const [existingJobs] = await db.execute('SELECT COUNT(*) as count FROM jobs');
    if (existingJobs[0].count === 0) {
      await insertDefaultJobs();
    }

    console.log('Database tables initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Insert 20 default job posts
async function insertDefaultJobs() {
  const defaultJobs = [
    {
      title: 'Senior Software Engineer',
      company: 'TechCorp Solutions',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: '$120,000 - $160,000',
      description: 'We are seeking a Senior Software Engineer to join our dynamic team. You will be responsible for designing, developing, and maintaining scalable web applications using modern technologies. This role offers excellent growth opportunities and the chance to work on cutting-edge projects.',
      requirements: 'Bachelor\'s degree in Computer Science or related field\n5+ years of experience in software development\nProficiency in JavaScript, React, Node.js\nExperience with cloud platforms (AWS, Azure)\nStrong problem-solving skills\nExcellent communication abilities'
    },
    {
      title: 'Product Manager',
      company: 'InnovateLabs',
      location: 'New York, NY',
      type: 'Full-time',
      salary: '$100,000 - $140,000',
      description: 'Join our product team as a Product Manager where you\'ll drive product strategy and execution. You\'ll work closely with engineering, design, and marketing teams to deliver exceptional user experiences and drive business growth.',
      requirements: 'MBA or equivalent experience\n3+ years in product management\nExperience with agile methodologies\nStrong analytical skills\nExcellent stakeholder management\nData-driven decision making'
    },
    {
      title: 'UX/UI Designer',
      company: 'DesignStudio Pro',
      location: 'Los Angeles, CA',
      type: 'Full-time',
      salary: '$80,000 - $110,000',
      description: 'We\'re looking for a creative UX/UI Designer to create intuitive and visually appealing user interfaces. You\'ll collaborate with product managers and developers to design user-centered solutions that enhance user experience.',
      requirements: 'Bachelor\'s degree in Design or related field\n3+ years of UX/UI design experience\nProficiency in Figma, Sketch, Adobe Creative Suite\nStrong portfolio demonstrating design process\nUnderstanding of user research methods\nKnowledge of front-end development principles'
    },
    {
      title: 'Data Scientist',
      company: 'DataTech Analytics',
      location: 'Seattle, WA',
      type: 'Full-time',
      salary: '$110,000 - $150,000',
      description: 'Join our data science team to extract insights from complex datasets and build predictive models. You\'ll work on machine learning projects that directly impact business decisions and product development.',
      requirements: 'Master\'s degree in Data Science, Statistics, or related field\nProficiency in Python, R, SQL\nExperience with machine learning frameworks\nStrong statistical analysis skills\nExperience with big data technologies\nExcellent presentation skills'
    },
    {
      title: 'Marketing Specialist',
      company: 'GrowthMarketing Inc',
      location: 'Chicago, IL',
      type: 'Full-time',
      salary: '$60,000 - $80,000',
      description: 'We\'re seeking a Marketing Specialist to develop and execute marketing campaigns across multiple channels. You\'ll analyze market trends, create compelling content, and drive customer acquisition and retention.',
      requirements: 'Bachelor\'s degree in Marketing or related field\n2+ years of marketing experience\nExperience with digital marketing tools\nStrong analytical and creative skills\nKnowledge of SEO/SEM\nExcellent written communication'
    },
    {
      title: 'DevOps Engineer',
      company: 'CloudFirst Technologies',
      location: 'Austin, TX',
      type: 'Full-time',
      salary: '$95,000 - $130,000',
      description: 'Join our DevOps team to build and maintain scalable infrastructure. You\'ll work on automation, CI/CD pipelines, and cloud infrastructure to support our growing platform.',
      requirements: 'Bachelor\'s degree in Computer Science or related field\n3+ years of DevOps experience\nExperience with AWS, Docker, Kubernetes\nProficiency in scripting languages\nKnowledge of monitoring and logging tools\nStrong troubleshooting skills'
    },
    {
      title: 'Sales Representative',
      company: 'SalesForce Pro',
      location: 'Miami, FL',
      type: 'Full-time',
      salary: '$50,000 - $70,000 + Commission',
      description: 'We\'re looking for an energetic Sales Representative to join our growing sales team. You\'ll be responsible for generating leads, building relationships with clients, and closing deals.',
      requirements: 'Bachelor\'s degree preferred\n1+ years of sales experience\nExcellent communication skills\nStrong negotiation abilities\nSelf-motivated and goal-oriented\nCRM software experience'
    },
    {
      title: 'Frontend Developer',
      company: 'WebDev Solutions',
      location: 'Portland, OR',
      type: 'Full-time',
      salary: '$75,000 - $100,000',
      description: 'Join our frontend team to build responsive and interactive web applications. You\'ll work with modern frameworks and collaborate with designers to create exceptional user experiences.',
      requirements: 'Bachelor\'s degree in Computer Science or related field\n2+ years of frontend development experience\nProficiency in HTML, CSS, JavaScript\nExperience with React or Vue.js\nKnowledge of responsive design\nAttention to detail'
    },
    {
      title: 'HR Manager',
      company: 'PeopleFirst Corp',
      location: 'Denver, CO',
      type: 'Full-time',
      salary: '$70,000 - $90,000',
      description: 'We\'re seeking an HR Manager to oversee all aspects of human resources practices and processes. You\'ll support business needs and ensure the proper implementation of company strategy and objectives.',
      requirements: 'Bachelor\'s degree in HR or related field\n5+ years of HR experience\nKnowledge of employment law\nStrong interpersonal skills\nExperience with HRIS systems\nPHR or SHRM certification preferred'
    },
    {
      title: 'Backend Developer',
      company: 'ServerSide Technologies',
      location: 'Boston, MA',
      type: 'Full-time',
      salary: '$85,000 - $115,000',
      description: 'Join our backend team to develop robust server-side applications and APIs. You\'ll work on scalable systems that power our web and mobile applications.',
      requirements: 'Bachelor\'s degree in Computer Science\n3+ years of backend development experience\nProficiency in Node.js, Python, or Java\nExperience with databases (SQL/NoSQL)\nKnowledge of API design principles\nUnderstanding of microservices architecture'
    },
    {
      title: 'Graphic Designer',
      company: 'Creative Minds Studio',
      location: 'Nashville, TN',
      type: 'Part-time',
      salary: '$25 - $35 per hour',
      description: 'We\'re looking for a talented Graphic Designer to create visual concepts that communicate ideas that inspire, inform, and captivate consumers. You\'ll work on various projects including branding, marketing materials, and digital assets.',
      requirements: 'Bachelor\'s degree in Graphic Design or related field\n2+ years of graphic design experience\nProficiency in Adobe Creative Suite\nStrong portfolio showcasing creativity\nAttention to detail\nAbility to work under tight deadlines'
    },
    {
      title: 'Project Manager',
      company: 'ProjectPro Management',
      location: 'Phoenix, AZ',
      type: 'Full-time',
      salary: '$80,000 - $105,000',
      description: 'Join our team as a Project Manager to lead cross-functional teams and deliver projects on time and within budget. You\'ll coordinate resources, manage stakeholders, and ensure project success.',
      requirements: 'Bachelor\'s degree in Business or related field\n4+ years of project management experience\nPMP certification preferred\nExperience with project management tools\nStrong leadership skills\nExcellent organizational abilities'
    },
    {
      title: 'Content Writer',
      company: 'ContentCraft Media',
      location: 'Remote',
      type: 'Contract',
      salary: '$30 - $50 per hour',
      description: 'We\'re seeking a skilled Content Writer to create engaging and informative content for various digital platforms. You\'ll research topics, write articles, and optimize content for SEO.',
      requirements: 'Bachelor\'s degree in English, Journalism, or related field\n2+ years of content writing experience\nExcellent writing and editing skills\nSEO knowledge\nResearch abilities\nAbility to meet deadlines'
    },
    {
      title: 'Quality Assurance Engineer',
      company: 'TestTech Solutions',
      location: 'San Diego, CA',
      type: 'Full-time',
      salary: '$70,000 - $95,000',
      description: 'Join our QA team to ensure the quality and reliability of our software products. You\'ll design test cases, execute testing procedures, and work closely with development teams to identify and resolve issues.',
      requirements: 'Bachelor\'s degree in Computer Science or related field\n3+ years of QA experience\nExperience with automated testing tools\nKnowledge of testing methodologies\nAttention to detail\nStrong analytical skills'
    },
    {
      title: 'Business Analyst',
      company: 'Analytics Pro',
      location: 'Atlanta, GA',
      type: 'Full-time',
      salary: '$75,000 - $100,000',
      description: 'We\'re looking for a Business Analyst to analyze business processes and recommend improvements. You\'ll gather requirements, document processes, and work with stakeholders to implement solutions.',
      requirements: 'Bachelor\'s degree in Business or related field\n3+ years of business analysis experience\nStrong analytical skills\nExperience with requirements gathering\nKnowledge of process improvement methodologies\nExcellent communication skills'
    },
    {
      title: 'Mobile App Developer',
      company: 'MobileTech Innovations',
      location: 'San Jose, CA',
      type: 'Full-time',
      salary: '$90,000 - $120,000',
      description: 'Join our mobile development team to create innovative iOS and Android applications. You\'ll work on user-friendly mobile solutions that reach millions of users worldwide.',
      requirements: 'Bachelor\'s degree in Computer Science\n3+ years of mobile development experience\nProficiency in Swift/Kotlin or React Native\nExperience with mobile UI/UX principles\nKnowledge of mobile testing frameworks\nApp Store/Play Store publishing experience'
    },
    {
      title: 'Cybersecurity Specialist',
      company: 'SecureNet Systems',
      location: 'Washington, DC',
      type: 'Full-time',
      salary: '$100,000 - $135,000',
      description: 'We\'re seeking a Cybersecurity Specialist to protect our organization\'s computer systems and networks. You\'ll monitor security breaches, implement security measures, and conduct security assessments.',
      requirements: 'Bachelor\'s degree in Cybersecurity or related field\n4+ years of cybersecurity experience\nSecurity certifications (CISSP, CEH, etc.)\nKnowledge of security frameworks\nExperience with security tools\nStrong problem-solving skills'
    },
    {
      title: 'Financial Analyst',
      company: 'FinanceFirst Advisory',
      location: 'Charlotte, NC',
      type: 'Full-time',
      salary: '$65,000 - $85,000',
      description: 'Join our finance team as a Financial Analyst to analyze financial data and create reports that guide business decisions. You\'ll work on budgeting, forecasting, and financial modeling.',
      requirements: 'Bachelor\'s degree in Finance or related field\n2+ years of financial analysis experience\nProficiency in Excel and financial software\nStrong analytical skills\nKnowledge of financial modeling\nCFA certification preferred'
    },
    {
      title: 'Customer Success Manager',
      company: 'ClientCare Solutions',
      location: 'Dallas, TX',
      type: 'Full-time',
      salary: '$70,000 - $90,000',
      description: 'We\'re looking for a Customer Success Manager to ensure our clients achieve their desired outcomes while using our products. You\'ll build relationships, provide support, and drive customer retention.',
      requirements: 'Bachelor\'s degree in Business or related field\n3+ years of customer success experience\nExcellent communication skills\nStrong relationship-building abilities\nExperience with CRM systems\nProblem-solving mindset'
    },
    {
      title: 'Operations Manager',
      company: 'EfficiencyFirst Operations',
      location: 'Minneapolis, MN',
      type: 'Full-time',
      salary: '$85,000 - $110,000',
      description: 'Join our operations team as an Operations Manager to oversee daily operations and improve operational efficiency. You\'ll manage teams, optimize processes, and ensure quality standards.',
      requirements: 'Bachelor\'s degree in Operations Management or related field\n5+ years of operations experience\nStrong leadership skills\nExperience with process improvement\nKnowledge of supply chain management\nExcellent organizational abilities'
    }
  ];

  for (const job of defaultJobs) {
    await db.execute(
      `INSERT INTO jobs (title, company, location, type, salary, description, requirements) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [job.title, job.company, job.location, job.type, job.salary, job.description, job.requirements]
    );
  }

  console.log('Default jobs inserted successfully');
}

// Email configuration
// const transporter = nodemailer.createTransporter({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// User registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    console.log(req.body);
    
    
    // Check if user already exists
    const [existingUser] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user
    const [result] = await db.execute(
      `INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)`,
      [name, email, hashedPassword, phone]
    );

    // Generate token
    const token = jwt.sign(
      { id: result.insertId, email: email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      user: { id: result.insertId, name, email, phone },
      message: 'Registration successful' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const [user] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (user.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user[0].password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentialsssss' });
    }

    const token = jwt.sign(
      { id: user[0].id, email: user[0].email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      user: { 
        id: user[0].id, 
        name: user[0].name, 
        email: user[0].email, 
        phone: user[0].phone 
      } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const [jobs] = await db.execute(`SELECT * FROM jobs ORDER BY created_at DESC`);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single job
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const [job] = await db.execute('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    if (job.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Apply for job (requires authentication)
app.post('/api/applications', authenticateToken, async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;
    const userId = req.user.id;
    
    // Check if user already applied for this job
    const [existingApplication] = await db.execute(
      'SELECT * FROM applications WHERE job_id = ? AND user_id = ?',
      [jobId, userId]
    );
    
    if (existingApplication.length > 0) {
      return res.status(400).json({ error: 'You have already applied for this job' });
    }
    
    // Insert application
    const [result] = await db.execute(
      'INSERT INTO applications (job_id, user_id, cover_letter) VALUES (?, ?, ?)',
      [jobId, userId, coverLetter]
    );

    // Get job and user details for email
    const [job] = await db.execute('SELECT * FROM jobs WHERE id = ?', [jobId]);
    const [user] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
    
    // Send confirmation email
    if (process.env.EMAIL_USER && job.length > 0 && user.length > 0) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user[0].email,
        subject: `Application Received - ${job[0].title}`,
        html: `
          <h2>Application Received</h2>
          <p>Dear ${user[0].name},</p>
          <p>Thank you for applying for the <strong>${job[0].title}</strong> position at <strong>${job[0].company}</strong>.</p>
          <p>We have received your application and will review it shortly. You will hear from us soon.</p>
          <br>
          <p>Best regards,<br>HR Team</p>
        `
      };
      
      await transporter.sendMail(mailOptions);
    }

    res.json({ message: 'Application submitted successfully', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create job (no authentication required)
app.post('/api/jobs', async (req, res) => {
  try {
    const { title, company, location, type, salary, description, requirements } = req.body;
    
    const [result] = await db.execute(
      'INSERT INTO jobs (title, company, location, type, salary, description, requirements) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, company, location, type, salary, description, requirements]
    );
    console.log(result);

    res.json({ message: 'Job created successfully', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get applications (no authentication required)
app.get('/api/applications', async (req, res) => {
  try {
    const [applications] = await db.execute(`
      SELECT a.*, j.title as job_title, j.company, u.name, u.email, u.phone
      FROM applications a 
      JOIN jobs j ON a.job_id = j.id 
      JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
    `);
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard stats
app.get('/api/stats', async (req, res) => {
  try {
    const [jobCount] = await db.execute('SELECT COUNT(*) as count FROM jobs');
    const [applicationCount] = await db.execute('SELECT COUNT(*) as count FROM applications');
    const [userCount] = await db.execute('SELECT COUNT(*) as count FROM users');
    const [recentApplications] = await db.execute(`
      SELECT COUNT(*) as count FROM applications 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    res.json({
      totalJobs: jobCount[0].count,
      totalApplications: applicationCount[0].count,
      totalUsers: userCount[0].count,
      recentApplications: recentApplications[0].count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's applications
app.get('/api/user/applications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const [applications] = await db.execute(`
      SELECT a.*, j.title as job_title, j.company, j.location, j.type
      FROM applications a 
      JOIN jobs j ON a.job_id = j.id 
      WHERE a.user_id = ?
      ORDER BY a.created_at DESC
    `, [userId]);
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});