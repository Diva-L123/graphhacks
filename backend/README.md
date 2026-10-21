# FalkorDB AI Agent Python Backend (FastAPI)

Production-grade Graph RAG backend powered by **FalkorDB** and **FastAPI**, implementing the 4 Core Logic Modules:
1. **Module 1**: Context Hydration (`(u:User)-[:HAD_SESSION]->(s:Session)-[:RECORDED_FACT]->(f:Fact)`)
2. **Module 2**: Intent Routing & Cypher Tool Execution (Multi-Hop Traversal, Shortest Path, Conflict Detection)
3. **Module 3**: Traceability Subgraph Extractor (D3/Cytoscape formatted JSON + FalkorDB latency)
4. **Module 4**: Dynamic Self-Evolving Memory & Ingestion (Lineage Supersession via `[:SUPERSEDED_BY]`)

## Quickstart

```bash
# 1. Install dependencies
cd backend
pip install -r requirements.txt

# 2. Run FalkorDB (via Docker)
docker run -p 6379:6379 -it --rm falkordb/falkordb

# 3. Start FastAPI server
python main.py
# Server runs on http://localhost:8000
```

## API Endpoints

| Method | Endpoint | Purpose | Request Body / Parameters |
|---|---|---|---|
| `POST` | `/api/chat` | Main reasoning endpoint (streams thoughts + returns subgraph) | `{ "user_id": "user_judge", "session_id": "sess_3", "message": "What services depend on APIGateway?" }` |
| `GET` | `/api/sessions/{user_id}` | Fetches active and historical sessions stored in FalkorDB | `user_id` |
| `GET` | `/api/graph/state` | Returns the entire active graph or a filtered cluster for canvas | `?limit=100&label=All` |
| `POST` | `/api/graph/seed` | One-click button to reset/seed default mock data for judges | `{ "domain": "cloud_infra" }` |
| `POST` | `/api/graph/ingest` | Parses unstructured text or documents into graph nodes/edges | `{ "text": "Auth-V3 was deployed", "source": "slack" }` |
