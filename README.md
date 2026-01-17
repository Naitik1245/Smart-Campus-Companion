# 🎓 Smart Campus Companion

A comprehensive student wellness and productivity platform designed to combat burnout and support mental health in college students. Built with Next.js 16, React 19, and Prisma.

![Next.js](https://img.shields.io/badge/Next.js-16.1.2-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7.2.0-2D3748?logo=prisma)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?logo=tailwind-css)

## ✨ Features

### 🔥 Core Wellness Features
- **Burnout Risk Calculator** - AI-powered burnout prediction based on sleep, stress, and academic data
- **Daily Wellness Check-ins** - Track mood, sleep, stress, and energy levels
- **Mood Insights & Analytics** - Visualize wellness trends and identify patterns
- **Wellness Streaks** - Gamified daily check-in tracking with achievements
- **Breathing Exercises** - Guided 4-4-6 breathing technique for stress relief

### 🤖 AI-Powered Features
- **AI Wellness Coach** - 24/7 conversational AI assistant using Google Gemini
- **Predictive Burnout Alerts** - Proactive warnings 2-7 days before potential burnout
- **Personalized Recommendations** - Context-aware wellness suggestions

### 📚 Academic Support
- **Smart Study Sessions** - Pomodoro timer with focus scoring (25-min work, 5-min break)
- **Assignment Tracker** - Manage deadlines with priority levels
- **Quick Task Creation** - Add assignments directly from dashboard
- **Academic Progress Tracking** - Monitor attendance and grade trends

### 🆘 Mental Health Support
- **Emergency SOS** - One-click emergency alerts to campus security
- **Counselor Booking System** - Schedule mental health appointments
- **Upcoming Appointments** - View your booked counseling sessions
- **Crisis Resources** - 988 Suicide & Crisis Lifeline integration

### 📊 Data & Insights
- **Interactive Charts** - Visualize sleep, stress, and energy trends
- **Risk Factor Breakdown** - Detailed analysis of burnout contributors
- **Best/Worst Day Detection** - Identify patterns in your weekly wellness
- **Real-time Updates** - Dashboard refreshes without page reloads

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 16.1.2 (App Router)
- **UI Library**: React 19.2.3
- **Styling**: TailwindCSS 4 + Radix UI
- **Components**: shadcn/ui
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes (serverless)
- **Database**: SQLite with Prisma ORM 7.2.0
- **Authentication**: NextAuth.js 4 with Credentials Provider
- **AI**: Google Gemini 1.5 Flash API

### Developer Tools
- **Language**: TypeScript 5
- **Linting**: ESLint 9
- **Package Manager**: npm
- **Code Quality**: Prisma Studio (database management)

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- npm or yarn
- Git

### Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/smart-campus-companion.git
cd smart-campus-companion
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here-change-this"

# Google Gemini AI (Optional - app uses fallback responses if not provided)
GEMINI_API_KEY="your-gemini-api-key"
```

4. **Initialize the database**
```bash
npx prisma generate
npx prisma db push
```

5. **Seed the database (optional)**
```bash
npm run db:seed
```

6. **Run the development server**
```bash
npm run dev
```

7. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

### First Time Setup

1. **Create an Account**
   - Go to `/auth/signup`
   - Enter your name, email, and password
   - Click "Sign Up"

2. **Sign In**
   - Use your credentials at `/auth/signin`
   - You'll be redirected to the dashboard

3. **Complete Your First Check-in**
   - Click "Daily Check-in" on the dashboard
   - Fill in your mood, sleep hours, stress, and energy levels
   - Submit to start tracking your wellness

### Key Workflows

#### Daily Wellness Routine
1. Log your daily check-in every morning
2. Review your mood insights and trends
3. Complete breathing exercises if stressed
4. Track study sessions with the Pomodoro timer

#### Assignment Management
1. Use "Quick Add Task" to create assignments
2. Set due dates and priority levels
3. Mark tasks as complete when done
4. Monitor upcoming deadlines

#### Mental Health Support
1. Book counselor sessions via "Book Counselor"
2. View upcoming appointments on dashboard
3. Use Emergency SOS if in crisis
4. Chat with AI Wellness Coach for 24/7 support

## 📁 Project Structure

```
smart-campus-companion/
├── app/                          # Next.js App Router
│   ├── (dashboard)/             # Dashboard layout group
│   │   └── dashboard/           # Main dashboard page
│   ├── admin/                   # Admin panel
│   ├── api/                     # API routes
│   │   ├── ai-chat/            # AI wellness coach endpoint
│   │   ├── assignments/        # Assignment CRUD
│   │   ├── burnout/            # Burnout calculation
│   │   ├── check-in/           # Daily check-ins
│   │   ├── counselor-sessions/ # Counselor booking
│   │   ├── mood-insights/      # Mood analytics
│   │   ├── predictive-alerts/  # Burnout predictions
│   │   ├── sos-alert/          # Emergency alerts
│   │   └── study-sessions/     # Pomodoro tracking
│   ├── auth/                    # Authentication pages
│   ├── counselor-booking/       # Counselor booking UI
│   └── settings/                # User settings
├── components/                   # React components
│   ├── ai/                      # AI chat component
│   ├── alerts/                  # Predictive alerts
│   ├── check-in/                # Daily check-in dialog
│   ├── counselor/               # Appointment components
│   ├── emergency/               # SOS button
│   ├── layout/                  # Navbar, etc.
│   ├── study/                   # Pomodoro timer
│   ├── tasks/                   # Quick add task
│   ├── ui/                      # shadcn/ui components
│   └── wellness/                # Wellness features
├── lib/                          # Utility functions
│   ├── auth.ts                  # NextAuth configuration
│   ├── burnout-calculator.ts   # Burnout algorithm
│   └── prisma.ts                # Prisma client
├── prisma/                       # Database
│   ├── schema.prisma            # Database schema
│   └── seed.ts                  # Seed data
└── public/                       # Static assets
```

## 🗄️ Database Schema

The app uses SQLite with Prisma ORM. Key models:

- **User** - Authentication and profile
- **DailyCheckIn** - Daily wellness logs
- **Assignment** - Tasks and deadlines
- **BurnoutScore** - Calculated burnout metrics
- **CounselorSession** - Mental health appointments
- **StudySession** - Pomodoro study tracking
- **AIConversation** - Chat history
- **PredictiveAlert** - AI-generated warnings
- **SOSAlert** - Emergency alerts

View the full schema in `prisma/schema.prisma`

## 🤖 AI Features

### Google Gemini Integration
The AI Wellness Coach uses Google Gemini 1.5 Flash for:
- Conversational wellness advice
- Context-aware responses based on user data
- Personalized mental health support

**Fallback Mode**: If no API key is provided, the app uses smart pattern-matching responses based on keywords.

### Burnout Prediction Algorithm
Our proprietary algorithm analyzes:
- Sleep patterns (7-day and 14-day trends)
- Stress levels (recent vs. historical)
- Assignment density (deadlines in next 7 days)
- Mood decline (week-over-week)

Predictions are made 2-7 days in advance with severity levels: Low, Medium, High, Critical.

## 🎨 Design System

Built with **shadcn/ui** and **TailwindCSS 4**, featuring:
- Dark mode support
- Accessible components (Radix UI)
- Consistent spacing and typography
- Responsive design (mobile-first)
- Custom color palette for wellness (greens, purples, blues)

## 🔒 Security

- **Authentication**: NextAuth.js with bcrypt password hashing
- **Authorization**: Server-side session validation
- **Data Privacy**: User data isolated per account
- **SQL Injection**: Protected by Prisma ORM
- **XSS**: React's built-in sanitization
- **Env Variables**: Secrets stored in `.env` (not committed)

## 📈 Performance

- **Server Components**: Reduced client-side JavaScript
- **Code Splitting**: Automatic route-based splitting
- **Database**: Indexed queries for fast lookups
- **Caching**: Static page generation where possible
- **Optimistic UI**: Real-time updates without full page reloads

## 🧪 Available Scripts

```bash
# Development
npm run dev          # Start dev server at localhost:3000

# Production
npm run build        # Build for production
npm start            # Start production server

# Database
npm run db:push      # Push schema changes to database
npm run db:seed      # Seed database with sample data

# Code Quality
npm run lint         # Run ESLint
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

**Naitik Kanchanwala**
- GitHub: [@naitikkanchanwala](https://github.com/naitikkanchanwala)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Prisma](https://www.prisma.io/) - Database ORM
- [Google Gemini](https://ai.google.dev/) - AI API
- [Radix UI](https://www.radix-ui.com/) - Accessible primitives
- [Recharts](https://recharts.org/) - Chart library

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Email: naitik@example.com

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Push notifications for alerts
- [ ] Peer support groups
- [ ] Integration with university systems
- [ ] Multi-language support
- [ ] Advanced ML models for burnout prediction
- [ ] Wearable device integration (sleep tracking)

---

**Made with ❤️ for student wellness**
