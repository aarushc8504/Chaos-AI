# 🧠 Chaos AI

### Multimodal AI-Powered Personal Study Assistant

> **Turn your study material into an intelligent, interactive learning environment.**

Chaos AI is a full-stack, multimodal AI study platform that allows students to upload their own learning material, ask questions, generate MCQs and flashcards, create study plans, and track their learning progress.

Instead of acting as another general-purpose chatbot, Chaos AI builds a **personal knowledge base from the student's own study material** and uses **Retrieval-Augmented Generation (RAG), vector search, AI agents, MCP, document intelligence, and multimodal AI** to provide contextual and source-grounded learning assistance.

---

## 🚀 Why Chaos AI?

Students usually have their learning resources scattered across:

* 📄 PDFs
* 📝 Lecture notes
* 🖼️ Screenshots
* 📊 Presentations
* 📚 Textbooks
* 📐 Diagrams
* 📑 Previous question papers

The typical workflow looks like:

```text
Find PDF
   ↓
Search manually
   ↓
Read multiple pages
   ↓
Open an AI tool
   ↓
Upload/paste context
   ↓
Ask questions
   ↓
Create questions manually
   ↓
Create flashcards manually
   ↓
Make a study plan somewhere else
   ↓
Track progress manually
```

Chaos AI brings these activities together:

```text
                 ┌─────────────────────┐
                 │   Student Material  │
                 └──────────┬──────────┘
                            ↓
                  Document Understanding
                            ↓
                     Knowledge Base
                            ↓
                    Semantic Retrieval
                            ↓
                       AI Agent
                            ↓
        ┌───────────────────┼──────────────────┐
        ↓                   ↓                  ↓
      Chat                MCQs            Flashcards
        │                   │                  │
        └───────────────────┼──────────────────┘
                            ↓
                      Study Planning
                            ↓
                         Analytics
```

The goal is not to replace general-purpose AI tools.

The goal is to create a **specialized AI learning environment around a student's own knowledge base and learning workflow**.

---

# ✨ Features

## 📚 Personal Study Library

Upload and organize your study material in a personal library.

Supported workflow includes:

* Uploading PDF material
* Tracking document processing status
* Personal material management
* Material-specific AI interaction
* Duplicate file detection

---

## 🤖 AI-Powered Study Chat

Ask natural-language questions about your uploaded material.

Examples:

```text
"Explain deadlock in simple terms."

"What are the four necessary conditions for deadlock?"

"Summarize this topic for my exam."

"Explain this concept like I'm a beginner."
```

Responses are generated using retrieved content from the student's indexed study material.

---

## 🔎 Retrieval-Augmented Generation

Chaos AI uses a RAG pipeline instead of relying only on the model's general knowledge.

```text
User Question
      ↓
Question Embedding
      ↓
Vector Search
      ↓
Relevant Study Material
      ↓
Context Construction
      ↓
AI Model
      ↓
Grounded Response
```

This allows the AI to answer questions using the student's own documents as contextual knowledge.

---

## 📖 Source-Grounded Answers

The application can display the source material used to generate an answer.

For example:

```text
Answer:
Deadlock occurs when...

Sources:
📄 Operating Systems.pdf
   Page 42

📄 Operating Systems.pdf
   Page 43
```

This makes it easier for students to verify the information against their original material.

---

## 📝 AI-Generated MCQs

Students can generate practice questions from their learning material.

The MCQ system supports concepts such as:

* Number of questions
* Topic selection
* Difficulty
* Multiple-choice options
* Correct answers
* Explanations
* Quiz scoring

Example workflow:

```text
Select Material
      ↓
Select Topic
      ↓
Choose Difficulty
      ↓
Generate MCQs
      ↓
Take Quiz
      ↓
Calculate Score
      ↓
Store Result
      ↓
Analyze Performance
```

---

## 🧠 Interactive Flashcards

Chaos AI can generate flashcards from study material.

Example:

