# FitAI

React Native + Expo fitness tracker with a local Node backend, Supabase database, and token authentication.

## Run The App

Open two terminals from the `FitAI` folder.

Terminal 1:

```bash
npm run server
```

Terminal 2:

```bash
npm start
```

Then scan the Expo QR code with Expo Go, or run:

```bash
npm run web
```

## Backend

The API runs on `http://localhost:4000` by default.

Available endpoints:

- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me`
- `PUT /profile`
- `GET /food-logs`
- `POST /food-logs`
- `DELETE /food-logs/:id`
- `GET /workout-logs`
- `POST /workout-logs`
- `PUT /workout-logs/:id`
- `GET /reports/weekly`
- `GET /reports/monthly`
- `GET /reports/all-time`

The backend uses Supabase when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set. If those variables are missing, it falls back to a local JSON file for offline development.

Passwords are stored as salted PBKDF2 hashes. The mobile app stores only the signed auth token in AsyncStorage.

## Environment

Optional backend variables:

```bash
PORT=4000
JWT_SECRET=replace-this-for-real-deployments
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
```

Optional app variable:

```bash
EXPO_PUBLIC_API_URL=http://localhost:4000
```

For a physical phone, set `EXPO_PUBLIC_API_URL` to your computer's LAN IP, for example:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.10:4000
```

## Deploy Backend On Render

1. In Supabase, open SQL Editor and run `supabase-schema.sql`.
2. In Supabase, copy your Project URL and service role key from Project Settings > API.
3. Push this `FitAI` folder to a GitHub repository.
4. Open Render and choose New > Blueprint.
5. Select the GitHub repository.
6. Render will read `render.yaml` and ask for:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
7. After deploy finishes, open:

```bash
https://your-service-name.onrender.com/health
```

It should return:

```json
{ "ok": true, "service": "fitai-api" }
```

Then update the app environment:

```bash
EXPO_PUBLIC_API_URL=https://your-service-name.onrender.com
```

User data is stored in Supabase, so the Render service can use the free plan without a persistent disk.

## Update Nutrition Data Without Rebuilding

Nutrition data is now read from Supabase through the backend endpoint:

```bash
GET /nutrition-items
```

To add or edit foods without rebuilding the app, open Supabase > Table Editor > `fitai_nutrition_items`.

Important columns:

- `keys`: aliases used for matching, for example `{"rice","cooked rice","white rice"}`
- `serving`: serving size number, for example `100`
- `unit`: `g`, `ml`, `piece`, `tbsp`, etc.
- `calories`, `protein`, `carbs`, `fat`
- `micros`: JSON, for example `{"iron": 1, "magnesium": 3}`
- `active`: set false to hide an item

The app keeps built-in fallback data and merges Supabase rows on top, so Supabase edits can override existing foods or add new ones.

## Features

- Signup and login with backend validation
- Persistent auth session
- Protected profile updates
- Daily food log persistence
- Daily workout log persistence
- Calorie and macro tracking
- Workout sets, reps, and completion tracking
- Theme switcher
- PDF-ready weekly, monthly, and all-time fitness reports

## Reports

The backend aggregates Supabase data from:

- `fitai_food_logs`
- `fitai_workout_logs`
- `fitai_weight_logs`

Report endpoints return structured analytics:

```bash
GET /reports/weekly
GET /reports/monthly
GET /reports/all-time
```

The app uses `expo-print` and `expo-sharing` to generate and share PDF reports on mobile. On web preview, it downloads an HTML report that can be saved as PDF from the browser print dialog.

Backend changes can be deployed to Render without reinstalling the app. A new app screen, like the Reports tab, requires an Expo/EAS Update or app rebuild once so users have the new UI.
