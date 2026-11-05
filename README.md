# Explore Local

Explore Local is an AI-powered travel companion for discovering and understanding places. Its main feature, **Heritage Lens**, analyzes a photo of a landmark or architectural detail and creates an informative story about it.

## Features

- **AI Heritage Lens:** Upload or take a photo, optionally add the place name or area, and get an AI-generated description.
- **Sources and uncertainty notes:** See related references when available, and clear notices when an identification or historical detail is uncertain.
- **Listen to the story:** Use the built-in speaker controls to hear the description.
- **Vibe Discovery:** Find dynamically suggested places that match a mood, such as “sandy,” “eerie,” or “joyful.”
- **Trip Planner:** Generate a suggested itinerary based on your destination, trip length, pace, and interests.
- **Responsive design:** Use the site on desktop or mobile.

## Tech Stack

- Next.js and React
- TypeScript
- Tailwind CSS
- Gemini API
- Browser Speech Synthesis

## Run Locally

You’ll need Node.js and a Gemini API key.

1. In the project folder, copy the environment template:

   ```powershell
   Copy-Item .env.example .env.local
