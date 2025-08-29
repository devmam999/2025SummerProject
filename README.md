## RoadMap AI – Monorepo

Interactive road trip planner with Firebase auth, Google Maps/Places, and an Express + TypeScript backend that suggests and refines stops (food, gas, hotels) along your route.

### Quick Start
1. Clone and install dependencies:
```bash
git clone <your-repo>
cd 2025SummerProject
npm install
```

2. Create environment files:
   - `backend/.env` (Firebase Admin + Google API)
   - `frontend/.env` (Backend URL + Google Maps API)

3. Start both apps:
```bash
npm run dev
```

### Project structure
```text
.
├─ package.json                # Monorepo scripts (workspaces)
├─ README.md
├─ backend/
│  ├─ package.json
│  ├─ tsconfig.json
│  └─ src/
│     ├─ app.ts                # Express app bootstrap
│     ├─ routes/
│     │  ├─ index.ts           # Mount /routes
│     │  └─ routes.routes.ts   # POST /routes/suggestions, /routes/refine
│     ├─ controllers/
│     │  └─ routes.controller.ts
│     ├─ middleware/
│     │  └─ auth.ts            # Firebase Admin token verification
│     ├─ services/
│     │  ├─ googlePlaces.ts    # Places/Directions API calls + ranking
│     │  ├─ preferences.ts     # Firestore user preferences
│     │  └─ refinement.ts      # Feedback parsing → category adjustments
│     └─ types/
│        └─ express.d.ts       # Augment Request with userId
│
└─ frontend/
   ├─ package.json
   ├─ vite.config.ts
   ├─ public/
   │  ├─ logo.png
   │  ├─ google-icon.svg
   │  └─ ...
   └─ src/
      ├─ pages/
      │  ├─ Dashboard.tsx      # Map UI, calls backend, refinement box (only page edited)
      │  ├─ Settings.tsx
      │  ├─ SignIn.tsx
      │  └─ SignUp.tsx
      ├─ firebase.tsx          # Client Firebase init (auth + firestore)
      ├─ authentication.tsx    # Sign-in/up helpers
      ├─ App.tsx / main.tsx    # App entry
      └─ styles, assets, etc.
```

Monorepo scripts (from repo root):
```bash
# run both frontend and backend in dev
npm run dev

# run individually
npm run dev:backend
npm run dev:frontend

# build
npm run build:backend
npm run build:frontend
```

### Prerequisites
- Node.js 18+ and npm
- Google Cloud project with the following APIs enabled:
  - **Maps JavaScript API** (frontend)
  - **Directions API** (backend)
  - **Places API** (backend)
- Firebase project with:
  - Web app configured (frontend SDK keys)
  - Service Account for Admin SDK (backend)
  - Firestore enabled (collection `preferences/{userId}`)

### Firebase Admin SDK Setup
To get your Firebase credentials for the backend:

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project** (or create one)
3. **Get Project ID**: 
   - Click the gear icon ⚙️ next to "Project Overview"
   - Select "Project settings"
   - Copy the "Project ID" (this is your `FIREBASE_PROJECT_ID`)

4. **Generate Service Account Key**:
   - In Project settings, go to "Service accounts" tab
   - Click "Generate new private key"
   - Download the JSON file
   - **Keep this file secure** - it contains sensitive credentials

5. **Extract credentials from the JSON**:
   ```json
   {
     "type": "service_account",
     "project_id": "your-project-id",
     "private_key_id": "abc123...",
     "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
     "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com",
     "client_id": "123456789",
     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
     "token_uri": "https://oauth2.googleapis.com/token"
   }
   ```

6. **Use these values in `backend/.env`**:
   ```bash
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
   ```

**Important**: 
- The `private_key` must preserve the `\n` newlines exactly as shown
- Never commit the service account JSON file to version control
- The service account automatically has access to Firestore if it's enabled in your project

### Backend Setup
1) Create `backend/.env`:
```bash
PORT=4000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nABC...\n-----END PRIVATE KEY-----\n"
GOOGLE_MAPS_API_KEY=your-google-api-key
```
Notes:
- The private key must preserve newlines using `\n` as shown above.
- Ensure your Google API key is allowed to access Directions and Places APIs.

2) Install & run:
```bash
cd backend
npm install
npm run dev
```
Production:
```bash
cd backend
npm install
npm run build
npm run start
```

### Frontend Setup
1) Create `frontend/.env` (or `.env.local`):
```bash
VITE_BACKEND_URL=http://localhost:4000
VITE_MAPS_API_KEY=your-google-api-key
```

2) Install & start:
```bash
cd frontend
npm install
npm run dev
```

### How It Works
- User signs in (Firebase). The frontend retrieves a Firebase ID token and calls the backend.
- After picking a route on `Dashboard.tsx`, the frontend sends `{ origin, destination, waypoints? }` to the backend.
- Backend fetches user preferences from Firestore (`preferences/{userId}`), queries Google Places for categories (restaurants, gas, lodging), ranks/filters, and returns:
  - `polyline`: an encoded route polyline (Directions API)
  - `stops`: suggested stops with location, name, category, rating, price level
- Frontend overlays the polyline and shows markers with category-specific icons.
- Refinement input lets users send feedback (e.g., "Add one more hotel", "Too expensive"). Backend adjusts categories/filters and returns updated results.

### API
Base URL: `${VITE_BACKEND_URL}/api`

- POST `/routes/suggestions`
  - Headers: `Authorization: Bearer <Firebase ID token>`
  - Body:
    ```json
    { "route": { "origin": {"lat": 0, "lng": 0}, "destination": {"lat": 0, "lng": 0}, "waypoints": [] } }
    ```
  - Response:
    ```json
    { "polyline": "<encoded>", "stops": [{ "placeId": "...", "name": "...", "location": {"lat": 0, "lng": 0}, "category": "restaurant|gas_station|lodging", "rating": 4.5, "priceLevel": 2 }] }
    ```

- POST `/routes/refine`
  - Headers: `Authorization: Bearer <Firebase ID token>`
  - Body:
    ```json
    { "route": { ... }, "feedback": "Add one more hotel", "previousStops": [ ... ] }
    ```
  - Response: same shape as `/routes/suggestions`.

### Firestore data
- Collection: `preferences`
- Document ID: Firebase `uid`
- Example document:
```json
{
  "budget": "medium",            // "low" | "medium" | "high"
  "avoidTolls": false,
  "cuisine": ["mexican", "thai"],
  "minRating": 4
}
```

### Development Notes
- CORS is open by default (`origin: true`). Update in `backend/src/app.ts` as needed.
- Frontend decodes polylines via `google.maps.geometry.encoding.decodePath` (library `geometry` is loaded).
- Only `frontend/src/pages/Dashboard.tsx` was modified; other pages and auth logic remain intact.

### Troubleshooting
- **Backend won't start**: Ensure `backend/.env` exists with all required variables.
- **Firebase Admin errors**: Verify service account credentials in `backend/.env`.
- **401 Unauthorized**: ensure the user is signed in and the frontend sends `Authorization: Bearer <token>`.
- **500 from backend**: verify `.env` values, Google APIs are enabled, and service account has access to Firestore.
- **Map not loading**: check `VITE_MAPS_API_KEY` and that the Maps JavaScript API is enabled.
