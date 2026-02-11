🌍 Team Chat – Real-Time React App

A real-time team chat application built with React + TypeScript.
This project runs locally and allows multiple users to register, join, and chat within a shared team environment.

Each user’s selected country, city, current local time, and live weather are displayed alongside their messages.

🚀 Features

🔐 Simple local registration (Name, Country, City)

👥 Multiple users can register and access simultaneously

💬 Real-time team chat

🌎 Displays selected Country & City per user

🕒 Shows current local time based on selected city

🌤 Displays current weather per user location

🔄 Independent session handling (supports incognito / multiple sessions)

🚪 Simple logout functionality

🧩 Custom React hooks for modular architecture

🛠 Tech Stack

React

TypeScript

Modern React Hooks Architecture

Fetch API for external integrations

🧠 Custom Hooks

The project uses modular custom hooks for better separation of concerns:

useChat – Handles chat state and messaging logic

useCityTime – Fetches and manages real-time city time

useTeamWeather – Fetches weather data per team member

useTeamMemberTime – Manages time updates for all users

🌐 API Integrations

The application integrates with public APIs:

🌍 Country & City API

🌤 Weather API

🕒 Time API

All API calls include proper error handling and fallback logic to prevent UI crashes.

📦 Installation & Setup

Clone the repository:

git clone <your-repo-url>
cd <project-folder>


Install dependencies:

npm install


Run the development server:

npm run dev


If accessing from mobile on the same network:

npm run dev -- --host

🧪 Project Scope

Designed for local development

No backend or database (client-side state management)

Registration is session-based (not persistent)

🏗 Architecture Highlights

Fully typed with TypeScript

Reusable components

Clean separation between UI, hooks, and services

Defensive programming for unstable public APIs

Alphabetically sorted country & city lists

Timeout handling for external API calls

📌 Future Improvements (Optional Enhancements)

Backend integration (Node.js / Firebase)

Persistent database storage

Authentication system

WebSocket-based real-time messaging

Production deployment setup

🔐 Environment Variables

This project uses a Weather API that requires an API key.

Create a .env file in the root directory and add the following:

VITE_WEATHER_API_KEY=your_api_key_here


If you are using Create React App instead of Vite:

REACT_APP_WEATHER_API_KEY=your_api_key_here


⚠️ The weather feature will not work unless a valid API key is provided.

After creating the .env file, restart the development server:

npm run dev

📄 License

This project is for learning and demonstration purposes.
