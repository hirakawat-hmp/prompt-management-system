# Project Overview

## Project Purpose
This is a **Prompt Management System** built with the Mastra AI framework. The project serves as a foundation for building AI-powered applications with agents, workflows, and tools.

Currently, the project includes a sample weather agent implementation that demonstrates:
- AI agent creation and configuration
- Tool integration (weather API)
- Workflow orchestration
- Memory/storage management with LibSQL
- Integration with Google Gemini 2.5 Pro LLM

## Tech Stack

### Core Framework
- **Next.js 16.0.1** - React framework with App Router
- **React 19.2.0** - UI library
- **TypeScript 5** - Type-safe JavaScript

### AI/LLM Stack
- **Mastra Core 0.23.3** - AI Agent Framework
- **Mastra LibSQL 0.16.1** - Database/storage layer
- **Mastra Memory 0.15.10** - Memory management for agents
- **Mastra Loggers 0.10.18** - Logging utilities
- **Google Gemini 2.5 Pro** - LLM model

### Supporting Libraries
- **Zod 4.1.12** - Schema validation
- **Tailwind CSS 4** - Utility-first CSS framework
- **ESLint 9** - Code linting
- **Babel React Compiler** - React optimizations

## Environment Requirements
- Node.js runtime
- Google Generative AI API key (required for LLM functionality)
- Linux environment (WSL2)

## Key Features
- AI Agent system with memory and tool integration
- Workflow orchestration for complex AI tasks
- Observability and tracing for AI operations
- Next.js frontend with server-side rendering
- Type-safe development with TypeScript
