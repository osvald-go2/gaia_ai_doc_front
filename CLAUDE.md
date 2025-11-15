# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the frontend of an AI-powered Product Documentation Generator that processes Feishu (飞书) documents and automatically generates API interface specifications. It integrates with a LangGraph backend for AI-powered document processing and ISM (Interface Semantic Model) generation.

**Technology Stack**: React 18.3.1 + TypeScript + Vite + Tailwind CSS + Radix UI

## Architecture

### Core Components

1. **API Service Layer** (`src/services/api.ts`):
   - Handles communication with LangGraph backend running on port 8123
   - Manages thread creation and workflow execution
   - Provides fallback to mock data when backend is unavailable
   - Base API URL: `http://localhost:8123`

2. **Data Transformation Layer** (`src/utils/dataTransform.ts`):
   - Converts backend ISM data to frontend interface format
   - Generates document sections from API data
   - Intelligent HTTP method inference from interface names/types
   - Automatic RESTful endpoint path generation

3. **Type System** (`src/types/backend.ts`):
   - Comprehensive TypeScript definitions for LangGraph responses
   - ISM (Interface Semantic Model) data structures
   - Backend workflow response types

### Application Flow

1. **URL Input** → User inputs Feishu document URL
2. **Backend Processing** → LangGraph AI workflow processes document
3. **ISM Generation** → Structured interface semantic model created
4. **Data Transformation** → ISM converted to frontend interface configurations
5. **Interface Generation** → API specifications generated with request/response fields
6. **Document Export** → Final documentation generated in various formats

### Key Components

- **URLInput**: Feishu document URL input interface
- **LoadingProcessEnhanced**: Detailed loading with progress tracking
- **InterfaceList**: Manages generated API interfaces with selection
- **InterfaceEditor**: Individual API interface configuration
- **DocumentPanel**: Document generation and preview
- **APIGenerator**: Batch API generation and export
- **HistoryPanel**: Session history management
- **SettingsPanel**: User preferences and configuration

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (port 6790)
npm run dev

# Build for production
npm run build

# Development with custom host/port
npm run dev -- --host 0.0.0.0 --port 6790
```

## Backend Integration

### Required Backend Services

- **LangGraph Backend**: Must be running on `http://localhost:8123`
- **API Documentation**: Available at `http://localhost:8123/docs`

### API Endpoints Used

- `POST /threads` - Create new thread
- `POST /threads/{thread_id}/runs/wait` - Execute workflow and wait for completion
- `GET /threads/{thread_id}` - Get thread information

### Data Flow

1. Frontend sends Feishu URL to backend
2. Backend processes document using AI workflow
3. Backend returns structured ISM data containing:
   - Document metadata
   - Interface definitions with dimensions and metrics
   - Execution plan and diagnostics
4. Frontend transforms ISM data into editable API configurations

## Key File Locations

- **Main App**: `src/App.tsx` - Central state management and workflow orchestration
- **API Service**: `src/services/api.ts` - Backend communication layer
- **Data Transform**: `src/utils/dataTransform.ts` - ISM to interface conversion
- **Types**: `src/types/backend.ts` - Backend response type definitions
- **Components**: `src/components/` - React components
- **UI Components**: `src/components/ui/` - Radix UI primitives

## Configuration

### Vite Configuration (`vite.config.ts`)
- Path aliases configured for all dependencies
- Build output directory: `build/`
- Development server defaults to port 3000 (overridden by npm script)

### API Configuration
- Backend URL configured in `src/services/api.ts`
- Timeout and retry logic implemented
- Automatic fallback to mock data on backend failure

## Error Handling

- Network errors with automatic retry mechanism
- API errors displayed with detailed messages
- Graceful degradation to mock data when backend unavailable
- Toast notifications for user feedback
- Comprehensive error logging for debugging

## Component Architecture Patterns

- **State Management**: React hooks (useState, useEffect)
- **Animation**: Framer Motion for transitions
- **Form Handling**: React Hook Form
- **Styling**: Tailwind CSS with Radix UI components
- **Notifications**: Sonner toast system
- **Markdown**: React Markdown with GFM support

## Development Notes

### Interface Data Structure
- Each interface has request fields (dimensions/metrics) and response fields
- HTTP methods automatically inferred from interface names/types
- RESTful paths generated based on interface purpose
- Support for both single-object and list-based responses

### Mock Data System
- Comprehensive mock data for development without backend
- Realistic interface examples covering various CRUD operations
- Maintains same data structure as backend responses

### Internationalization
- Supports both English and Chinese documentation
- Backend integration documentation primarily in Chinese
- UI components support bilingual content

## Testing

No testing framework is currently configured. Consider adding:
- Jest for unit testing
- React Testing Library for component testing
- Cypress for end-to-end testing

## Build and Deployment

- Production builds output to `build/` directory
- Optimized for ESNext targets
- All dependencies bundled and minified
- Environment variables supported for API configuration