# Clarity Canvas - Association Retraining Tool

A React-based therapeutic application for cognitive behavioral therapy and thought retraining. The Clarity Canvas provides an interactive, user-friendly interface for working through challenging thoughts using evidence-based techniques.

## ✨ Features

- **Canvas-Based Layout**: Intuitive lane-based interface for therapeutic workflows
- **Readiness Assessment**: Built-in readiness gate to ensure appropriate user state
- **Thought Mining**: Three-step mining process (Neutralize, Common Ground, Data Extraction)
- **Hierarchical Thought Picker**: Organized replacement thought selection system
- **Error Handling**: Comprehensive error boundaries and graceful degradation
- **Accessibility**: WCAG 2.1 AA compliant with full keyboard navigation
- **Progressive Web App**: Offline capabilities and mobile-optimized experience
- **Privacy First**: All processing happens client-side with no data transmission

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Association-Retraining-Tool

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

## 🧪 Testing

```bash
# Run unit and component tests
npm test

# Run E2E tests
npx playwright test

# Run accessibility tests
npm run test:accessibility
```

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── Canvas.tsx       # Main canvas layout
│   ├── Lane.tsx         # Individual lanes for cards
│   ├── BaseCard.tsx     # Reusable card component
│   ├── ReadinessGate.tsx # Entry assessment
│   ├── ThoughtMining.tsx # Mining workflow
│   ├── ThoughtPicker.tsx # Replacement thought selection
│   └── common/          # Shared UI components
├── context/             # React Context providers
│   └── SessionContext.tsx # Global session state
├── services/            # Business logic services
│   ├── ContentSearchService.ts # Content querying
│   └── ErrorHandlingService.ts # Error management
├── config/              # Configuration
└── theme.ts            # Styled-components theme

build/                   # Production build output
tests/                   # Test files
archive/                 # Legacy code (moved from js/)
```

## 🏗️ Architecture

### Canvas System
The application uses a **lane-based canvas layout** where users progress through therapeutic workflows:

1. **Readiness Lane**: Initial assessment and emotional preparation
2. **Mining Lane**: Three-step thought exploration process
3. **Picker Lane**: Hierarchical replacement thought selection

### State Management
- **SessionContext**: Global session state with React Context
- **Local Component State**: Individual component state management
- **Error Boundaries**: Comprehensive error catching and recovery

### Content Pipeline
- **ContentSearchService**: Queries structured content index
- **Dynamic Loading**: Lazy-loaded content based on user selections
- **Fallback System**: Graceful degradation when content fails to load

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_CONTENT_INDEX_PATH=/content/content-index.bin
VITE_SENTRY_DSN=your_sentry_dsn_here
```

### Sentry Monitoring

To enable error reporting, replace the placeholder in `src/index.tsx`:

```typescript
Sentry.init({
  dsn: 'YOUR_ACTUAL_SENTRY_DSN', // Replace this
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

## 🚀 Deployment

### Static Hosting (Recommended)

The application builds to static files that can be hosted on any static hosting service:

**Vercel:**
```bash
npm install -g vercel
vercel --prod
```

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

**GitHub Pages:**
```bash
npm run build
# Deploy contents of build/ directory
```

### Build Configuration

- **Output Directory**: `build/`
- **Build Command**: `npm run build`
- **Environment**: Node.js 16+

## 🎯 Usage Flows

### Complete Therapeutic Journey

1. **Readiness Assessment**: User assesses emotional readiness (0-10 scale)
2. **Thought Mining**: Three-step exploration process:
   - Neutralize: Voice neutralization exercises
   - Common Ground: Protective intention exploration  
   - Data Extraction: Either/or questions for insight generation
3. **Thought Selection**: Hierarchical browsing of replacement thoughts
4. **Export/Save**: Capture insights and selected thoughts

### Error Recovery

The application includes comprehensive error handling:
- **Automatic Retry**: Failed operations retry up to 3 times
- **Fallback Content**: Graceful degradation with backup content
- **Session Preservation**: User progress maintained through errors
- **User-Friendly Messages**: Clear, supportive error communication

## 🔍 Testing Strategy

- **Unit Tests**: Individual component and service testing
- **Integration Tests**: Context and service integration
- **E2E Tests**: Complete user journey validation
- **Accessibility Tests**: WCAG compliance verification
- **Cross-Browser**: Chrome, Firefox, Safari, Edge support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test && npx playwright test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the [GitHub Issues](issues) for existing solutions
- Create a new issue for bugs or feature requests
- Review the [task specification](archive/specs/clarity-canvas/tasks.md) for implementation details

---

**Built with ❤️ using React, TypeScript, and evidence-based therapeutic techniques.** 