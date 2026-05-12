const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User.model');

// ============================================
// GOOGLE OAUTH STRATEGY
// ============================================
// Production setup:
//   1. Set BACKEND_URL in .env to your deployed URL (e.g. https://api.SparkTech.com)
//   2. In Google Cloud Console → Credentials → OAuth 2.0 Client:
//      Add authorized redirect URI: {BACKEND_URL}/api/v1/auth/google/callback
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'mock_google_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock_google_secret',
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/v1/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0].value;
        let user = await User.findOne({ email });

        if (user) {
          // If the user exists but hasn't linked Google, maybe update them or just log them in
          if (user.authProvider === 'local') {
            user.authProvider = 'google';
            user.providerId = profile.id;
            // Auto-verify email if coming from Google
            user.isEmailVerified = true; 
            await user.save();
          }
          return done(null, user);
        }

        // Create new federated user
        const newUser = await User.create({
          name: profile.displayName,
          email: email,
          authProvider: 'google',
          providerId: profile.id,
          isEmailVerified: true, // Google verifies emails
          isPhoneVerified: false,
          avatar: profile.photos && profile.photos[0].value
        });

        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// ============================================
// GITHUB OAUTH STRATEGY
// ============================================
// Production setup:
//   1. Set BACKEND_URL in .env to your deployed URL
//   2. In GitHub → Settings → Developer settings → OAuth Apps:
//      Set Authorization callback URL: {BACKEND_URL}/api/v1/auth/github/callback
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || 'mock_github_id',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'mock_github_secret',
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/v1/auth/github/callback`,
      scope: ['user:email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0].value;
        let user = await User.findOne({ email });

        if (user) {
          if (user.authProvider === 'local') {
            user.authProvider = 'github';
            user.providerId = profile.id;
            user.isEmailVerified = true;
            await user.save();
          }
          return done(null, user);
        }

        const newUser = await User.create({
          name: profile.displayName || profile.username,
          email: email,
          authProvider: 'github',
          providerId: profile.id,
          isEmailVerified: true,
          isPhoneVerified: false,
          avatar: profile.photos && profile.photos[0].value
        });

        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);
