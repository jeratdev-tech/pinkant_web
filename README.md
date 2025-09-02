# PinkAnt 🐜

A supportive online forum for the LGBTQ+ community, built with modern web technologies to provide a safe space where people can connect, share experiences, and support one another against isolation and mockery.

## ✨ Features

### 🔐 Authentication

- **Sign up/Login**: Secure email and password authentication via Supabase Auth
- **User Profiles**: Customizable display names, avatars, and bios
- **Protected Routes**: Secure access to forum and profile features

### 💬 Forum System

- **Create Posts**: Share thoughts, experiences, and questions with the community
- **Threaded Discussions**: Reply to posts and engage in meaningful conversations
- **Tag System**: Organize content with relevant tags (mental health, relationships, etc.)
- **Real-time Updates**: Live updates when new posts or replies are added

### 🏠 Community Features

- **Homepage**: Welcoming landing page with community stats and features
- **Community Feed**: Latest posts sorted by newest or trending
- **Search & Filter**: Find relevant content by tags or search terms
- **Like System**: Show support for posts and replies

### 🎨 User Experience

- **Responsive Design**: Mobile-first approach with beautiful desktop experience
- **Pink Theme**: Friendly, soft design with pink accents and rounded edges
- **Accessibility**: Inclusive design principles for all users
- **Modern UI**: Clean, intuitive interface built with TailwindCSS

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite.js
- **Styling**: TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### 1. Clone the Repository

```bash
git clone <repository-url>
cd pinkant
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Copy `env.example` to `.env.local`:

```bash
cp env.example .env.local
```

4. Update `.env.local` with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Database

1. Go to your Supabase project SQL Editor
2. Copy and paste the contents of `supabase-schema.sql`
3. Run the SQL to create all tables and policies

### 5. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🗄️ Database Schema

### Tables

- **`users`**: User profiles (id, email, display_name, bio, avatar_url)
- **`posts`**: Forum posts (id, user_id, title, body, tags, created_at)
- **`replies`**: Post replies (id, post_id, user_id, body, created_at)
- **`likes`**: Post likes (id, post_id, user_id)

### Security

- Row Level Security (RLS) enabled on all tables
- Users can only modify their own content
- Public read access for posts and replies
- Authenticated users can create content

## 📱 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🏗️ Project Structure

```
src/
├── components/
│   ├── auth/          # Authentication components
│   ├── forum/         # Forum and post components
│   ├── home/          # Homepage components
│   ├── layout/        # Navigation and layout
│   └── profile/       # User profile components
├── contexts/          # React contexts (Auth)
├── lib/              # Utility libraries (Supabase client)
└── App.jsx           # Main app component
```

## 🔧 Configuration

### TailwindCSS

Custom theme with pink and purple color palette, custom animations, and responsive utilities.

### Supabase

- Authentication with email/password
- Real-time subscriptions for live updates
- Row Level Security for data protection
- Automatic user profile creation

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel/Netlify

1. Connect your repository
2. Set environment variables
3. Deploy automatically on push

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you need help or have questions:

- Create an issue in the repository
- Check the Supabase documentation
- Review the React and TailwindCSS docs

## 🙏 Acknowledgments

- Built with love for the LGBTQ+ community
- Inspired by the need for safe online spaces
- Powered by open source technologies

---

**PinkAnt** - Where everyone belongs, and no one stands alone. 🏳️‍🌈