```text
┌──────────────────────────────┐
│ What is Virtual Memory?      │
└──────────────────────────────┘

             ↓

┌──────────────────────────────┐
│ A memory-management          │
│ technique that provides      │
│ processes with an abstraction│
│ of larger memory...          │
└──────────────────────────────┘
```

Students can interact with cards and track their review activity.

---

## 📅 AI Study Plans

Chaos AI can help students organize their preparation based on their study requirements.

The study planning system can incorporate:

* Study material
* Exam preparation
* Available study time
* Tasks
* Progress tracking

Example:

```text
Monday
├── DBMS - Normalization
├── 20 MCQs
└── Flashcard Review

Tuesday
├── Operating Systems - Deadlocks
└── Practice Questions

Wednesday
└── Revision
```

---

## 📊 Learning Analytics

Quiz and flashcard activity is stored and used to provide learning insights.

The analytics system helps track:

* Quiz performance
* Correct answers
* Overall percentage
* Flashcard activity
* Study activity
* Learning progress

This creates a continuous learning loop:

```text
Study
  ↓
Practice
  ↓
Measure
  ↓
Identify Weak Areas
  ↓
Study Again
```

---

## 🖼️ Multimodal AI

Chaos AI is designed to work with both **text and visual information**.

Students can interact with:

* Text
* PDFs
* Images
* Screenshots
* Diagrams

For example:

```text
Upload a diagram
       +
Ask a question
       ↓
AI analyzes the visual context
       +
Relevant study material
       ↓
Explanation
```

This is particularly useful for subjects involving diagrams, architecture, graphs, circuits, algorithms, and technical illustrations.

---

# 🏗️ System Architecture

The overall architecture can be represented as:

```text
                           STUDENT
                              │
                              ▼
                    ┌──────────────────┐
                    │   React Frontend │
                    │                  │
                    │ Chat             │
                    │ Library          │
                    │ MCQs             │
                    │ Flashcards       │
                    │ Study Plan       │
                    │ Analytics        │
                    └────────┬─────────┘
                             │
                          HTTP/API
                             │
                             ▼
                    ┌──────────────────┐
                    │ Node + Express   │
                    │     Backend      │
                    └────────┬─────────┘
                             │
             ┌───────────────┼────────────────┐
             │               │                │
             ▼               ▼                ▼
         MongoDB       Azure Blob       Google OAuth
             │          Storage
             │
             │
             ▼
   Azure AI Document Intelligence
             │
             ▼
       Text / Layout Extraction
             │
             ▼
          Chunking
             │
             ▼
      Azure OpenAI Embeddings
             │
             ▼
      Azure AI Search Index
             │
             │
      ┌──────┴───────┐
      │              │
      ▼              ▼
  Vector Search    Metadata
      │
      ▼
   Relevant Chunks
      │
      ▼
   AI Agent + MCP
      │
      ├───────────────┐
      │               │
      ▼               ▼
Search Material   Generate MCQs
      │               │
      └───────┬───────┘
              │
              ▼
       Azure OpenAI
              │
              ▼
       Grounded Answer
              │
              ▼
        React Frontend
              │
              ▼
            USER
```

---

# 🔄 How the System Works

## 1. Uploading a Document

The student uploads a PDF through the React frontend.

```text
Student
   ↓
UploadPanel.jsx
   ↓
POST /api/materials/upload
   ↓
Express Backend
```

The backend receives the file using `Multer`.

---

## 2. File Storage

The actual document is stored in:

**Azure Blob Storage**

MongoDB stores metadata about the document.

Conceptually:

```text
MongoDB
├── User ID
├── File name
├── File hash
├── Blob name
├── Content type
├── Size
└── Processing status

Azure Blob Storage
└── Actual PDF file
```

This separates application metadata from large file storage.

---

## 3. Duplicate Detection

Chaos AI generates a hash for uploaded files.

Conceptually:

```text
PDF
 ↓
Hash
 ↓
ABC123XYZ
```

If the same file is uploaded again, its hash can be compared with existing records to avoid unnecessary duplicate processing.

---

## 4. Document Understanding

The uploaded PDF is processed using:

**Azure AI Document Intelligence**

The service can extract structured information from documents, including:

* Text
* Pages
* Paragraphs
* Tables
* Layout information
* Figures

The project processes documents in batches to make large-document processing more manageable.

---

## 5. Chunking

Large documents are divided into smaller pieces.

For example:

```text
300-page PDF
      ↓
Document extraction
      ↓
Text
      ↓
Chunking
      ↓
Chunk 1
Chunk 2
Chunk 3
...
Chunk N
```

The project uses overlapping chunks so that important context is less likely to be lost at chunk boundaries.

---

## 6. Embeddings

Each chunk is converted into a numerical vector using an embedding model.

Conceptually:

```text
"Deadlock occurs when processes wait indefinitely"
                         ↓
                 Embedding Model
                         ↓
              [0.21, -0.43, 0.72, ...]
```

These vectors represent semantic meaning.

---

## 7. Vector Search

The chunks and their embeddings are indexed in:

**Azure AI Search**

The search index stores information such as:

```text
Document ID
Material ID
User ID
File Name
Page Number
Text Content
Vector Embedding
```

When the student asks a question, the question is also converted into a vector.

The system then finds semantically similar chunks.

```text
Question
   ↓
Question Embedding
   ↓
Vector Search
   ↓
Relevant Chunks
```

---

# 🧩 RAG Pipeline

Chaos AI uses **Retrieval-Augmented Generation (RAG)**.

Instead of:

```text
Question
   ↓
LLM
   ↓
Answer
```

the system follows:

```text
Question
   ↓
Create Embedding
   ↓
Search Knowledge Base
   ↓
Retrieve Relevant Chunks
   ↓
Build Context
   ↓
LLM
   ↓
Grounded Answer
```

This helps the AI answer using the student's uploaded material rather than relying only on general model knowledge.

---

# 🧠 AI Agent + MCP

Chaos AI also includes an agentic architecture using the **Model Context Protocol (MCP)**.

The MCP server exposes tools that the AI agent can use.

Examples include:

```text
search_material
get_material
generate_mcqs
generate_flashcards
```

The architecture becomes:

```text
                    AI Agent
                       │
             ┌─────────┼─────────┐
             │         │         │
             ▼         ▼         ▼
          Search      MCQs    Flashcards
          Material
```

This allows the AI system to perform actions instead of simply generating text.

For example:

```text
User:
"Create 10 difficult MCQs from my DBMS notes."

              ↓

            Agent

              ↓

       Search Material

              ↓

      Retrieve DBMS Content

              ↓

        Generate MCQs

              ↓

       Return Structured Data

              ↓

          Quiz UI
```

---

# 🛠️ Technology Stack

## Frontend

| Technology        | Purpose                        |
| ----------------- | ------------------------------ |
| React             | User interface                 |
| Vite              | Development and build tool     |
| Tailwind CSS      | Styling                        |
| Framer Motion     | Animations                     |
| Three.js          | 3D/interactive visuals         |
| React Three Fiber | React integration for Three.js |
| Drei              | Three.js helper components     |
| Lucide React      | Icons                          |

---

## Backend

| Technology      | Purpose                   |
| --------------- | ------------------------- |
| Node.js         | Backend runtime           |
| Express         | REST API                  |
| Mongoose        | MongoDB object modeling   |
| Multer          | File uploads              |
| Express Session | Session management        |
| CORS            | Cross-origin requests     |
| Zod             | Data/schema validation    |
| dotenv          | Environment configuration |

---

## AI & Azure

| Technology                     | Purpose                       |
| ------------------------------ | ----------------------------- |
| Azure OpenAI                   | LLM generation and embeddings |
| Azure AI Document Intelligence | Document extraction           |
| Azure AI Search                | Semantic/vector search        |
| Azure Blob Storage             | File storage                  |
| MCP                            | AI tool integration           |
| RAG                            | Grounded knowledge retrieval  |

---

## Authentication & Data

