# RAJGPT - Elite AI Orchestration Platform

## Overview

RAJGPT is a production-grade multi-agent AI orchestration system that combines 5 specialized AI agents working in real-time to accomplish complex goals. Built with TypeScript, React, and PostgreSQL, it features live visualization, task execution monitoring, and comprehensive analytics.

## Current State

**Status**: MVP Complete ✅  
**Last Updated**: October 21, 2025

The application is fully functional with all core features implemented:
- Multi-agent orchestration with 5 specialized agents
- Real-time WebSocket updates for live execution monitoring
- PostgreSQL database with complete persistence
- Beautiful dark-mode UI with responsive design
- Analytics dashboard with performance metrics
- Complete API for execution management

## Recent Changes

### October 21, 2025 - Initial Implementation
- Built complete schema with executions, tasks, agent logs, and tool usage tables
- Implemented 5 AI agents: Planner, Executor, Researcher, Coder, Analyst
- Created orchestrator for coordinating agent execution
- Built WebSocket server for real-time updates
- Designed stunning UI with agent color coding and live visualizer
- Implemented analytics dashboard with charts
- Set up PostgreSQL database with Drizzle ORM

## Project Architecture

### Tech Stack

**Frontend**:
- React with TypeScript
- Tailwind CSS for styling
- Shadcn UI components
- React Query for state management
- Wouter for routing
- Recharts for analytics visualization
- WebSocket client for real-time updates

**Backend**:
- Express.js with TypeScript
- PostgreSQL (Neon) database
- Drizzle ORM for database operations
- WebSocket server for real-time communication
- OpenAI GPT-5 (or compatible API) for agent intelligence

### Agent System

**Planner Agent** (Purple):
- Breaks down complex goals into actionable subtasks
- Assigns tasks to appropriate agents
- Creates execution plans

**Executor Agent** (Cyan):
- Performs general operations and API calls
- Handles file operations and data processing
- Executes system tasks

**Researcher Agent** (Teal):
- Conducts web searches and data gathering
- Analyzes research findings
- Provides comprehensive summaries

**Coder Agent** (Orange):
- Writes, debugs, and executes code
- Supports multiple programming languages
- Provides code explanations

**Analyst Agent** (Magenta):
- Processes results from other agents
- Generates insights and recommendations
- Creates final summaries

### Database Schema

**Executions**: Stores user goals and overall execution results
**Tasks**: Individual subtasks created by the Planner
**Agent Logs**: Detailed logs of agent actions and reasoning
**Tool Usage**: Tracks which tools were used by agents

## User Preferences

- **Theme**: Dark mode by default
- **Design**: Professional, technical aesthetic with agent color coding
- **Layout**: Sidebar navigation with dashboard-centric workflow

## Features

### Core Features
- **Multi-Agent Orchestration**: 5 specialized agents work together to accomplish goals
- **Real-Time Visualization**: Live agent network visualization with activity indicators
- **Task Execution Timeline**: Interactive timeline showing task progression
- **Live Output Window**: Real-time logs and agent reasoning
- **Analytics Dashboard**: Performance metrics, success rates, and tool usage statistics
- **Execution History**: Browse and review past executions with detailed results

### UI Components
- Agent Status Cards with performance metrics
- Agent Network Visualizer with animated connections
- Task Input with goal submission
- Execution Output with syntax highlighting
- Metrics Cards showing key statistics
- Timeline view for task execution flow

## Environment Configuration

### Required Environment Variables

```bash
# Database (auto-configured by Replit)
DATABASE_URL=
PGPORT=
PGUSER=
PGPASSWORD=
PGDATABASE=
PGHOST=

# Session management
SESSION_SECRET=

# OpenAI API (or compatible endpoint)
OPENAI_API_KEY=your-api-key-here
OPENAI_BASE_URL=https://api.openai.com/v1  # Optional: for custom endpoints
OPENAI_MODEL=gpt-4o-mini  # Optional: default is gpt-4o-mini
```

### OpenAI-Compatible APIs

RAJGPT is designed to work with OpenAI-compatible API endpoints. You can use:
- OpenAI's official API
- Local LLM servers (LM Studio, Ollama with OpenAI compatibility)
- Cloud providers with OpenAI-compatible endpoints (Together AI, Groq, Fireworks, etc.)

**Important**: To enable the multi-agent system, you must configure:
1. `OPENAI_API_KEY` - Your API key for the service
2. `OPENAI_BASE_URL` (optional) - Custom endpoint URL if not using OpenAI's official API
3. `OPENAI_MODEL` (optional) - Model name to use (defaults to gpt-4o-mini)

