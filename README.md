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

- Node.js
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd ai-safety-zones-app
   ```

2. Set up the backend:
   - Navigate to the server directory:
     ```
     cd server
     ```
   - Install dependencies:
     ```
     npm install
     ```
   - Create a `.env` file based on the `.env.example` file and configure your database connection.

3. Set up the frontend:
   - Navigate to the client directory:
     ```
     cd ../client
     ```
   - Install dependencies:
     ```
     npm install
     ```

### Running the Application

1. Start the backend server:
   ```
   cd server
   npm start
   ```

2. Start the frontend application:
   ```
   cd ../client
   npm run dev
   ```

### Usage

- Access the application in your browser at `http://localhost:3000`.
- Users can register, log in, report unsafe zones, and view the list of reported zones.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features.

## License

This project is licensed under the MIT License.