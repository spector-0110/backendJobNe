#!/bin/bash

# Backend Project Structure Generator
# This script creates the complete folder structure and files for a Node.js backend project

echo "Creating backend project structure..."

# Create main project directory (if running from outside)
# mkdir -p backend
# cd backend

# Create main directories
mkdir -p src/{config,controllers,middlewares,models,repositories,routes,services,sockets,uploads,utils,validators}

echo "📁 Created main directories"

# Create configuration files
touch package.json
touch README.md
touch API_TESTING_GUIDE.md
touch APPLICATION_AND_CONNECTION_API.md
touch ASSESSMENT_AND_JOBS_API.md
touch MESSAGING_AND_NOTIFICATION_API.md

echo "📄 Created documentation files"

# Create main application files
touch src/app.js
touch src/server.js

echo "🚀 Created main application files"

# Create config files
touch src/config/db.js
touch src/config/gridfs.js
touch src/config/multer.js

echo "⚙️  Created configuration files"

# Create controller files
touch src/controllers/application.controller.js
touch src/controllers/assessment.controller.js
touch src/controllers/auth.controller.js
touch src/controllers/connection.controller.js
touch src/controllers/employer.controller.js
touch src/controllers/file.controller.js
touch src/controllers/job.controller.js
touch src/controllers/jobseeker.controller.js
touch src/controllers/message.controller.js
touch src/controllers/notification.controller.js

echo "🎮 Created controller files"

# Create middleware files
touch src/middlewares/assessment.middleware.js
touch src/middlewares/auth.middleware.js
touch src/middlewares/errorHandler.middleware.js
touch src/middlewares/upload.middleware.js
touch src/middlewares/validateRequest.middleware.js

echo "🛡️  Created middleware files"

# Create model files
touch src/models/application.js
touch src/models/assessment.js
touch src/models/connections.js
touch src/models/employerProfile.js
touch src/models/job.js
touch src/models/jobSeekerProfile.js
touch src/models/message.js
touch src/models/notification.js
touch src/models/refreshToken.js
touch src/models/user.js

echo "📋 Created model files"

# Create repository files
touch src/repositories/application.repository.js
touch src/repositories/assessment.repository.js
touch src/repositories/connection.repository.js
touch src/repositories/employer.repository.js
touch src/repositories/job.repository.js
touch src/repositories/jobseeker.repository.js
touch src/repositories/message.repository.js
touch src/repositories/notification.repository.js
touch src/repositories/refreshToken.repository.js
touch src/repositories/user.repository.js

echo "🗄️  Created repository files"

# Create route files
touch src/routes/application.routes.js
touch src/routes/assessment.routes.js
touch src/routes/auth.routes.js
touch src/routes/connection.routes.js
touch src/routes/employer.routes.js
touch src/routes/file.routes.js
touch src/routes/job.routes.js
touch src/routes/jobseeker.routes.js
touch src/routes/message.routes.js
touch src/routes/notification.routes.js

echo "🛣️  Created route files"

# Create service files
touch src/services/application.service.js
touch src/services/assessment.service.js
touch src/services/auth.service.js
touch src/services/connection.service.js
touch src/services/employer.service.js
touch src/services/file.service.js
touch src/services/job.service.js
touch src/services/jobseeker.service.js
touch src/services/message.service.js
touch src/services/notification.service.js

echo "🔧 Created service files"

# Create socket files
touch src/sockets/socket.handler.js

echo "🔌 Created socket files"

# Create utility files
touch src/utils/jwt.util.js
touch src/utils/response.util.js

echo "🛠️  Created utility files"

# Create validator files
touch src/validators/application.validator.js
touch src/validators/assessment.validator.js
touch src/validators/auth.validator.js
touch src/validators/connection.validator.js
touch src/validators/employer.validator.js
touch src/validators/job.validator.js
touch src/validators/jobseeker.validator.js
touch src/validators/message.validator.js

echo "✅ Created validator files"

# Create additional common files
touch .env
touch .env.example
touch .gitignore
touch nodemon.json

echo "🔒 Created environment and configuration files"

echo ""
echo "✨ Backend project structure created successfully!"
echo ""
echo "📊 Summary:"
echo "   📁 Directories: $(find . -type d | wc -l)"
echo "   📄 Files: $(find . -type f | wc -l)"
echo ""
echo "🚀 Next steps:"
echo "   1. Initialize git repository: git init"
echo "   2. Install dependencies: npm install"
echo "   3. Configure your .env file"
echo "   4. Start coding! 🎉"
echo ""

# Optional: Create a basic .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# uploads directory (if storing files locally)
uploads/*
!uploads/.gitkeep

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
EOF

echo "📝 Created .gitignore file"

# Optional: Create a basic package.json template
cat > package.json << 'EOF'
{
  "name": "backend-project",
  "version": "1.0.0",
  "description": "Backend API for job portal application",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["nodejs", "express", "mongodb", "api"],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.10.0",
    "multer": "^1.4.5-lts.1",
    "gridfs-stream": "^1.1.1",
    "socket.io": "^4.7.2",
    "joi": "^17.9.2",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
EOF

echo "📦 Created package.json template"

# Create .env.example
cat > .env.example << 'EOF'
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/your-database-name

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# File Upload
MAX_FILE_SIZE=5MB
UPLOAD_PATH=./src/uploads

# Email Configuration (if using email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Socket.IO Configuration
SOCKET_CORS_ORIGIN=http://localhost:3000
EOF

echo "📝 Created .env.example file"

echo ""
echo "🎉 All done! Your backend project structure is ready."
echo "   Don't forget to copy .env.example to .env and configure your environment variables."