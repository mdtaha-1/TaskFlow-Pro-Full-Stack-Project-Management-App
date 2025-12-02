# TaskFlow Pro - MERN Stack Project Management Platform

A modern, full-stack project management application built with the MERN stack (MongoDB, Express.js, React, Node.js). TaskFlow Pro provides teams with powerful tools for project management, task tracking, team collaboration, and analytics.

## ✨ Features

### 🚀 **Core Functionality**

- **Project Management**: Create, organize, and track projects with detailed timelines
- **Task Management**: Assign tasks, set priorities, track progress, and manage deadlines
- **Team Collaboration**: Real-time team member management and communication
- **Analytics Dashboard**: Comprehensive insights into project and team performance
- **User Authentication**: Secure JWT-based authentication system
- **Role-Based Access**: Different permission levels for team members

### 🎨 **Modern Design**

- **Responsive Design**: Perfect experience across all devices
- **Dark/Light Mode**: Comfortable working in any environment
- **Smooth Animations**: Polished interactions with Framer Motion
- **Professional UI**: Clean, modern interface with Tailwind CSS

### 🔧 **Technical Features**

- **RESTful API**: Well-structured backend with Express.js
- **MongoDB Database**: Scalable NoSQL database with Mongoose ODM
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive validation on both client and server
- **Error Handling**: Robust error handling and user feedback
- **Security**: Helmet, CORS, rate limiting, and password hashing

## 🛠️ Tech Stack

### **Frontend**

- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful, consistent icons
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Vite** - Fast development and build tool

### **Backend**

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Express Validator** - Input validation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** - [Download here](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **npm** (comes with Node.js)

## 🚀 Installation & Setup

### **Step 1**

Extract all files from the folder,
Open the folder in VS Studio.

### **Step 2: Install Dependencies**

Install both frontend and backend dependencies:

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
npm run install-server
```

Or install them separately:

```bash
# Frontend dependencies
npm install

# Backend dependencies
cd server
npm install
cd ..
```

### **Step 3: Database Setup**

#### **Option A: Local MongoDB**

1. **Install MongoDB Community Edition**

   - Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Follow the installation guide for your operating system
   - Start MongoDB service:

     ```bash
     # Windows (if installed as service)
     net start MongoDB

     # macOS (with Homebrew)
     brew services start mongodb-community

     # Linux (systemd)
     sudo systemctl start mongod
     ```

2. **Verify MongoDB is running**

   ```bash
   # Connect to MongoDB shell
   mongosh

   # You should see a connection message
   # Type 'exit' to close the shell
   ```

#### **Option B: MongoDB Atlas (Cloud)**

1. **Create a MongoDB Atlas Account**

   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account
   - Create a new cluster (free tier available)

2. **Get Connection String**

   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

3. **Whitelist Your IP**
   - Go to "Network Access" in Atlas
   - Add your current IP address or use `0.0.0.0/0` for development

### **Step 4: Environment Configuration**

#### **Backend Environment Setup**

1. **Create environment file**

   ```bash
   cd server
   cp .env.example .env
   ```

2. **Configure your `.env` file**

   ```env
   PORT=5000

   # For Local MongoDB
   MONGODB_URI=mongodb://localhost:27017/taskflow-pro

   # For MongoDB Atlas (replace with your connection string)
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskflow-pro

   # JWT Secret (generate a secure random string)
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random-at-least-32-characters

   NODE_ENV=development
   ```

3. **Generate a secure JWT secret**

   ```bash
   # Option 1: Use Node.js
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

   # Option 2: Use OpenSSL
   openssl rand -hex 64

   # Option 3: Online generator
   # Visit: https://generate-secret.vercel.app/64
   ```

#### **Frontend Environment Setup**

1. **Create environment file**

   ```bash
   # From project root
   cp .env.example .env
   ```

2. **Configure your `.env` file**
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

### **Step 5: Database Seeding (Optional)**

Populate your database with sample data:

```bash
cd server
npm run seed
```

This will create:

- 4 sample users with different roles
- 2 sample projects
- Sample tasks assigned to users

**Sample Login Credentials:**

- **Email**: `sarah@company.com` | **Password**: `password123` | **Role**: Designer
- **Email**: `mike@company.com` | **Password**: `password123` | **Role**: Developer
- **Email**: `emily@company.com` | **Password**: `password123` | **Role**: Project Manager
- **Email**: `alex@company.com` | **Password**: `password123` | **Role**: Developer

### **Step 6: Start the Application**

#### **Option A: Start Both Frontend and Backend Together**

```bash
# From project root
npm run dev
```

#### **Option B: Start Separately**

**Terminal 1 - Backend:**

```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**

```bash
# From project root
npm run client
```

### **Step 7: Access the Application**

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

## 🔧 Configuration Options

### **MongoDB Configuration**

#### **Local MongoDB Settings**

```env
# Basic local connection
MONGODB_URI=mongodb://localhost:27017/taskflow-pro

# With authentication
MONGODB_URI=mongodb://username:password@localhost:27017/taskflow-pro

# Custom port
MONGODB_URI=mongodb://localhost:27018/taskflow-pro
```

#### **MongoDB Atlas Settings**

```env
# Standard connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskflow-pro

# With additional options
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskflow-pro?retryWrites=true&w=majority
```

### **JWT Configuration**

```env
# Development (shorter expiration)
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Production (consider shorter expiration)
JWT_SECRET=your-very-long-and-secure-secret-key
JWT_EXPIRES_IN=1d
```

### **CORS Configuration**

Update `server/server.js` for production:

````javascript
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://yourdomain.com", "https://www.yourdomain.com"]
        : ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);
