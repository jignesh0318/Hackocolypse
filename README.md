# 🛡️ AI Safety Zones - Women & Student Safety App

A comprehensive Progressive Web Application (PWA) built with the MERN stack to enhance personal safety for women and students through real-time zone monitoring, emergency alerts, and intelligent safety features.

**📱 Install as a PWA on your device for instant access anytime, anywhere!**

## ✨ Core Features

### 🚨 Emergency SOS System
- **Voice-Activated SOS**: Trigger emergency alerts using voice commands
- **One-Tap SOS Button**: Quick emergency alert with countdown prevention
- **Automatic SMS Alerts**: Sends location and medical info to emergency contacts
- **Black Box Recording**: Continuous audio/video recording during emergencies
- **Evidence Upload**: Automatic cloud backup of emergency evidence
- **SOS History Tracking**: View all past emergency alerts with timestamps

### 🎙️ Voice Assistant Integration
- **Voice Commands**: Control app hands-free ("Hey SafeZone")
- **Voice-Activated SOS**: Trigger alerts without touching your phone
- **Safety Tips**: Get verbal safety guidance
- **Route Information**: Ask about current route safety
- **Natural Language Processing**: Understands conversational commands

### 🤖 AI Chatbot Support
- **24/7 Safety Advisor**: Get instant safety tips and guidance
- **Emergency Assistance**: Real-time help during critical situations
- **Context-Aware Responses**: Location and time-based safety advice
- **Multilingual Support**: Communicate in your preferred language

### 📍 Advanced Route Tracking
- **Real-Time GPS Tracking**: Continuous location monitoring
- **Google Maps Integration**: Professional mapping with Places API
- **Route Visualization**: Interactive path display with safety scores
- **Historical Routes**: Access your travel history
- **Safe Route Suggestions**: AI-powered safer alternative routes
- **Offline Route Tracking**: Works without internet connection

### 🗺️ Safety Analysis & Heatmap
- **Dynamic Safety Zones**: Color-coded risk levels (High/Medium/Low)
- **Real-Time Heatmap**: Visual representation of unsafe areas
- **AI Risk Prediction**: Machine learning-based safety scoring
- **Community Reports**: Crowdsourced safety data
- **Zone Analytics**: Detailed safety factors (crime, lighting, crowd density)
- **Offline Risk Detection**: Local safety analysis without connectivity

### 👥 Safety Bubbles (Groups)
- **Create Safety Groups**: Form trusted circles with friends/family
- **Permanent & Temporary Bubbles**: Different group types for various needs
- **Invite System**: Share unique codes to add members
- **Group Location Sharing**: See all bubble members' locations
- **Emergency Broadcast**: Alert entire bubble instantly

### 🔋 Smart Battery Management
- **Battery Level Monitoring**: Real-time battery percentage
- **Low Battery Alerts**: Warnings at critical levels (20%, 10%, 5%)
- **Auto-Emergency Alert**: Triggers SOS at 5% battery
- **Last Location Broadcast**: Sends final position before shutdown

### 📞 Emergency Contact Management
- **Multiple Contacts**: Add unlimited emergency contacts
- **Medical Profile**: Store blood type, allergies, medications
- **Contact Verification**: Ensure contacts are reachable
- **Priority Contacts**: Set primary emergency contacts
- **Auto-Notification**: Contacts receive alerts with full context

### 🌐 Offline Functionality
- **Offline Mode**: Full functionality without internet
- **Local Data Storage**: IndexedDB for persistent data
- **Auto-Sync**: Syncs data when connection restored
- **Offline Maps**: Cached map tiles for navigation
- **Service Worker**: Background processing for reliability

### 🚔 Police 24x7 Integration
- **Direct Police Contact**: One-tap police alert system
- **Location Sharing**: Automatic position transmission
- **Emergency Numbers**: Quick access to local authorities
- **Incident Reporting**: File reports directly through app

## 🛠️ Technology Stack

### Frontend
- **React 18.3.1** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite 5.4.21** - Lightning-fast build tool
- **React Router 7.0.2** - Client-side routing
- **Leaflet 4.2.1** - Interactive maps
- **Google Maps API** - Professional mapping services

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe server code
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Twilio** - SMS notification service

### PWA Technologies
- **Service Workers** - Offline functionality
- **Web App Manifest** - Installability
- **IndexedDB** - Client-side storage
- **Cache API** - Resource caching
- **Push Notifications** - Real-time alerts