Without these configured, the agents will not be able to process tasks. The UI and infrastructure will work, but executions will fail with an authorization error.

**Example configurations**:
```bash
# For OpenAI's official API
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini

# For local Ollama with OpenAI compatibility
OPENAI_API_KEY=dummy-key
OPENAI_BASE_URL=http://localhost:11434/v1
OPENAI_MODEL=llama3.2

# For LM Studio
OPENAI_API_KEY=dummy-key
OPENAI_BASE_URL=http://localhost:1234/v1
OPENAI_MODEL=your-model-name

# For Together AI
OPENAI_API_KEY=your-together-api-key
OPENAI_BASE_URL=https://api.together.xyz/v1
OPENAI_MODEL=meta-llama/Llama-3.3-70B-Instruct-Turbo

# For Groq
OPENAI_API_KEY=your-groq-api-key
OPENAI_BASE_URL=https://api.groq.com/openai/v1
OPENAI_MODEL=llama-3.3-70b-versatile
```

## Development

### Running the Application

```bash
npm run dev
```

This starts both the Express backend and Vite frontend on port 5000.

### Database Migrations

```bash
# Push schema changes to database
npm run db:push

# Force push if needed
npm run db:push --force
```

### File Structure

```
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and helpers
├── server/              # Backend Express application
│   ├── agents/          # AI agent implementations
│   │   ├── base-agent.ts
│   │   ├── planner-agent.ts
│   │   ├── executor-agent.ts
│   │   ├── researcher-agent.ts
│   │   ├── coder-agent.ts
│   │   ├── analyst-agent.ts
│   │   └── orchestrator.ts
│   ├── db.ts           # Database connection
│   ├── storage.ts      # Database operations
│   └── routes.ts       # API routes and WebSocket
└── shared/             # Shared types and schemas
    └── schema.ts       # Drizzle schema definitions
```

## API Endpoints

### Executions
- `POST /api/executions` - Create new execution
- `GET /api/executions` - Get all executions
- `GET /api/executions/:id` - Get execution by ID
- `GET /api/executions/:id/tasks` - Get tasks for execution
- `GET /api/executions/:id/logs` - Get logs for execution

### Analytics
- `GET /api/analytics` - Get performance metrics

### WebSocket
- `ws://localhost:5000/ws` - Real-time updates

## WebSocket Events

### Client Receives

**execution_update**: Execution status changes
```json
{
  "type": "execution_update",
  "payload": {
    "executionId": "uuid",
    "status": "planning|executing|completed|failed",
    "currentAgent": "planner|executor|researcher|coder|analyst",
    "currentTask": "task description",
    "timestamp": 1234567890
  }
}
```

**task_update**: Task status changes
```json
{
  "type": "task_update",
  "payload": { ...task object }
}
```

**log**: New log entry
```json
{
  "type": "log",
  "payload": { ...log object }
}
```

**agent_performance**: Agent performance update
```json
{
  "type": "agent_performance",
  "payload": {
    "agentType": "planner",
    "performance": {
      "tasksCompleted": 10,
      "successRate": 95,
      "avgDuration": 2500
    }
  }
}
```

## Design System

### Colors

**Agent Colors**:
- Planner: `hsl(260 70% 65%)` - Purple
- Executor: `hsl(200 85% 55%)` - Cyan
- Researcher: `hsl(150 60% 55%)` - Teal
- Coder: `hsl(30 85% 60%)` - Orange
- Analyst: `hsl(280 65% 60%)` - Magenta

**Typography**:
- Sans: Inter
- Mono: JetBrains Mono
- Display: Space Grotesk

### Component Guidelines

Follow the design_guidelines.md file for detailed component usage, spacing, and interaction patterns.

## Known Limitations

- Actual web search requires external API integration (SerpAPI)
- Code execution is simulated (Piston API integration needed for real execution)
- Web scraping requires Cheerio.js setup with proper handling

## Future Enhancements

### Next Phase Features
- Support for custom local LLM endpoints with model switching
- Automated Jest testing suite for agents and orchestration
- Agent memory system with learning from past executions
- Collaborative multi-user support with shared workspaces
- Advanced retry logic and self-healing agent recovery
- Real SerpAPI, Cheerio.js, and Piston API integrations

## Deployment

The application is ready for deployment on Replit. Use the "Deploy" button to publish the application.

### Production Considerations
- Set `OPENAI_API_KEY` in production environment
- Configure `SESSION_SECRET` for secure sessions
- Database is automatically managed by Replit
- WebSocket connections work automatically on Replit deployments

## Support & Contact

For issues or questions about RAJGPT, please check the design_guidelines.md and this documentation first.