```s

## 🔐 API Endpoints

### **Authentication**

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### **Projects**

- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### **Tasks**

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/comments` - Add comment to task

### **Team**

- `GET /api/team` - Get team members
- `GET /api/team/:id` - Get team member
- `PATCH /api/team/:id/status` - Update member status

### **Users**

- `GET /api/users` - Get all users
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password

## 🛡️ Security Features

### **Authentication & Authorization**

- JWT-based authentication
- Password hashing with bcryptjs
- Protected routes and middleware
- Role-based access control

### **Security Middleware**

- **Helmet**: Sets security headers
- **CORS**: Configurable cross-origin requests
- **Rate Limiting**: Prevents abuse
- **Input Validation**: Server-side validation
- **Error Handling**: Secure error responses

### **Best Practices**

- Environment variables for sensitive data
- Secure JWT secret generation
- Password complexity requirements
- API endpoint protection
- Input sanitization

## 🚀 Deployment

### **Frontend Deployment (Netlify/Vercel)**

1. **Build the frontend**

   ```bash
   npm run build
````

2. **Deploy to Netlify**

   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variables in Netlify dashboard

3. **Deploy to Vercel**
   - Install Vercel CLI: `npm i -g vercel`
   - Run: `vercel`
   - Follow the prompts

### **Backend Deployment (Railway/Render/Heroku)**

1. **Prepare for deployment**

   ```bash
   # Add start script to server/package.json
   "scripts": {
     "start": "node server.js"
   }
   ```

2. **Environment Variables**
   Set these in your hosting platform:

   ```env
   NODE_ENV=production
   MONGODB_URI=your-production-mongodb-uri
   JWT_SECRET=your-production-jwt-secret
   PORT=5000
   ```

3. **Deploy to Railway**
   - Connect GitHub repository
   - Railway will auto-detect Node.js
   - Set environment variables in dashboard

## 🔧 Troubleshooting

### **Common Issues**

#### **MongoDB Connection Issues**

```bash
# Check if MongoDB is running
mongosh

# Start MongoDB service
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

#### **Port Already in Use**

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use different port in .env
PORT=5001
```

#### **JWT Secret Issues**

```bash
# Generate new JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### **CORS Issues**

Update CORS configuration in `server/server.js`:

```javascript
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);
```

### **Development Tips**

#### **Database Management**

```bash
# Connect to MongoDB shell
mongosh

# Show databases
show dbs

# Use taskflow-pro database
use taskflow-pro

# Show collections
show collections

# Find all users
db.users.find()

# Clear all data
db.users.deleteMany({})
db.projects.deleteMany({})
db.tasks.deleteMany({})
```

#### **API Testing**

Use tools like Postman or curl to test API endpoints:

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sarah@company.com","password":"password123"}'
```

## 📚 Additional Resources

### **Learning Resources**

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [React Documentation](https://react.dev/)
- [Node.js Documentation](https://nodejs.org/en/docs/)

### **Tools & Extensions**

- **MongoDB Compass** - GUI for MongoDB
- **Postman** - API testing tool
- **VS Code Extensions**:
  - MongoDB for VS Code
  - REST Client
  - ES7+ React/Redux/React-Native snippets

## 🙏 Acknowledgments

- Built with React, Node.js, Express, and MongoDB
- UI components styled with Tailwind CSS
- Icons by Lucide React
- Animations powered by Framer Motion
- Authentication with JSON Web Tokens

---

**Happy Coding! 🚀**

**TaskFlow Pro** - Where productivity meets innovation.