### APIs & Services
- **Google Maps Platform**
  - Maps JavaScript API
  - Places API
  - Geocoding API
  - Directions API
- **Geolocation API** - GPS tracking
- **Web Speech API** - Voice recognition
- **Battery Status API** - Power monitoring
- **MediaRecorder API** - Evidence recording

## 📁 Project Structure

```
ai-safety-zones-app/
├── client/                          # Frontend application
│   ├── public/
│   │   ├── manifest.json           # PWA manifest
│   │   └── serviceWorker.js        # Service worker for offline support
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── Chatbot.tsx        # AI chatbot interface
│   │   │   ├── GoogleMap.tsx      # Google Maps integration
│   │   │   ├── OfflineIndicator.tsx
│   │   │   ├── RiskZoneAlert.tsx  # Safety zone alerts
│   │   │   ├── RouteVisualization.tsx
│   │   │   ├── SafetyHeatmap.tsx  # Zone heatmap
│   │   │   ├── SOSButton.tsx      # Emergency SOS button
│   │   │   ├── VoiceAssistant.tsx # Voice control
│   │   │   ├── VoiceSOS.tsx       # Voice emergency
│   │   │   └── ZoneMap.tsx        # Safety zones map
│   │   ├── pages/                 # Application pages
│   │   │   ├── Dashboard.tsx      # Main dashboard
│   │   │   ├── Home.tsx           # Landing page
│   │   │   ├── Login.tsx          # Authentication
│   │   │   ├── CreateBubble.tsx   # Safety groups
│   │   │   ├── EmergencyContacts.tsx
│   │   │   ├── Police24x7.tsx     # Police contact
│   │   │   ├── RouteInfoPage.tsx  # Route tracking
│   │   │   ├── SafetyAnalysis.tsx # AI analysis
│   │   │   ├── SafetyMap.tsx      # Interactive map
│   │   │   ├── SafetyTips.tsx     # Safety guidance
│   │   │   ├── SOSHistory.tsx     # Alert history
│   │   │   └── VoiceSOSPage.tsx   # Voice emergency
│   │   ├── services/              # Business logic
│   │   │   ├── api.ts             # API client
│   │   │   ├── blackBoxRecorder.ts # Evidence recording
│   │   │   ├── evidenceUpload.ts  # Cloud backup
│   │   │   ├── offlineManager.ts  # Offline handling
│   │   │   ├── offlineRiskDetector.ts
│   │   │   ├── offlineStorage.ts  # IndexedDB wrapper
│   │   │   ├── riskPredictor.ts   # AI predictions
│   │   │   ├── routeTracker.ts    # GPS tracking
│   │   │   ├── safetyAnalysis.ts  # Zone analysis
│   │   │   ├── voiceAssistant.ts  # Voice control
│   │   │   └── voiceSOS.ts        # Voice emergency
│   │   ├── utils/
│   │   │   └── googleMapsHelper.ts
│   │   ├── App.tsx                # Root component
│   │   └── main.tsx               # Entry point
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                         # Backend application
│   ├── src/
│   │   ├── controllers/           # Request handlers
│   │   │   └── alertsController.ts # SOS alerts
│   │   ├── models/                # Database schemas
│   │   │   ├── Bubble.ts          # Safety groups
│   │   │   ├── EmergencyContact.ts
│   │   │   ├── Report.ts
│   │   │   ├── RouteTracking.ts
│   │   │   ├── SOSAlert.ts
│   │   │   ├── SOSDevice.ts
│   │   │   ├── SafetyTip.ts
│   │   │   ├── User.ts
│   │   │   ├── VoicePreference.ts
│   │   │   └── Zone.ts
│   │   ├── routes/                # API endpoints
│   │   │   ├── alerts.ts          # SOS alerts API
│   │   │   ├── auth.ts            # Authentication
│   │   │   ├── bubbles.ts         # Safety groups API
│   │   │   ├── chatbot.ts         # AI chatbot API
│   │   │   ├── reports.ts         # Incident reports
│   │   │   ├── safetyAnalysis.ts  # AI analysis API
│   │   │   ├── voice.ts           # Voice commands API
│   │   │   └── zones.ts           # Safety zones API
│   │   ├── middleware/
│   │   │   └── auth.ts            # JWT authentication
│   │   ├── config/
│   │   │   └── database.ts        # MongoDB connection
│   │   ├── scripts/
│   │   │   └── initDatabase.ts    # Database setup
│   │   └── app.ts                 # Express server
│   ├── package.json
│   └── tsconfig.json
│
├── package.json                    # Root package file
├── vercel.json                     # Vercel deployment config
└── README.md                       # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local or MongoDB Atlas)
- **Google Maps API Key** (for mapping features)
- **Twilio Account** (optional, for SMS alerts)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jignesh0318/Hackocolypse.git
   cd Hackocolypse
   ```

