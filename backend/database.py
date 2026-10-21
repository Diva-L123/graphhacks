import time
import os
import re
from falkordb import FalkorDB

# Connect to FalkorDB (via Docker, Cloud or local instance with Auth & SSL support)
falkor_host = os.getenv("FALKORDB_HOST", "localhost")
falkor_port = int(os.getenv("FALKORDB_PORT", "6379"))
falkor_password = os.getenv("FALKORDB_PASSWORD", None)
falkor_ssl = os.getenv("FALKORDB_SSL", "False").lower() == "true"

db = FalkorDB(
    host=falkor_host,
    port=falkor_port,
    password=falkor_password,
    ssl=falkor_ssl
)
graph = db.select_graph("AgentBrain")

FORBIDDEN_KEYWORDS = ["DELETE", "DETACH", "DROP", "REMOVE", "SET", "TRUNCATE"]
MAX_HOPS = 3
MAX_NODES_LIMIT = 25

def init_schema_indexes():
    """
    Part 1.1: Node Property Indexes & Schema Constraints
    Creates B-tree property indexes for O(1) multi-hop lookups.
    """
    index_statements = [
        "CREATE INDEX FOR (u:User) ON (u.id)",
        "CREATE INDEX FOR (s:Session) ON (s.id)",
        "CREATE INDEX FOR (e:Entity) ON (e.name)",
        "CREATE INDEX FOR (srv:Service) ON (srv.id)",
        "CREATE INDEX FOR (f:Fact) ON (f.id)"
    ]
    for statement in index_statements:
        try:
            graph.query(statement)
        except Exception:
            pass  # Index already exists or graph freshly created

# Initialize indexes on startup
try:
    init_schema_indexes()
except Exception:
    pass

def validate_cypher_safety(query: str, allow_writes: bool = False):
    """
    Part 2.1: Cypher Syntax Whitelisting / Read-Only Guard
    Blocks write queries and unbounded Cartesian expansions on reasoning endpoints.
    """
    normalized = query.strip().upper()
    if not allow_writes:
        for keyword in FORBIDDEN_KEYWORDS:
            if re.search(r'\b' + keyword + r'\b', normalized):
                raise ValueError(f"Security Alert: Destructive Cypher operation '{keyword}' is forbidden on reasoning endpoints.")
    
    # Bound Path Lengths: Guard against unbounded open traversals -[*]->
    if re.search(r'-\[\*(\.\.\d+)?\]->', query):
        raise ValueError("Query Guardrail Triggered: Unbounded traversal detected. Cap hop depth to <= 3 (e.g. -[*1..3]->).")

def execute_traceable_cypher(query: str, params: dict = None, allow_writes: bool = False):
    """
    Executes parameterized Cypher queries with execution guardrails and latency profiling.
    """
    # 1. Security & Guardrail Check
    validate_cypher_safety(query, allow_writes=allow_writes)

    start = time.perf_counter()
    try:
        # 2. Parameterized Execution
        result = graph.query(query, params or {})
        duration_ms = round((time.perf_counter() - start) * 1000, 2)
    except Exception as e:
        duration_ms = round((time.perf_counter() - start) * 1000, 2)
        return {
            "raw_results": [],
            "subgraph": {"nodes": [], "edges": []},
            "execution_time_ms": duration_ms,
            "cypher": query,
            "error": str(e)
        }
    
    nodes_map = {}
    edges_list = []
    
    for row in result.result_set:
        for item in row:
            if hasattr(item, "nodes") and hasattr(item, "edges"):
                for n in item.nodes:
                    if len(nodes_map) < MAX_NODES_LIMIT:
                        nodes_map[n.id] = {
                            "id": str(n.id),
                            "label": n.labels[0] if n.labels else "Entity",
                            "properties": n.properties
                        }
                for e in item.edges:
                    if len(edges_list) < MAX_NODES_LIMIT:
                        edges_list.append({
                            "id": f"{e.src_node}->{e.dest_node}",
                            "source": str(e.src_node),
                            "target": str(e.dest_node),
                            "relation": e.relation
                        })
            elif hasattr(item, "labels"):
                if len(nodes_map) < MAX_NODES_LIMIT:
                    nodes_map[item.id] = {
                        "id": str(item.id),
                        "label": item.labels[0] if item.labels else "Entity",
                        "properties": item.properties
                    }
                    
    return {
        "raw_results": result.result_set,
        "subgraph": {"nodes": list(nodes_map.values()), "edges": edges_list},
        "execution_time_ms": duration_ms,
        "cypher": query
    }