| Technology         | Purpose             |
| ------------------ | ------------------- |
| Google OAuth       | User authentication |
| MongoDB            | Application data    |
| Azure Blob Storage | Uploaded files      |

---

# 📁 Project Structure

```text
Chaos-AI/
│
├── backend/
│   │
│   ├── mcp/
│   │   └── server.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Material.js
│   │   ├── QuizResult.js
│   │   ├── FlashcardResult.js
│   │   └── StudyPlan.js
│   │
│   ├── routes/
│   │
│   ├── scripts/
│   │   └── cleanupDuplicateMaterials.js
│   │
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── chat.js
│   │   │   ├── materials.js
│   │   │   ├── quizResults.js
│   │   │   ├── flashcardResults.js
│   │   │   ├── studyPlans.js
│   │   │   └── health.js
│   │   │
│   │   ├── services/
│   │   │   ├── agent.js
│   │   │   ├── chunking.js
│   │   │   ├── documentIntelligence.js
│   │   │   ├── embedding.js
│   │   │   ├── rag.js
│   │   │   ├── search.js
│   │   │   └── searchIndex.js
│   │   │
│   │   └── server.js
│   │
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatArea.jsx
│   │   │   ├── KnowledgeCore.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── SourcePanel.jsx
│   │   │   └── UploadPanel.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Analytics.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Flashcards.jsx
│   │   │   ├── Landing.jsx
│   │   │   ├── Library.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── MCQs.jsx
│   │   │   ├── StudyPlan.jsx
│   │   │   └── Workspace.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md
```

---

# 📌 Important Backend Files

## `server.js`

The main backend entry point.

Responsible for initializing:

* Express
* Middleware
* Sessions
* MongoDB connection
* API routes
* Server configuration

---

## `routes/materials.js`

Handles material-related APIs.

Responsibilities include:

* File uploads
* Material retrieval
* Material deletion
* File validation
* Duplicate detection
* Document processing

---

## `services/documentIntelligence.js`

Handles communication with Azure AI Document Intelligence.

Responsible for extracting structured content from uploaded documents.

---

## `services/chunking.js`

Splits extracted document content into manageable overlapping chunks for retrieval.

---

## `services/embedding.js`

Generates embeddings for document chunks and queries.

---

## `services/searchIndex.js`

Creates/configures the Azure AI Search index.

---

## `services/search.js`

Handles indexing and semantic/vector retrieval from Azure AI Search.

---

## `services/rag.js`

Implements the Retrieval-Augmented Generation workflow.

It connects:

```text
Question
   ↓
Embedding
   ↓
Search
   ↓
Relevant Context
   ↓
LLM
   ↓
Answer
```

---

## `services/agent.js`

Contains the AI agent orchestration logic.

It connects the AI model with the available tools and application capabilities.

---

## `mcp/server.js`

Defines the tools exposed through the Model Context Protocol.

The MCP layer allows the AI agent to interact with application functionality such as:

* Searching study material
* Retrieving material
* Generating MCQs
* Generating flashcards

---

# 📌 Important Database Models

## `User.js`

Stores user information associated with authentication.

---

## `Material.js`

Stores metadata about uploaded study material.

---

## `QuizResult.js`

Stores quiz performance and results.

---

## `FlashcardResult.js`

Stores flashcard learning activity/results.

---

## `StudyPlan.js`

Stores study plans and associated tasks.

---

# 🌐 Frontend Pages

| Page             | Purpose                    |
| ---------------- | -------------------------- |
| `Landing.jsx`    | Product landing page       |
| `Login.jsx`      | Authentication             |
| `Dashboard.jsx`  | Main student dashboard     |
| `Workspace.jsx`  | Main AI learning workspace |
| `Library.jsx`    | Study material library     |
| `MCQs.jsx`       | Interactive quizzes        |
| `Flashcards.jsx` | Flashcard learning         |
| `StudyPlan.jsx`  | Study planning             |
| `Analytics.jsx`  | Learning analytics         |

---

# 🧩 Important Frontend Components

### `ChatArea.jsx`

Handles the main AI conversation interface.