2. **Install root dependencies:**
   ```bash
   npm install
   ```

3. **Set up the backend:**
   ```bash
   cd server
   npm install
   
   # Create .env file
   cp .env.example .env
   
   # Edit .env with your configuration:
   # MONGODB_URI=your_mongodb_connection_string
   # JWT_SECRET=your_jwt_secret
   # TWILIO_ACCOUNT_SID=your_twilio_sid
   # TWILIO_AUTH_TOKEN=your_twilio_token
   # TWILIO_FROM_NUMBER=your_twilio_phone
   ```

4. **Set up the frontend:**
   ```bash
   cd ../client
   npm install
   
   # Create .env.local file
   cp .env.local.example .env.local
   
   # Edit .env.local with your Google Maps API key:
   # VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   # VITE_ENABLE_GOOGLE_MAPS=true
   ```

5. **Initialize the database:**
   ```bash
   cd ../server
   npm run init-db
   ```

### Running the Application

#### Development Mode:

**Terminal 1 - Backend Server:**
```bash
cd server
npm run dev
```
Server runs at `http://localhost:5000`

**Terminal 2 - Frontend App:**
```bash
cd client
npm run dev
```
App runs at `http://localhost:5173/`

#### Production Build:

```bash
# Build frontend
cd client
npm run build

# Start production server
cd ../server
npm start
```

## 📱 PWA Installation

### Installing as Progressive Web App

**🤖 Android (Chrome/Edge):**
1. Open the app in Chrome
2. Tap the menu (⋮) → "Install app" or "Add to Home screen"
3. Confirm installation
4. App icon appears on home screen

**🍎 iOS (Safari):**
1. Open the app in Safari
2. Tap Share button (□↑)
3. Scroll down → "Add to Home Screen"
4. Name the app → "Add"
5. App icon appears on home screen

**💻 Desktop (Chrome/Edge):**
1. Open the app in browser
2. Look for install icon (⊕) in address bar
3. Click "Install"
4. App opens in standalone window

### PWA Benefits:
- ✅ **Offline Access** - Works without internet
- ✅ **Native Experience** - Runs like installed app
- ✅ **Auto Updates** - Always latest version
- ✅ **No App Store** - Instant installation
- ✅ **Cross-Platform** - Works everywhere
- ✅ **Lightweight** - Minimal storage usage
- ✅ **Push Notifications** - Real-time alerts
- ✅ **Background Sync** - Syncs when online

## 🎯 Usage Guide

### Quick Start Flow

1. **🔐 Registration/Login**
   - Create account with email/phone
   - Set up profile with basic info
   - Grant location permissions

2. **👤 Profile Setup**
   - Add emergency contacts (phone numbers)
   - Fill medical information (blood type, allergies, medications)
   - Set home address for quick reference
   - Configure voice assistant preferences

3. **🗺️ Dashboard Navigation**
   - View interactive safety map with color-coded zones
   - Check real-time safety alerts
   - Monitor battery level
   - Access quick SOS button

4. **📍 Route Tracking**
   - Start tracking before leaving
   - Share live location with safety bubble
   - View route safety score
   - Get safer route suggestions

5. **🚨 Emergency Features**
   - **Quick SOS**: Tap SOS button (5-second countdown)
   - **Voice SOS**: Say "Hey SafeZone, help!"
   - **Low Battery Alert**: Auto-alert at 5% battery
   - **Evidence Recording**: Automatic during emergencies

### Key Features Usage

#### Creating Safety Bubbles
1. Go to "Create Bubble" page
2. Choose permanent or temporary group
3. Add members using invite codes
4. Share locations within bubble

#### Using Voice Assistant
1. Enable microphone permissions
2. Say wake word: "Hey SafeZone"
3. Give commands:
   - "Help!" → Trigger SOS
   - "Where am I?" → Get location
   - "Show safe route" → Get navigation
   - "Safety tips" → Get advice

