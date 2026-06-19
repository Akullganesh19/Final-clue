# Contributing to Final Clue

Thank you for your interest in contributing to Final Clue! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive criticism
- Help others learn and grow

## Getting Started

1. **Fork the repository** and clone your fork
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Install dependencies**: `npm install`
4. **Follow the code style**: TypeScript with strict type checking
5. **Write tests** for new features
6. **Keep commits atomic** and descriptive

## Development Workflow

```bash
# Start development server
npm run dev

# Type checking
npm run lint

# Build for production
npm run build

# Clean build artifacts
npm run clean
```

## Commit Message Guidelines

- Use clear, descriptive titles
- Reference related issues: "Fixes #123"
- Start with a verb: "Add", "Fix", "Refactor", "Improve"
- Keep first line under 50 characters

## Pull Request Process

1. Update documentation if needed
2. Run `npm run lint` to check types
3. Provide a clear description of changes
4. Link to related issues
5. Ensure tests pass
6. Request review from maintainers

## Project Areas

### Multi-Agent System
- **Planner**: Orchestrates case analysis workflow
- **Retrieval**: Fetches and processes case data
- **Evidence**: Triages and ranks evidence
- **Critic**: Validates findings
- **Summarizer**: Generates reports
- **Audit**: Maintains blockchain-style logs

### Frontend Components
- Interactive network visualization
- Heatmap matrix displays
- Case comparison interface
- Evidence dashboard

### Core Features
- Semantic similarity analysis
- Bilingual handwriting/text analysis
- Real-time evidence scoring
- Audit trail management

## Testing

- Write unit tests for utilities
- Test agent interactions
- Verify visualization rendering
- Check API integration

## Performance Considerations

- Optimize semantic similarity queries
- Cache case analysis results
- Minimize re-renders in React components
- Monitor API rate limits

## Documentation

- Update README for major changes
- Document new utility functions
- Add JSDoc comments to complex code
- Keep type definitions clear

## Getting Help

- Open an issue for bugs
- Start a discussion for features
- Check existing issues first
- Use descriptive titles

Thank you for contributing to Final Clue! 🔍
