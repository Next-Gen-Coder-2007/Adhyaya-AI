<p align="center">
  <img src="frontend/src/assets/logo.png" width="96" alt="Adhyaya AI Logo"/>
</p>

<h1 align="center">Adhyaya AI</h1>

<p align="center">
  <strong>Agentic AI Learning Operating System</strong><br/>
  <em>Automated Transformation of 10+ Hour Video Feeds into Interactive Multi-Agent Curricula with LangGraph StateGraphs & Context-Grounded RAG Tutoring</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js 20+"/>
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js"/>
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/LangGraph-StateGraph-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white" alt="LangGraph"/>
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19"/>
  <img src="https://img.shields.io/badge/Groq-Llama_&_GPT_OSS-F05A28?style=for-the-badge" alt="Groq"/>
  <img src="https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google Gemini"/>
  <img src="https://img.shields.io/badge/Vercel-Ready-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel"/>
</p>

---

## Executive Summary

Adhyaya AI is a production-grade, agentic educational platform that resolves passive video learning inefficiencies. The system transforms unstructured YouTube lectures and playlists (supporting 10+ hour masterclasses) into structured, interactive course workspaces.

By coordinating a **LangGraph StateGraph** of specialized AI agents, Adhyaya AI ingests raw video transcripts, extracts prerequisite milestones, structures chronological lesson modules with 10-hour map-reduce token optimization, synthesizes interactive assessment quizzes with instant client-side grading, provisions hands-on engineering labs, and indexes semantic vector embeddings in MongoDB to power an embedded **Retrieval-Augmented Generation (RAG) AI Tutor** with clickable `[MM:SS]` video timestamp citations.

---

## System Architecture

```mermaid
flowchart TD
    subgraph ClientTier ["1. Client-Side Presentation & Interactive Runtime (React 19 + Vite)"]
        UI_Home["Landing Page & Smooth Scroll"]
        UI_Nav["Fixed Header & Zero-Flicker Theme Engine"]
        UI_Dash["Dashboard & Course Catalog Matrix"]
        UI_Studio["Interactive Study Studio Workspace"]
        UI_Player["HTML5/YouTube Synchronized Player"]
        UI_Quiz["Automated Assessment Grading Engine"]
        UI_Scratchpad["Live Timestamped Notes & Markdown Exporter"]
        UI_Chat["RAG AI Tutor Panel with [MM:SS] Seeking"]
        
        UI_Studio --> UI_Player & UI_Quiz & UI_Scratchpad & UI_Chat
    end

    subgraph APISecurityTier ["2. API Gateway & Security Layer (Express.js)"]
        API_Auth["JWT HTTP-Only Cookie Authentication & Bcrypt Hashing"]
        API_OAuth["Google OAuth 2.0 Token Exchange"]
        API_CORS["Dynamic Cross-Origin Resource Sharing (CORS)"]
        API_Health["Health & Readiness Probes (/health)"]
        API_Router["REST API Router Layer (Auth, Courses, Notes, Quizzes)"]
    end

    subgraph MultiAgentEngine ["3. LangGraph Multi-Agent Orchestration & Workflow"]
        Graph_Transcript["fetchTranscriptNode (Universal Caption Extraction)"]
        Graph_Timeline["synthesizeOutlineNode (10-Hour Condensed Timeline Mapping)"]
        Graph_Sections["generateModuleSectionsNode (Windowed Slices)"]
        Graph_Assessments["generateAssessmentsNode (Quiz, Assignment, Summary)"]
        Graph_Finalize["finalizeCourseNode (Metadata Synthesis)"]
        
        LLM_Groq["Groq (Primary LLM)"]
        LLM_Gemini["Google Gemini 2.5 Flash (Fallback LLM)"]
        LLM_Failover["Rate-Limit Semaphore & Exponential Backoff"]
        
        Graph_Transcript --> Graph_Timeline --> Graph_Sections --> Graph_Assessments --> Graph_Finalize
        Graph_Sections & Graph_Assessments <--> LLM_Failover
        LLM_Failover <--> LLM_Groq & LLM_Gemini
    end

    subgraph VectorRAGTier ["4. Semantic Vector Indexing & RAG Subsystem"]
        Embed_Engine["Gemini / TF-IDF Vector Embeddings"]
        Mongo_Chunks["MongoDB Chunk Collection (Cosine Similarity)"]
        RAG_Graph["LangGraph Conversational RAG Graph (ragGraph.js)"]
        
        Graph_Finalize --> Embed_Engine --> Mongo_Chunks
        UI_Chat <--> API_Router <--> RAG_Graph <--> Mongo_Chunks
    end

    subgraph DataInfraTier ["5. Data Persistence & Cloud Infrastructure"]
        Mongoose_Engine["Mongoose ODM (MongoDB Atlas)"]
        Vercel_Deploy["Vercel Serverless & SPA (vercel.json)"]
        
        API_Router & MultiAgentEngine <--> Mongoose_Engine
    end

    ClientTier <===> APISecurityTier
    APISecurityTier <===> MultiAgentEngine
```

---

## Deployment (Vercel)

- **Frontend**: Single Page Application with Vite (`frontend/vercel.json`)
- **Backend**: Express Serverless on Node.js 20+ (`backend/vercel.json`)
