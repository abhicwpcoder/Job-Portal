# Job Portal - Full Stack Application

A professional job portal built with React.js, Node.js, and MySQL featuring job listings, applications, and admin management.

## Features

### Frontend (React.js)
- Modern, responsive design with Tailwind CSS
- Job listings with search and filtering
- Detailed job pages with application forms
- Admin authentication and dashboard
- Professional UI with smooth animations

### Backend (Node.js/Express)
- RESTful API architecture
- MySQL database integration
- JWT-based authentication
- Email notifications for applications
- Secure admin routes

### Database (MySQL)
- Jobs table for job postings
- Applications table for job applications
- Admin users table for authentication
- Proper relationships and indexing

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MySQL Server
- Gmail account for email notifications (optional)

### 1. Database Setup
1. Install MySQL and create a database named `job_portal`
2. Update the database configuration in `.env` file
3. The application will automatically create required tables on first run

### 2. Environment Configuration
Update the `.env` file with your configurations:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=job_portal

# JWT Secret (change this to a secure random string)
JWT_SECRET=your_secure_jwt_secret

# Email Configuration (optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Server Port
PORT=5000
```

### 3. Install Dependencies and Run
```bash
# Install all dependencies
npm install

# Start both frontend and backend
npm run dev

# Or run them separately:
# Backend only: npm run server
# Frontend only: npm run client
```

### 4. Admin Access
- Default admin credentials:
  - Username: `admin`
  - Password: `admin123`
- Access admin panel at: http://localhost:5173/admin/login

## API Endpoints

### Public Routes
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get single job
- `POST /api/applications` - Submit job application

### Admin Routes (Requires Authentication)
- `POST /api/admin/login` - Admin login
- `POST /api/admin/jobs` - Create new job
- `GET /api/admin/applications` - Get all applications
- `GET /api/admin/stats` - Get dashboard statistics

## Email Configuration

To enable email notifications:
1. Enable 2-factor authentication on your Gmail account
2. Generate an app password: https://support.google.com/accounts/answer/185833
3. Update `EMAIL_USER` and `EMAIL_PASS` in `.env` file

## Production Deployment

### Database
- Use a production MySQL server
- Update connection credentials in `.env`
- Consider using connection pooling for better performance

### Backend
- Set `NODE_ENV=production`
- Use a process manager like PM2
- Configure proper logging
- Set up reverse proxy with Nginx

### Frontend
- Build the production version: `npm run build`
- Serve static files with a web server
- Configure environment variables for production API URLs

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, React Router, Axios
- **Backend**: Node.js, Express.js, MySQL2, JWT, Bcrypt, Nodemailer
- **Database**: MySQL
- **Development**: Vite, Concurrently, ESLint

## Features Overview

### For Job Seekers
- Browse job listings with advanced search
- Filter jobs by location, type, and keywords
- View detailed job descriptions and requirements
- Submit applications with cover letters
- Receive email confirmations

### For Employers/Admins
- Secure admin authentication
- Post new job openings
- View and manage applications
- Dashboard with statistics
- Application tracking and management

## Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Protected admin routes
- Input validation and sanitization
- CORS configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.