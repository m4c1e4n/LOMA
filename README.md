# LOMA - Local Opportunities Map App (Ghana)

LOMA is a full-stack platform designed specifically for unemployed youth in Ghana to bridge the gap between education and employment. It provides an interactive map to find local hiring companies, internships, and on-the-job training, alongside a curated skill-building hub.

## Key Features
- **Live Opportunity Map**: Using Leaflet.js to pinpoint local jobs and training centers.
- **Geolocation**: Real-time location tracking to find opportunities within a specific radius.
- **Skill-Building Hub**: Curated learning resources for Tech, Agriculture, Trade, and Business.
- **Auth System**: Firebase Authentication for secure access and personalized dashboards for users.
- **Progress Tracking**: Save favorite opportunities and track completed learning resources.

## Tech Stack
- **Frontend**: React 19, Tailwind CSS, Lucide Icons, Framer Motion.
- **Map Implementation**: Leaflet & React-Leaflet.
- **Backend/Database**: Firebase (Authentication & Firestore).
- **Deployment**: Vite.

## Setup Instructions

### 1. Prerequisites
- Node.js installed.
- A Firebase project.

### 2. Firebase Configuration
Create a `firebase-applet-config.json` in the root directory with your Firebase project credentials. It should look like this:

```json
{
  "projectId": "YOUR_PROJECT_ID",
  "appId": "YOUR_APP_ID",
  "apiKey": "YOUR_API_KEY",
  "authDomain": "YOUR_AUTH_DOMAIN",
  "firestoreDatabaseId": "YOUR_FIRESTORE_DB_ID",
  "storageBucket": "YOUR_STORAGE_BUCKET",
  "messagingSenderId": "YOUR_MESSAGING_SENDER_ID"
}
```

### 3. Firestore Setup
Ensure you have the following collections created in your Firestore database:
- `opportunities`
- `learningResources`
- `users`

Deploy the provided `firestore.rules` to secure your database.

### 4. Running Locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your browser.

## Deployment to GitHub Pages

This project is configured for automated deployment to GitHub Pages via GitHub Actions.

1. **Push to GitHub**: Push your code to a GitHub repository.
2. **Configure Secrets**: Go to your repository settings > Secrets and variables > Actions. Add any necessary environment variables if you transition away from `firebase-applet-config.json`.
3. **Enable Pages**: Go to Settings > Pages and set the Source to "GitHub Actions".
4. **Deploy**: Every push to the `main` branch will automatically trigger the deployment workflow located in `.github/workflows/deploy.yml`.

## Project Structure
- `/src/pages`: Main application views (Map, Skills, Auth, Profile).
- `/src/components`: Reusable UI components (Navbar, ProtectedRoute).
- `/src/lib`: Core logic and Firebase initialization.
- `/src/index.css`: Tailwind and Leaflet styling.

## Attribution
Built for the youth of Ghana to foster growth and local employment.
Map data provided by OpenStreetMap.
Icons by Lucide-React.
