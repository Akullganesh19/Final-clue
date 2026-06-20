# Final Clue - Cold Case Evidence Triage System

A multi-agent case-linkage & evidence-triage system for cold cases, featuring an intelligent case similarity network visualization and heatmap analysis.

## Features

- **Multi-Agent System**: Planner, Retrieval, Evidence, Critic, Summarizer, and Audit agents
- **Case Linkage**: Semantic similarity analysis between cold cases
- **Evidence Triage**: Intelligent categorization and ranking of evidence
- **Interactive Visualization**: Force-directed network graph and heatmap matrix
- **Audit Trail**: Complete blockchain-style audit logging of all operations
- **Bilingual Support**: Handwriting and text analysis capabilities

## Prerequisites

- Node.js (v20 or higher)
- npm or yarn
- Gemini API key

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Final-clue
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

## Development

Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Building

Build for production:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Project Structure

```
├── src/
│   ├── components/       # React components
│   ├── utils/           # Utility functions (audit, analysis, etc.)
│   ├── types.ts         # TypeScript type definitions
│   ├── main.tsx         # React entry point
│   ├── index.css        # Global styles
│   └── App.tsx          # Main app component
├── .github/
│   └── workflows/       # CI/CD workflows
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── index.html           # HTML entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Run production server
- `npm run clean` - Clean build artifacts
- `npm run lint` - Run TypeScript type checking

## Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **AI/ML**: Google Gemini API
- **Visualization**: D3.js or similar for network graphs
- **Server**: Express.js
- **Animation**: Motion.js

## License

MIT

## Author

Akullganesh19
