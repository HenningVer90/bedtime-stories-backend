# Bedtime Stories Backend API

Backend API for generating personalized children's bedtime stories using Anthropic's Claude AI.

## Features

- Generate custom bedtime stories in multiple languages (English, Afrikaans, Spanish)
- RESTful API design
- Error handling and validation
- Health check endpoint
- CORS enabled

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
ANTHROPIC_API_KEY=your_key_here
PORT=3001
```

3. Run locally:
```bash
npm run dev
```

4. Test:
```bash
npm test
```

## API Endpoints

### GET /
Returns API information

### GET /health
Health check endpoint

### POST /api/generate-story
Generate a bedtime story

**Request Body:**
```json
{
  "prompt": "Your story generation prompt"
}
```

**Response:**
```json
{
  "success": true,
  "story": "Generated story text...",
  "metadata": {
    "model": "claude-sonnet-4-20250514",
    "tokens": 450
  }
}
```

## Environment Variables

- `ANTHROPIC_API_KEY` - Your Anthropic API key (required)
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

## Deployment

Deployed on Railway.app

## License

MIT

---
Last updated: October 27, 2025