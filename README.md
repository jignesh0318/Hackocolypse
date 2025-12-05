# AI System for Identifying Unsafe Zones for Women & Students

This project is a web application built using the MERN stack (MongoDB, Express, React, Node.js) aimed at identifying unsafe zones for women and students. The application allows users to report unsafe areas, view reports, and manage zones.

## Features

- User authentication (registration and login)
- Reporting unsafe zones
- Viewing a list of unsafe zones on a map
- Dashboard for users to manage their reports

## Technologies Used

- **Frontend**: React, TypeScript, Vite
- **Backend**: Node.js, Express, TypeScript, MongoDB
- **Database**: MongoDB

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