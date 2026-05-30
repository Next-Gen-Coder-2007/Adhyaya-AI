# Adhyaya AI

An agentic AI-powered learning platform that transforms YouTube videos and playlists into structured, interactive courses with quizzes, assignments, and a personalized AI tutor.

---

# Overview

Adhyaya AI is a learning system that converts unstructured educational content from YouTube into a structured course experience similar to platforms like Udemy or Coursera.

Instead of passively watching videos, learners receive:

- Structured modules and sections
- AI-generated summaries and notes
- Section-wise quizzes and assignments
- A course-specific AI tutor
- Guided and adaptive learning support

---

# AI Agent System

The platform is built around multiple specialized AI agents that work together to convert raw video content into a structured learning experience.

---

## Curriculum Agent

- Extracts key topics from video or playlist transcripts
- Builds structured course hierarchy
- Organizes content into modules and sections
- Defines a logical learning path

---

## Content Structuring Agent

- Processes raw transcripts into meaningful learning segments
- Maps content to timestamps
- Generates section-level summaries
- Ensures continuity and clarity across topics

---

## Quiz Generation Agent

- Generates assessments for each section
- Produces MCQs and conceptual questions
- Provides answers and explanations
- Adjusts difficulty based on content complexity

---

## Assignment Agent

- Creates practical exercises for learners
- Designs conceptual and coding-based tasks
- Provides structured instructions and objectives
- Reinforces applied understanding

---

## Resource Agent

- Identifies relevant external learning materials
- Suggests documentation and references
- Expands learning beyond video content
- Improves conceptual depth

---

## AI Tutor Agent (RAG-Based)

- Answers learner questions using course-specific knowledge
- Uses Retrieval-Augmented Generation (RAG)
- Explains concepts step by step
- Maintains strict alignment with course context

Behavior:
- Course-related questions are answered in detail
- Partially related questions are guided with context
- Unrelated questions are rejected to maintain focus

---

## Relevance Agent

- Evaluates whether a query belongs to the course domain
- Prevents off-topic interactions
- Ensures structured and focused learning behavior

---

## Web Enhancement Agent

- Retrieves external information when required
- Uses trusted sources to improve explanations
- Activates only when relevant to course topics

---

# System Flow

```text
YouTube Video / Playlist
        ↓
Curriculum Agent
        ↓
Content Structuring Agent
        ↓
Quiz and Assignment Agents
        ↓
Resource Agent
        ↓
Structured Course Output
        ↓
AI Tutor (RAG + Agents)
````

---

# Learning Experience

Each generated course provides a complete learning environment:

* Structured video-based modules
* AI-generated explanations and summaries
* Section-wise quizzes
* Practical assignments
* Interactive AI tutor
* Guided progression through content

---

# Key Innovation

Adhyaya AI transforms unstructured educational videos into:

A structured, interactive, and AI-assisted learning system that behaves like a full learning platform rather than a content viewer.

---

# Tech Stack

## Frontend

* React or Next.js
* Tailwind CSS
* React Query
* Axios

---

## Backend

* FastAPI (Python)
* REST APIs
* WebSocket support for real-time interactions

---

## AI Layer

* LangChain
* LangGraph for multi-agent orchestration
* Large Language Models (OpenAI or alternatives)

---

## Retrieval System

* Pinecone vector database
* Retrieval-Augmented Generation (RAG) pipeline

---

## Video Processing

* YouTube Transcript API
* Whisper (for fallback transcription)

---

## Optional Extensions

* Monaco Editor for coding assignments
* Docker-based sandbox for code execution
* Redis for background job handling

---

# Final Vision

Adhyaya AI aims to function as a universal learning engine that transforms any educational video content into a structured, intelligent, and personalized learning experience.
