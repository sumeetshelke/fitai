# FitAI

React Native + Expo fitness tracker with a local Node backend, file-backed database, and token authentication.

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

The database is created automatically at `server/data/fitai-db.json` when the backend starts.

Passwords are stored as salted PBKDF2 hashes. The mobile app stores only the signed auth token in AsyncStorage.

## Environment

Optional backend variables:

```bash
PORT=4000
JWT_SECRET=replace-this-for-real-deployments
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

1. Push this `FitAI` folder to a GitHub repository.
2. Open Render and choose New > Blueprint.
3. Select the GitHub repository.
4. Render will read `render.yaml` and create `fitai-api`.
5. After deploy finishes, open:

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

The Render service uses a persistent disk mounted at `/var/data`, so the file database survives redeploys.

## Features

- Signup and login with backend validation
- Persistent auth session
- Protected profile updates
- Daily food log persistence
- Daily workout log persistence
- Calorie and macro tracking
- Workout sets, reps, and completion tracking
- Theme switcher
