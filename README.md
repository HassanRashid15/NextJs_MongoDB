# Next.js + MongoDB Authentication System

A full-stack authentication system built with Next.js, MongoDB, and Express.js featuring email verification, password reset, and protected routes.

## 🚀 Features

- ✅ User registration with email verification
- ✅ Secure login/logout functionality
- ✅ Password reset via email
- ✅ Protected routes for authenticated users
- ✅ Profile management with image upload
- ✅ JWT-based authentication
- ✅ Responsive UI with Tailwind CSS
- ✅ Form validation and error handling
- ✅ Loading states and user feedback

## 📁 Project Structure

```
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context providers
│   │   └── lib/          # Utility functions
│   └── package.json
├── server/                # Express.js backend
│   ├── controllers/      # Route controllers
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── package.json
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MongoDB database
- Email service (Gmail, SendGrid, etc.)

### 1. Clone the repository

```bash
git clone <repository-url>
cd NextJs_MongoDB
```

### 2. Install dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 3. Environment Configuration

#### Server Environment Variables

Create `.env` file in the `server/` directory:

```env
# Database
MONGO_URI=mongodb://localhost:27017/your-database-name

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Client URL (for password reset links)
CLIENT_URL=http://localhost:3000

# Server Port
PORT=5000
```

#### Client Environment Variables

Create `.env.local` file in the `client/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 4. Start the development servers

```bash
# Start the backend server (from server/ directory)
cd server
npm run dev

# Start the frontend (from client/ directory)
cd client
npm run dev
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🔐 Authentication Flow

1. **Registration**: User registers → Email verification code sent → Verify email → Login
2. **Login**: User logs in → JWT token generated → Access to protected routes
3. **Password Reset**: Forgot password → Reset link sent → Reset password → Login

## 🛡️ Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Email verification required for login
- Protected API routes with middleware
- Rate limiting (recommended to add)
- Input validation and sanitization

## 📱 Available Routes

### Public Routes

- `/` - Home page
- `/login` - Login page
- `/register` - Registration page
- `/forgot-password` - Password reset request
- `/verify-email` - Email verification
- `/reset-password/[token]` - Password reset

### Protected Routes

- `/dashboard` - User dashboard
- `/profile` - User profile management
- `/change-password` - Password change

## 🧪 Testing

To add testing to the project:

```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Add test scripts to package.json
```

## 🚀 Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Backend (Railway/Heroku)

1. Set up environment variables
2. Deploy using the platform's CLI or dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions, please open an issue on GitHub.
