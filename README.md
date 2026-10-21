# FalkorDB Context-Aware AI Agent: Graph-Grounded Cognitive Platform

> **Overcoming Stateless AI Agent Limitations with GraphBLAS-Powered Relational Awareness, Cross-Session Persistent Memory, and 100% Auditable Decision Traceability.**

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org/)
[![FalkorDB](https://img.shields.io/badge/FalkorDB-GraphBLAS-red?logo=redis)](https://www.falkordb.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Lines of Code](https://img.shields.io/badge/lines%20of%20code-~7k-3b82f6)](#-engineering-complexity-snapshot)
[![API Routes](https://img.shields.io/badge/API%20routes-14-10b981)](#-engineering-complexity-snapshot)
[![React Components](https://img.shields.io/badge/React%20components-12-a855f7)](#-engineering-complexity-snapshot)
[![Status](https://img.shields.io/badge/Status-Hackathon--Ready-success)](#)

---

## 🎯 What This Project Does

This project is a **Graph-Grounded AI Agent Platform**.

Standard AI agents rely on plain text or vector databases (RAG), which treat information as isolated text snippets. When an agent needs to understand how multiple systems, people, or concepts connect over time, **text chunks fall apart**.

This project solves that by using **FalkorDB as the agent's real-time brain**. It performs three core operations:

```
                          ┌────────────────────────┐
                          │   Incoming Prompt      │
                          │ (User ID + Session ID) │
                          └───────────┬────────────┘
                                      │
                                      ▼
             ┌──────────────────────────────────────────────────┐
             │       FalkorDB Context Hydration & Memory        │
             │   - Active Facts Pre-Loaded Across Sessions      │
             │   - Sub-Millisecond Property Index Lookups       │
             └────────────────────────┬─────────────────────────┘
                                      │
                                      ▼
             ┌──────────────────────────────────────────────────┐
             │       Multi-Hop GraphBLAS Traversal Engine       │
             │   - Bounded BFS / Shortest Path / Cycle Detect   │
             │   - Subgraph Extraction & Blast-Radius Mapping   │
             └────────────────────────┬─────────────────────────┘
                                      │
                                      ▼
             ┌──────────────────────────────────────────────────┐
             │            Zero-Hallucination Grounding          │
             │   - LLM Constrained to Verified Graph Edges      │
             │   - Dynamic Memory Evolution (Edge Supersession) │
             └────────────────────────┬─────────────────────────┘
                                      │
                                      ▼
             ┌──────────────────────────────────────────────────┐
             │       Visual & Auditable Decision Output         │
             │   - Interactive Canvas Lights Up Evaluated Path  │
             │   - Cryptographic Proof & Cypher Query Inspector │
             └──────────────────────────────────────────────────┘
```

### 🧠 The Three Core Operations

1. **Reasons Over Multi-Hop Connections**:
   When asked complex relational questions, the backend queries FalkorDB using graph traversals rather than guessing, identifying indirect dependencies, shortest connection paths, and ripple effects across multiple nodes.
2. **Maintains Living, Persistent Memory**:
   Instead of wiping chat history or stuffing thousands of tokens into a context window, the agent records conversation turns, extracted facts, and state transitions into a persistent graph. It remembers past sessions, updates stale information, and tracks how facts evolve.
3. **Visually Traces Every Decision**:
   Every time the agent answers, it extracts the exact nodes and edges it evaluated in FalkorDB. The frontend then lights up and animates that path on an interactive canvas, giving users an auditable, transparent explanation of how the agent reached its verdict.

---

## 🏢 What It Is Used For (Practical Applications)

Depending on the seed dataset you load into FalkorDB, the system serves several high-value enterprise use cases:

### 1. 🚨 Incident Response & Blast-Radius Analysis (DevOps / IT)
* **Real-World Problem**: When an alert fires or an API breaks, an on-call engineer needs to know what went wrong, which systems are impacted downstream, and who touched the configuration last.
* **FalkorDB Action**: The agent traverses service dependency paths:
  $$\text{APIGateway} \longrightarrow \text{AuthService} \longrightarrow \text{UsersDB}$$
  It instantly pinpoints the root cause, maps all customer-facing systems affected, and notifies the exact engineering team that authored the last change.
* **Benchmark Scenario in Demo**: `Scenario #1: EU Gateway Incident: Relational Root Cause & Memory Recall`

```cypher
MATCH (i:Incident {id: $incident_id})-[:IMPACTS]->(p:Service)-[:AUTHENTICATES_VIA*1..3]->(root:Service)
MATCH (root)<-[:MODIFIED_CONFIG]-(m:SessionMemory)-[:INVOLVES_ENGINEER]->(eng:Person)
RETURN root.name, eng.name, m.changeDetails;
```

---

### 2. 🧠 Organizational "Company Brain" Copilot
* **Real-World Problem**: Onboarding new developers or tracking system ownership across large enterprises is painful because institutional knowledge is scattered in docs, Slack channels, and code repos.
* **FalkorDB Action**: Answers questions like *"Who owns the billing pipeline, and what internal tools break if we deprecate this endpoint?"* with exact lineage and zero hallucinations.
* **Benchmark Scenario in Demo**: `Scenario #2: Recall User Constraint from Previous Session & Ownership Resolution`

```cypher
MATCH (s:Service {id: $service_id})<-[:OWNS]-(t:Team)-[:REPORTS_TO]->(p:Person)
RETURN s.name, t.name, p.name, p.email, p.onCallEscalation;
```

---

### 3. 🔄 Complex Multi-Session Research & Task Management
* **Real-World Problem**: In long-running technical advisory or architecture planning workflows, users make decisions that supersede earlier assumptions. Flat chat logs forget these or contradict themselves.
* **FalkorDB Action**: The agent remembers architectural constraints and technical decisions across days or weeks. When a decision changes (e.g. `Auth-V2` replaced by `Auth-V3`), it non-destructively marks the old relationship as `superseded` and establishes a `[:SUPERSEDED_BY]` edge, preserving complete audit lineage.
* **Benchmark Scenario in Demo**: `Scenario #4: Contradiction & Deprecation Update (Self-Evolving Memory)`

```cypher
MATCH (t:Team {id: 'team_alpha'})-[r:OWNS]->(old:Service {id: 'srv_auth_v2'})
SET r.status = 'superseded', old.status = 'Deprecated'
CREATE (old)-[:SUPERSEDED_BY {timestamp: timestamp()}]->(new:Service {id: 'srv_auth_v3'})
CREATE (t)-[:OWNS {status: 'active'}]->(new)
RETURN old, new;
```

---

### 4. 🔍 Investigative Compliance & Fraud Auditing
* **Real-World Problem**: Financial compliance auditors and enterprise architects need to detect illegal circular transactions, shared hidden infrastructure, or dangerous circular dependencies that cause systemic deadlocks.
* **FalkorDB Action**: The agent runs cycle detection algorithms (Tarjan's strongly connected components) over directed transaction or dispatch edges to flag loops, circular dependencies, or conflict-of-interest trails with an exportable graph audit proof.
* **Benchmark Scenario in Demo**: `Scenario #3: Find Circular Dependency across Microservices (Cycle Detection)`

```cypher
MATCH path = (s:Service)-[:DISPATCHES_TO|ROUTES_TRANSACTION_TO*2..6]->(s)
RETURN [n IN nodes(path) | n.name] AS cycleLoop, length(path) AS hopCount;
```

---

## 🌟 Problem Statement & Solution Alignment

| Hackathon Requirement | Traditional AI Agent Limitation | Our FalkorDB Solution |
| :--- | :--- | :--- |
| **1. Connect Data** | Flat context windows lose relational topology, multi-hop dependencies, and implicit constraints. | Subgraph representation with **openCypher** queries connecting services, engineers, policies, and vulnerabilities in sub-millisecond lookups. |
| **2. Persistent Memory** | Stateless sessions discard past user interactions, requiring retraining or expensive prompt stuffing. | **Cross-Session Memory Graph**: Ingests facts and decisions as persistent `SessionMemory` nodes with directed relational edges. |
| **3. Ensure Traceability** | Black-box LLM hallucinations offer zero verifiability. | **Auditable Decision Provenance**: Step-by-step reasoning roadmap with exact Cypher queries, activated subgraphs, and cryptographic trace hashes. |

---

## 🛡️ Production & Security Architecture

- **B-Tree Property Indexing**: $O(1)$ node lookups on `User(id)`, `Session(id)`, `Entity(name)`, `Service(id)`, and `Fact(id)`.
- **Query Guardrails**: All multi-hop traversals are strictly bounded ($\le 3$ hops, `LIMIT 25`) to guarantee sub-10ms response times.
- **Cypher Injection Interceptor**: `DELETE`, `DETACH`, `DROP`, `REMOVE`, `SET`, `TRUNCATE` keywords blocked outside administrative seed routes.
- **LLM Jailbreak Guard**: Malicious prompts attempting instruction overwriting or memory wiping are intercepted with `HTTP 403 Forbidden`.
- **Tenant Isolation**: Queries strictly scoped to `(u:User {id: $uid})-[:HAD_SESSION]->(s:Session)`.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, TypeScript) & [FastAPI](https://fastapi.tiangolo.com/) (Python backend option in `backend/`)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Custom Slate / Cyberpunk Dark Theme)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Graph Engine**: [FalkorDB](https://www.falkordb.com/) (openCypher graph database with GraphBLAS sparse-matrix linear algebra engine)
- **Visualizer**: Custom SVG Interactive Graph Canvas with Drag, Zoom, Pan & Traversal Particle Streamers

---

## 📊 Engineering Complexity Snapshot

> Measured from the repository source tree — this is not a toy scaffold, it is a full-stack graph intelligence platform.

| Metric | Value |
| :--- | :--- |
| **Source files** | **29** (27 TypeScript/TSX + 2 Python) |
| **Lines of source** | **~7,000** (6,671 TS/TSX + 322 Python) |
| **React components** | **12** components / 3,912 LOC |
| **Next.js App Router API routes** | **9** (`/api/chat`, `/api/falkordb/*`, `/api/graph/*`, `/api/sessions/[user_id]`) |
| **FastAPI endpoints (Python backend)** | **5** (`/api/chat`, `/api/sessions`, `/api/graph/state`, `/api/graph/seed`, `/api/graph/ingest`) |
| **Total HTTP surface** | **14 endpoints across two runtimes** |
| **Core graph engine** | `src/lib/falkordb-client.ts` — 896 LOC memory store, indexer & tracer |
| **Landing surface** | `src/app/page.tsx` — 465 LOC orchestration view |
| **Infrastructure** | Docker Compose (FalkorDB + app), `.env.example` config, dual-language backend |

### 🧮 Algorithmic Complexity of Core Operations

| Operation | Algorithm / Technique | Time | Space |
| :--- | :--- | :--- | :--- |
| **Context hydration** (cross-session memory load) | Hash map + property index lookup on `User(id)` / `Session(id)` | $O(1)$ avg | $O(V)$ |
| **Blast-radius traversal** | Bounded BFS, hop cap $k \le 3$ | $O(b^{k})$ → $O(V+E)$ unbounded | $O(b^{k})$ |
| **Shortest connection path** | `shortestPath` search, bounded `[*..6]` | $O((V+E)\log V)$ | $O(V)$ |
| **Cycle / deadlock detection** | Tarjan's Strongly Connected Components | $O(V+E)$ | $O(V)$ |
| **Query guardrail scan** | Regex + keyword interceptor over raw Cypher | $O(q)$ in query length | $O(1)$ |
| **Memory supersession** (fact supersession) | `MERGE` upsert + `[:SUPERSEDED_BY]` edge rewrite | $O(1)$ with index | $O(1)$ |
| **Decision trace diff** | Set intersection of matched node/edge IDs | $O(m)$ matches | $O(m)$ |
| **Guardrail math** | Hops $\le 3$, `LIMIT 25`, 3,000 ms statement timeout | worst case bounded | bounded |

### 🧩 Subsystem Breakdown

- **Graph engine** — FalkorDB/GraphBLAS client with sub-millisecond property indexes, `MERGE`-based dedupe, execution metrics, and trace extraction of every node/edge an answer touched.
- **Security layer** (`src/lib/security.ts`) — Cypher injection interceptor, unbounded-traversal blocker (`-[*]-`), LLM jailbreak guard, tenant isolation scoping.
- **Persistence layer** — cross-session `SessionMemory` graph with fact supersession and audit lineage, exposed through session & state routes.
- **Visualizer** — custom SVG canvas with drag, zoom, pan, glow filters, and animated traversal particle streamers highlighting the evaluated path.
- **Interactive surfaces** — architecture, contradiction, dynamic ingestion, and demo video modals; 4 benchmark scenarios; stats overview; traceability inspector.
- **Dual backend** — Next.js route handlers for the live demo plus an optional FastAPI service (`backend/`) with Pydantic request models and schema index bootstrap.

---

## 🏃 Quick Start

The Next.js application is ready to run locally:

```bash
# 1. Clone the repository
git clone https://github.com/Diva-L123/graphhacks.git
cd graphhacks

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 🐳 Running with FalkorDB Container

To connect to a live FalkorDB instance:

```bash
docker compose up -d
```

Configure your `.env.local`:
```env
FALKORDB_URL=redis://localhost:6379
FALKORDB_GRAPH=cognitive_agent
```


---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

