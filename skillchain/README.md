# SkillChain

A decentralized platform powered by AI where you swap skills, grow your network, and earn verifiable badges. Join thousands of learners collaborating globally!

## Features

- **Skill Swapping**: Connect with users who have skills you want to learn
- **AI-Powered Matching**: Intelligent skill matching using OpenAI
- **Badge System**: Earn verifiable skill badges
- **Leaderboard**: Compete with other users
- **Dark Mode**: Toggle between light and dark themes
- **Real-time Notifications**: Stay updated with your swap requests
- **Admin Panel**: Manage and approve skill swaps

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project
- OpenAI API key (optional, for AI matching)

## Setup Instructions

### 1. Install Dependencies

```bash
cd skillchain
npm install
```

### 2. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Google sign-in)
3. Create a Firestore database
4. Get your Firebase configuration

### 3. Environment Variables

Create a `.env.local` file in the `skillchain` directory with your Firebase configuration:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# OpenAI API Key (optional, for AI matching)
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Firestore Security Rules

Set up your Firestore security rules to allow read/write access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Pages

- **Landing Page** (`/landing`): Welcome page with app introduction
- **Home** (`/index`): Discover users to swap skills with
- **Profile** (`/profile`): Edit your profile and skills
- **Swaps** (`/swaps`): View your swap requests
- **Leaderboard** (`/leaderboard`): See top users by points
- **Feedback** (`/feedback`): Leave feedback for other users
- **Badges** (`/badges/[uid]`): View user skill badges
- **Admin** (`/admin`): Admin panel for managing swaps

## Troubleshooting

### Common Issues

1. **Firebase Configuration Error**
   - Ensure all environment variables are set correctly
   - Check that your Firebase project has Authentication and Firestore enabled
   - Verify your API keys are correct

2. **Authentication Issues**
   - Make sure Google sign-in is enabled in Firebase Authentication
   - Check that your domain is authorized in Firebase settings

3. **Database Errors**
   - Ensure Firestore is created and rules allow read/write access
   - Check that collections exist: `users`, `swaps`, `feedback`, `skillTokens`, `notifications`

4. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run lint`

### Error Messages

- **"Failed to load profiles"**: Check Firebase configuration and network connection
- **"Access denied"**: Ensure you're logged in and have proper permissions
- **"Profile not found"**: The user ID doesn't exist in the database

## Development

### Project Structure

```
skillchain/
├── components/          # Reusable React components
├── context/            # React context providers
├── pages/              # Next.js pages and API routes
├── public/             # Static assets
├── styles/             # Global styles
├── utils/              # Utility functions
└── package.json        # Dependencies and scripts
```

### Adding New Features

1. Create new pages in `pages/` directory
2. Add components in `components/` directory
3. Update navigation in `components/Navbar.tsx`
4. Add any new Firebase collections as needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