### `UploadPanel.jsx`

Handles study material uploads.

### `SourcePanel.jsx`

Displays retrieved source information associated with AI responses.

### `Sidebar.jsx`

Provides navigation between different parts of the learning environment.

### `KnowledgeCore.jsx`

Provides the interactive visual/3D knowledge experience used within the interface.

---

# 🔐 Authentication Flow

Chaos AI uses Google authentication.

```text
Student
   ↓
Login
   ↓
Google OAuth
   ↓
Authentication Callback
   ↓
Backend
   ↓
Create/Find User
   ↓
Session
   ↓
Authenticated Workspace
```

User-specific information can then be associated with:

```text
User
 ├── Materials
 ├── Quiz Results
 ├── Flashcard Results
 └── Study Plans
```

---

# 🔒 User Data Isolation

The retrieval system associates indexed material with the corresponding user.

Conceptually:

```text
User A
 ├── Material A
 ├── Material B
 └── Material C

User B
 ├── Material D
 └── Material E
```

Search operations can use the current user's identity and selected material to restrict retrieved information.

This is important because personal study material should not be treated as one shared global knowledge base.

---

# 🧪 Development Setup

## Prerequisites

Before running the project, make sure you have:

* Node.js
* npm
* MongoDB
* Azure account/services
* Azure OpenAI access
* Azure AI Search
* Azure AI Document Intelligence
* Azure Blob Storage
* Google OAuth credentials

---

# ⚙️ Installation

Clone the repository:

```bash
git clone <your-repository-url>
cd Chaos-AI
```

---

## Backend

```bash
cd backend
npm install
```

Start the development server:

```bash
npm run dev
```

Or start normally:

```bash
npm start
```

---

## Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Start the frontend:

```bash
npm run dev
```

The Vite development server will provide the local frontend URL.

---

# 🔑 Environment Variables

The application requires credentials/configuration for the services used by the backend.

Create an environment file for the backend and configure the required values for:

```text
MongoDB
Google OAuth
Azure Blob Storage
Azure AI Document Intelligence
Azure AI Search
Azure OpenAI
Session configuration
```

Example structure:

```env
# Database
MONGODB_URI=

# Authentication
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=

# Session
SESSION_SECRET=

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=
AZURE_STORAGE_CONTAINER=

# Azure Document Intelligence
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=
AZURE_DOCUMENT_INTELLIGENCE_KEY=

# Azure AI Search
AZURE_SEARCH_ENDPOINT=
AZURE_SEARCH_API_KEY=
AZURE_SEARCH_INDEX=

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=
AZURE_OPENAI_API_KEY=
AZURE_OPENAI_API_VERSION=
AZURE_OPENAI_CHAT_DEPLOYMENT=
AZURE_OPENAI_EMBEDDING_DEPLOYMENT=
```

> **Never commit real API keys, connection strings, OAuth secrets, or other credentials to GitHub.**

The exact variable names should match the configuration expected by the current backend implementation.

---

# 🔄 Complete End-to-End Workflow

The complete Chaos AI pipeline can be summarized as:

```text
                    UPLOAD
                      │
                      ▼
               React Frontend
                      │
                      ▼
                Express API
                      │
             ┌────────┴────────┐
             ▼                 ▼
        Azure Blob          MongoDB
        File Storage        Metadata
             │
             ▼
     Document Intelligence
             │
             ▼
      Extracted Content
             │
             ▼
          Chunking
             │
             ▼
      Azure OpenAI
        Embeddings
             │
             ▼
      Azure AI Search
       Vector Index
             │
             │
       USER QUESTION
             │
             ▼
      Query Embedding
             │
             ▼
      Semantic Search
             │
             ▼
      Relevant Chunks
             │
             ▼
        AI Agent
             │
          MCP Tools
             │
             ├──────────────┐
             ▼              ▼
        Material        Learning
         Search         Generation
             │              │
             └──────┬───────┘
                    ▼
              Azure OpenAI
                    │
                    ▼
           Grounded Response
                    │
                    ▼
               React UI
                    │
                    ▼
                 Student
```

