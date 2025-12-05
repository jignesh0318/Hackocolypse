# AI System for Identifying Unsafe Zones for Women & Students

This project is a web application built using the MERN stack (MongoDB, Express, React, Node.js) aimed at identifying unsafe zones for women and students. The application allows users to report unsafe areas, view reports, and manage zones.

**Now available as a Progressive Web App (PWA)! 📱 Install on your phone home screen for instant access.**

## Features

### 🔴 Emergency SOS
- One-tap emergency alert with buzzer sound
- 5-second countdown to prevent accidental triggers
- Automatic location sharing with emergency contacts
- Works even when offline

### 📍 Route Tracking
- Continuous GPS tracking of your path
- View your entire travel route on Google Maps
- Track distance traveled and time
- Route history stored locally on your device

### 🔋 Battery Monitoring
- Real-time battery percentage display
- Automatic emergency alert when battery drops below 5%
- Sends last location and route to emergency contacts before phone shuts down

### 📞 Emergency Contacts
- Add up to 2 emergency contacts with phone numbers
- Medical information storage (blood type, allergies, medications)
- Automatic medical info sharing in emergencies

### 🗺️ Safety Dashboard
- Interactive map with safety zones
- Real-time alerts for unsafe areas
- Safety score analytics
- Recent activity tracking

### 📱 PWA (Progressive Web App)
- Install directly on your home screen (Android & iOS)
- Works offline
- Automatic updates
- Push notifications support

## Technologies Used

- **Frontend**: React 18.3.1, TypeScript, Vite 5.4.21, React Leaflet 4.2.1
- **Backend**: Node.js, Express, TypeScript, MongoDB
- **Database**: MongoDB
- **Maps**: OpenStreetMap with Leaflet
- **PWA**: Service Workers, Web App Manifest, Offline Support

## Project Structure

```
ai-safety-zones-app
├── server
│   ├── src
│   │   ├── models
│   │   ├── routes
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── config
│   │   └── app.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── client
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── services
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/jignesh0318/Hackocolypse.git
   cd Hackocolypse
   ```

2. Install root dependencies:
   ```bash
   npm install
   ```

3. Set up the frontend:
   ```bash
   cd client
   npm install
   npm run build
   ```

### Running the Application

#### Frontend (Development):
```bash
cd client
npm run dev
```
The app will be available at `http://localhost:5173/`

### 📱 Using as PWA (Progressive Web App)

#### Installation Options:

**Android:**
1. Open Chrome and go to your app URL
2. Look for install prompt at the bottom
3. Tap "Install" and confirm

**iOS:**
1. Open Safari and go to your app URL
2. Tap Share → "Add to Home Screen"
3. Enter app name and tap "Add"

**See detailed instructions:** [PWA Installation Guide](./PWA_INSTALLATION_GUIDE.md)

#### Benefits of PWA:
- ✅ Install on home screen like a native app
- ✅ Works offline (with cached content)
- ✅ Automatic updates
- ✅ No app store wait time
- ✅ Works on Android, iOS, Windows, and Mac
- ✅ Smaller download than native apps

#### Backend (Optional):
```bash
cd server
npm install
npm run dev
```

### Features & Flow

1. **Login** → Enter any email/password (demo mode)
2. **Safety Profile Setup** → Fill emergency contacts, medical info, home address
3. **Home Page** → View interactive safety map with color-coded zones (Red/Yellow/Green based on safety scores)
4. **Dashboard** → Real-time safety insights, active alerts, quick SOS actions, emergency tips
5. **Safety Profile** → Manage emergency contacts, medical details, safety preferences

### User Data

- **Login token** stored in `localStorage` (persists across sessions)
- **Profile info** stored in `localStorage` (name, contacts, medical details, address)
- **Zone data** from mock API (5 safety zones in New Delhi area)

### Responsive Design

✅ Desktop (1400px+) — Full layout with sidebar
✅ Tablet (768px-1024px) — Stacked with 2-column stats
✅ Mobile (480px) — Single column, touch-optimized

### Logout

Click "Logout" button in header to clear token and return to login page.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features.

## License

This project is licensed under the MIT License.