#### AI Chatbot
1. Click chatbot icon
2. Ask safety questions
3. Get context-aware responses
4. Receive emergency guidance

#### Safety Analysis
1. View heatmap on Safety Map page
2. Check zone risk levels (High/Medium/Low)
3. Read safety factors (crime, lighting, crowd)
4. Report incidents to help community

### Data Storage

- **Local Storage**: Auth tokens, user preferences
- **IndexedDB**: Offline route data, emergency contacts, cached maps
- **Cloud Sync**: Auto-syncs when online
- **Privacy**: All data encrypted, never shared without permission

## 🎨 User Interface

### Responsive Design
- **📱 Mobile** (320px+) - Touch-optimized, single column
- **📲 Tablet** (768px+) - Two-column layout
- **💻 Desktop** (1024px+) - Full sidebar navigation
- **🖥️ Large Screen** (1440px+) - Enhanced map views

### Accessibility
- High contrast modes
- Screen reader support
- Keyboard navigation
- Voice command alternative
- Large touch targets (48px minimum)

## 🔒 Security & Privacy

- **End-to-End Encryption** for messages
- **JWT Authentication** for secure sessions
- **Location Privacy** - Shared only with trusted contacts
- **Data Anonymization** for community reports
- **GDPR Compliant** - Data deletion on request
- **Secure Storage** - Encrypted local data

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/safety-zones
# or MongoDB Atlas: mongodb+srv://user:pass@cluster.mongodb.net/safety-zones

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Twilio SMS (Optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM_NUMBER=+1234567890

# Hugging Face AI (Optional)
HUGGINGFACE_API_TOKEN=your_hf_token
HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct-v0.1
USE_HUGGINGFACE_API=true

# Server
PORT=5000
NODE_ENV=development
```

**Frontend (.env.local):**
```env
# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_ENABLE_GOOGLE_MAPS=true

# API Endpoint
VITE_API_URL=http://localhost:5000

# App Info
VITE_APP_NAME=SafeZone AI
VITE_APP_VERSION=1.0.0
```

### Google Maps API Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Directions API
4. Create API credentials → API Key
5. Restrict API key (optional but recommended)
6. Add key to `.env.local`

## 🧪 Testing

```bash
# Run frontend tests
cd client
npm test

# Run backend tests
cd server
npm test

# Run E2E tests
npm run test:e2e
```

## 📦 Deployment

### Vercel (Frontend)
1. Connect GitHub repository
2. Configure build settings:
   - Build Command: `cd client && npm run build`
   - Output Directory: `client/dist`
3. Add environment variables
4. Deploy

### Heroku (Backend)
```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret

# Deploy
git push heroku main
```

### MongoDB Atlas
1. Create free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Add database user
3. Whitelist IP addresses (0.0.0.0/0 for development)
4. Get connection string
5. Update `MONGODB_URI` in `.env`

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Find and kill process
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/Mac:
lsof -i :5173
kill -9 <PID>
```

**MongoDB connection error:**
- Check MongoDB is running: `mongod --version`
- Verify connection string in `.env`
- Ensure network access in MongoDB Atlas

**Google Maps not loading:**
- Verify API key is correct
- Check API is enabled in Google Cloud Console
- Ensure billing is enabled (required for Google Maps)
- Check browser console for errors

**Service Worker issues:**
- Clear browser cache and reload
- Unregister service worker in DevTools → Application → Service Workers
- Hard refresh (Ctrl+Shift+R)

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork the repository**
2. **Create feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open Pull Request**

### Contribution Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Ensure code passes linting

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Jignesh** - [@jignesh0318](https://github.com/jignesh0318)

## 🙏 Acknowledgments

- OpenStreetMap for map tiles
- Google Maps Platform for location services
- Twilio for SMS services
- Hugging Face for AI models
- React and Vite communities

## 📞 Support

For support, email [support@safezoneai.com](mailto:support@safezoneai.com) or open an issue on GitHub.

## 🔗 Links

- **Live Demo**: [https://ai-safety-zones.vercel.app](https://ai-safety-zones.vercel.app)
- **Documentation**: [GitHub Wiki](https://github.com/jignesh0318/Hackocolypse/wiki)
- **Issue Tracker**: [GitHub Issues](https://github.com/jignesh0318/Hackocolypse/issues)

---

**Made with ❤️ for a safer world**