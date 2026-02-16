- ### Logging
  - The shared `logger` helper wraps `console` calls with timestamps and levels.
  - Key integration points:
    - `context/AuthContext.tsx` – records auth session detection, updates, refreshes, and sign-outs.
    - `app/sign-in.tsx` – logs sign-in/sign-up attempts (success, failure, and email confirmation cases).
    - `app/services/workoutService.ts` – logs exercise fetch results, weekly plan retrieval, and CRUD operations on plans.
  - To log elsewhere: import `logger` and call `logger.info | logger.warn | logger.error` with optional metadata objects.
# 💪 AI GYM Workbook

A mobile gym application built with **React Native (Expo)** that provides day-wise exercise routines with step-by-step instructions for each exercise.

## 📱 Screenshots

*Coming soon — run the app on your device to preview!*

---

## ✨ Features

- **Day-wise Workout Plans** — Organized exercise routines for each day of the week.
- **Exercise Library** — Detailed list of exercises with sets and reps.
- **Step-by-Step Instructions** — Tap any exercise to view clear, numbered instructions.
- **Cross-Platform** — Runs on both Android and iOS via Expo.
- **Scalable Backend** — Powered by Supabase (PostgreSQL) for easy content management.

---

## 🛠️ Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Framework   | React Native (Expo)                 |
| Navigation  | Expo Router (file-based routing)    |
| Database    | Supabase (PostgreSQL)               |
| Language    | TypeScript                          |
| Styling     | React Native StyleSheet             |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Expo Go](https://expo.dev/client) app on your phone (for testing on a physical device)

### Installation

```bash
# Clone the repository
git clone https://github.com/nitishkumarsonkar/AI-GYM-Workbook.git
cd AI-GYM-Workbook

# Install dependencies
npm install --legacy-peer-deps

# Start the development server
npx expo start --clear
```

### Running on Device

- **iOS Simulator**: Press `i` in the terminal.
- **Android Emulator**: Press `a` in the terminal.
- **Physical Device**: Scan the QR code with the Expo Go app.

---

## 🗄️ Supabase Setup (Optional)

The app ships with **mock data** so you can run it immediately. To connect a real database:

1. Create a project at [supabase.com](https://supabase.com).
2. Run the following SQL in the **SQL Editor**:

```sql
-- Create tables
CREATE TABLE days (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  focus TEXT
);

CREATE TABLE exercises (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  day_id BIGINT REFERENCES days(id),
  name TEXT NOT NULL,
  sets TEXT,
  image_url TEXT
);

CREATE TABLE steps (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  exercise_id BIGINT REFERENCES exercises(id),
  step_order INT,
  instruction TEXT
);

-- Seed sample data
INSERT INTO days (name, focus) VALUES
  ('Monday', 'Chest & Triceps'),
  ('Tuesday', 'Back & Biceps'),
  ('Wednesday', 'Legs & Shoulders'),
  ('Thursday', 'Rest'),
  ('Friday', 'Full Body'),
  ('Saturday', 'Cardio'),
  ('Sunday', 'Rest');
```

3. Copy `.env.example` to `.env` and add your keys:

```bash
cp .env.example .env
```

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 📂 Project Structure

```
gym-app/
├── app/
│   ├── _layout.tsx          # Root layout (Stack Navigator)
│   ├── index.tsx             # Home screen (Day list)
│   ├── day/
│   │   └── [id].tsx          # Exercise list for a day
│   └── exercise/
│       └── [id].tsx          # Exercise detail with steps
├── lib/
│   └── supabase.ts           # Supabase client configuration
├── assets/                   # App icons and splash screen
├── .env.example              # Environment variable template
├── package.json
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

> Built with ❤️ using React Native & Expo