---

# 💡 Why Not Just Use a General AI Tool?

Chaos AI is not designed to claim that general-purpose AI cannot answer questions.

Instead, it focuses on **specialization and workflow**.

A general AI tool can provide:

```text
Question
   ↓
General AI
   ↓
Answer
```

Chaos AI provides:

```text
Student Material
        ↓
Personal Knowledge Base
        ↓
Semantic Retrieval
        ↓
Source-Grounded AI
        ↓
Questions
        ↓
Flashcards
        ↓
Study Plan
        ↓
Performance Tracking
        ↓
Analytics
```

The key difference is that Chaos AI is designed around the student's **entire learning process**, rather than only individual conversations.

---

# 🎯 Use Cases

Chaos AI can be used for:

### University Students

Upload:

```text
Lecture notes
Textbooks
PPTs
Previous papers
```

and use them for:

* Revision
* Concept explanation
* MCQ practice
* Flashcards
* Study planning

### Technical Subjects

Useful for subjects such as:

* Computer Science
* Engineering
* Mathematics
* Physics
* Electronics
* Data Science

### Exam Preparation

Students can combine:

```text
Study Material
+
AI Explanation
+
MCQs
+
Flashcards
+
Study Plan
+
Analytics
```

into one workflow.

---

# 🌟 What Makes the Project Different?

The project combines several AI application concepts into one platform:

```text
              Chaos AI
                  │
     ┌────────────┼────────────┐
     │            │            │
     ▼            ▼            ▼
Document        RAG          Agents
AI
     │            │            │
     └────────────┼────────────┘
                  │
                  ▼
                MCP
                  │
                  ▼
            Multimodal AI
                  │
                  ▼
           Learning Platform
```

Instead of building only a chatbot, the project integrates:

* Document understanding
* Vector embeddings
* Semantic search
* RAG
* AI agents
* MCP tools
* Multimodal interaction
* Authentication
* Persistent user data
* Assessments
* Flashcards
* Study planning
* Analytics

---

# 🧑‍💻 Development Philosophy

Chaos AI follows a separation between different responsibilities:

```text
Frontend
   ↓
User Experience

Routes
   ↓
API Layer

Services
   ↓
AI / Business Logic

Models
   ↓
Persistent Data

Azure Services
   ↓
AI + Storage Infrastructure

MCP
   ↓
Agent Tool Layer
```

This makes the application easier to extend and maintain.

---

# 🔮 Future Improvements

Potential future improvements include:

* 🎯 Personalized weak-topic detection
* 🧠 Adaptive quiz difficulty
* 📈 More advanced learning analytics
* 🔁 Spaced-repetition scheduling
* 🎙️ Voice-based learning
* 🗣️ AI tutoring conversations
* 📚 Better multi-document reasoning
* 🧪 Automated evaluation of generated answers
* 🔍 Improved citation and source verification
* 📱 Mobile application
* 👥 Collaborative study spaces
* 👨‍🏫 Teacher/instructor dashboards
* 🏫 Institution-level deployment
* 🔐 More advanced enterprise security and access controls

---

# 🛡️ Important Note

Chaos AI is an educational AI application.

AI-generated answers, questions, explanations, and study plans should be treated as learning assistance and verified against authoritative course material where appropriate.

---

# 📜 License

Add the project's chosen license here, for example:

```text
MIT License
```

if the project is intended to be released under MIT.

---

# 👥 Team

**Chaos AI**

Built as an AI-powered learning platform combining modern full-stack development with retrieval-augmented generation, multimodal AI, vector search, and agentic AI technologies.

---

# ⭐ Project Summary

> **Chaos AI transforms personal study material into an intelligent learning environment by combining document intelligence, vector search, RAG, Azure OpenAI, AI agents, MCP, interactive assessments, study planning, and learning analytics.**

```text
Upload → Understand → Retrieve → Ask → Practice → Plan → Track
```

**Chaos AI — From scattered study material to an intelligent learning workspace.**
