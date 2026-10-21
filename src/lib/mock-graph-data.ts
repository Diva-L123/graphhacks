export type NodeType =
  | "Service"
  | "Team"
  | "Person"
  | "SessionMemory"
  | "Incident"
  | "Policy"
  | "Decision"
  | "Vulnerability"
  | "Session"
  | "User"
  | "Fact"
  | "Message"
  | "Entity"
  | "Database"
  | "Gateway";

export interface ChatApiRequest {
  user_id?: string;
  session_id?: string;
  message?: string;
  query?: string;
  sessionId?: string;
  userProfile?: string;
  scenarioId?: string;
}

export interface ChatApiResponse {
  response: string;
  traceability: {
    cypher_query: string;
    execution_time_ms: number;
    subgraph: {
      nodes: Array<{ id: string; label: string; name?: string; properties: Record<string, any> }>;
      edges: Array<{ id: string; source: string; target: string; relation: string }>;
    };
  };
  pipeline: {
    module1_hydration: {
      user_id: string;
      active_facts: string[];
      hydrated_nodes_count: number;
    };
    module2_routing: {
      selected_tool: string;
      intent: string;
      algorithm: string;
    };
    module3_subgraph: {
      nodes_count: number;
      edges_count: number;
      execution_ms: number;
    };
    module4_evolution: {
      persisted_session: string;
      persisted_message_id: string;
      new_facts_count: number;
      conflicts_detected: boolean;
      superseded_edges?: string[];
    };
  };
  trace?: AgentDecisionTrace;
}

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  sessionOrigin?: string; // e.g. "Session 1", "Session 2", "Base Knowledge"
  properties: Record<string, any>;
  x?: number;
  y?: number;
  color?: string;
  isEpisodic?: boolean;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
  sessionOrigin?: string;
  status?: "active" | "superseded" | "deprecated";
  properties?: Record<string, any>;
  isEpisodic?: boolean;
}

export interface ReasoningStep {
  step: number;
  title: string;
  cypherQuery?: string;
  explanation: string;
  activatedNodes: string[];
  activatedEdges: string[];
  status: "verified" | "traversed" | "concluded";
}

export interface ToolInvocation {
  toolName: string;
  purpose: string;
  input: Record<string, any>;
  output: string;
  latencyMs: number;
}

export interface AgentDecisionTrace {
  traceId: string;
  query: string;
  timestamp: string;
  sessionId: string;
  userProfile?: string;
  confidenceScore: number;
  groundingScore: number;
  hallucinationRisk: number;
  falkorLatencyMs: number;
  graphAlgorithm: string;
  cypherQuery: string;
  toolCalls: ToolInvocation[];
  reasoningPath: ReasoningStep[];
  decisionSummary: string;
  recommendations: string[];
  auditableGraphProof: {
    rootEntities: string[];
    intermediateHops: string[];
    terminalConclusion: string;
  };
  retrievedSubgraph: {
    nodesCount: number;
    edgesCount: number;
    entities: string[];
  };
}

export const INITIAL_GRAPH_NODES: GraphNode[] = [
  // Core Services
  {
    id: "srv_auth",
    label: "Auth Gateway v2.4",
    type: "Service",
    sessionOrigin: "Base Architecture",
    properties: { language: "Go", port: 8080, tier: "Tier-0 Mission-Critical", status: "Degraded" },
  },
  {
    id: "srv_payment",
    label: "EU Payment Engine",
    type: "Service",
    sessionOrigin: "Base Architecture",
    properties: { region: "eu-west-1", throughput: "14.2k req/s", compliance: "PCI-DSS Level 1" },
  },
  {
    id: "srv_billing",
    label: "Billing Dispatcher",
    type: "Service",
    sessionOrigin: "Base Architecture",
    properties: { queue: "Kafka:billing-events", retryPolicy: "Exponential Backoff", latency: "3.2ms" },
  },
  {
    id: "db_falkor",
    label: "FalkorDB Cluster",
    type: "Service",
    sessionOrigin: "Base Architecture",
    properties: { version: "v0.4.0", graphs: 4, latency: "0.8ms", engine: "GraphBLAS Linear Algebra" },
  },
  {
    id: "db_redis",
    label: "Session Token Cache",
    type: "Service",
    sessionOrigin: "Base Architecture",
    properties: { replication: "Master-Replica", eviction: "volatile-lru", size: "48GB" },
  },

  // Microservices for Pillar B & Contradiction Demonstration
  {
    id: "srv_auth_v2",
    label: "Auth-V2 Microservice",
    type: "Service",
    sessionOrigin: "Session 1 (Arch)",
    properties: { version: "2.1.0", status: "Active (Candidate for Deprecation)", owner: "Team Alpha" },
  },
  {
    id: "srv_auth_v3",
    label: "Auth-V3 Microservice",
    type: "Service",
    sessionOrigin: "Session 3 (Live)",
    properties: { version: "3.0.0", status: "Production Ready", zeroTrustCertified: true },
  },

  // Teams & Engineering Hierarchy
  {
    id: "team_alpha",
    label: "Team Alpha",
    type: "Team",
    sessionOrigin: "Session 1 (Arch)",
    properties: { scope: "Core Identity & SSO", onCallEscalation: "PagerDuty P1", lead: "Marcus Vance" },
  },
  {
    id: "person_sarah",
    label: "Sarah Connor",
    type: "Person",
    sessionOrigin: "Session 1 (Arch)",
    properties: { role: "VP of Engineering", clearance: "Executive / Level 5", alertChannel: "slack:#incident-exec" },
  },
  {
    id: "person_elena",
    label: "Dr. Elena Rostova",
    type: "Person",
    sessionOrigin: "Base Architecture",
    properties: { role: "Principal Security Architect", team: "SecOps", clearance: "Level 4" },
  },
  {
    id: "person_marcus",
    label: "Marcus Vance",
    type: "Person",
    sessionOrigin: "Base Architecture",
    properties: { role: "Lead Core Engineer", team: "Infra Orchestration", pagerId: "MV-909" },
  },

  // Policies & Governance
  {
    id: "pol_gdpr17",
    label: "GDPR Article 17 (Right to Erasure)",
    type: "Policy",
    sessionOrigin: "Base Compliance",
    properties: { enforcement: "Mandatory", auditInterval: "Daily", jurisdiction: "European Union" },
  },
  {
    id: "pol_zero_trust",
    label: "Zero-Trust Identity Protocol",
    type: "Policy",
    sessionOrigin: "Base Compliance",
    properties: { maxTokenAgeMinutes: 15, mfaRequired: true, fallbackAllowed: false },
  },

  // Persistent Memories (Cross-Session Knowledge Crystallization)
  {
    id: "mem_sess_1",
    label: "Memory: Hotfix Deploy #912",
    type: "SessionMemory",
    sessionOrigin: "Session 1 (3 days ago)",
    properties: {
      recordedBy: "Agent (User Session #1)",
      note: "Marcus bypassed fallback token validation during emergency release to resolve latency spike.",
      validated: true,
    },
  },
  {
    id: "mem_sess_2",
    label: "Memory: Compliance Alert #44",
    type: "SessionMemory",
    sessionOrigin: "Session 2 (Yesterday)",
    properties: {
      recordedBy: "Agent (User Session #2)",
      note: "Elena flagged that bypassing fallback tokens directly violates Zero-Trust Rule #3.",
      pendingAction: "Requires roll-forward patch",
    },
  },
  {
    id: "mem_team_alpha",
    label: "Memory: Ownership of Auth-V2",
    type: "SessionMemory",
    sessionOrigin: "Session 1 (3 days ago)",
    properties: {
      recordedBy: "Agent (User Session #1)",
      statement: "Team Alpha owns microservice Auth-V2 and reports directly to Sarah Connor.",
      groundedInGraph: true,
    },
  },

  // Incidents & Vulnerabilities
  {
    id: "vuln_cve",
    label: "CVE-2026-1049 (Token Desync)",
    type: "Vulnerability",
    sessionOrigin: "Threat Intelligence",
    properties: { severity: "High (CVSS 8.4)", vector: "Network", patchAvailable: true },
  },
  {
    id: "inc_outage",
    label: "Incident #402: EU Auth Timeouts",
    type: "Incident",
    sessionOrigin: "Live Observability",
    properties: { status: "Active Investigation", errorRate: "18.4%", affectedUsers: 14200 },
  },

  // Decisions
  {
    id: "dec_agent_auto",
    label: "Decision: Instant Token Revocation & Rollback",
    type: "Decision",
    sessionOrigin: "Current Agent Session",
    properties: {
      traceId: "TRC-8994-FALKOR-ROOT",
      confidence: "99.4%",
      rationale: "Relational link between Hotfix #912 and Incident #402 confirmed via 3-hop traversal.",
    },
  },

  // Episodic Memory Nodes (Raw Session Histories)
  {
    id: "sess_1",
    label: "Session #1 (Architecture Setup)",
    type: "Session",
    sessionOrigin: "Session 1",
    isEpisodic: true,
    properties: { user: "Marcus Vance", topic: "Microservice Topology & Team Ownership", date: "3 days ago" },
  },
  {
    id: "sess_2",
    label: "Session #2 (Security Audit)",
    type: "Session",
    sessionOrigin: "Session 2",
    isEpisodic: true,
    properties: { user: "Dr. Elena Rostova", topic: "Compliance & Policy Violations", date: "Yesterday" },
  },
  {
    id: "sess_3",
    label: "Session #3 (Live Outage & Ingestion)",
    type: "Session",
    sessionOrigin: "Session 3",
    isEpisodic: true,
    properties: { user: "On-Call Commander", topic: "EU Outage Remediation", date: "Active Now" },
  },

  // First-Class Users (Module 1: Context Hydration)
  {
    id: "user_marcus",
    label: "Marcus Vance",
    type: "User",
    sessionOrigin: "System",
    properties: { id: "user_marcus", name: "Marcus Vance", role: "Lead Core Engineer", email: "marcus@company.internal" },
  },
  {
    id: "user_elena",
    label: "Dr. Elena Rostova",
    type: "User",
    sessionOrigin: "System",
    properties: { id: "user_elena", name: "Dr. Elena Rostova", role: "Principal Security Architect", email: "elena@company.internal" },
  },
  {
    id: "user_judge",
    label: "Hackathon Judge",
    type: "User",
    sessionOrigin: "System",
    properties: { id: "user_judge", name: "Hackathon Judge", role: "Evaluation Lead", permissions: "Full Read/Write" },
  },

  // Persistent Facts (Module 1: Context Hydration & Module 4: Memory Evolution)
  {
    id: "fact_1",
    label: "Fact: Token Validation Bypass",
    type: "Fact",
    sessionOrigin: "Session 1",
    properties: {
      id: "fact_1",
      text: "Marcus bypassed fallback token validation during emergency release to resolve latency spike.",
      status: "ACTIVE",
      timestamp: "3 days ago",
    },
  },
  {
    id: "fact_2",
    label: "Fact: Zero-Trust Violation",
    type: "Fact",
    sessionOrigin: "Session 2",
    properties: {
      id: "fact_2",
      text: "Bypassing fallback tokens directly violates Zero-Trust Rule #3 and requires a roll-forward patch.",
      status: "ACTIVE",
      timestamp: "Yesterday",
    },
  },
  {
    id: "fact_3",
    label: "Fact: Team Alpha Escalation",
    type: "Fact",
    sessionOrigin: "Session 1",
    properties: {
      id: "fact_3",
      text: "Team Alpha owns microservice Auth-V2 and reports directly to Sarah Connor for P1 incidents.",
      status: "ACTIVE",
      timestamp: "3 days ago",
    },
  },
  {
    id: "fact_4",
    label: "Fact: Auth-V3 Zero-Trust Standard",
    type: "Fact",
    sessionOrigin: "Session 3",
    properties: {
      id: "fact_4",
      text: "Auth-V3 is the verified replacement service for Auth-V2 with Zero-Trust compliance.",
      status: "ACTIVE",
      timestamp: "Active Now",
    },
  },
];

export const INITIAL_GRAPH_EDGES: GraphEdge[] = [
  // Service Dependencies
  { id: "e1", source: "srv_payment", target: "srv_auth", relationship: "AUTHENTICATES_VIA", status: "active" },
  { id: "e2", source: "srv_auth", target: "db_redis", relationship: "STORES_TOKENS_IN", status: "active" },
  { id: "e3", source: "srv_auth", target: "db_falkor", relationship: "QUERIES_RELATIONS_FROM", status: "active" },
  { id: "e4", source: "person_marcus", target: "srv_auth", relationship: "MAINTAINS", status: "active" },
  { id: "e5", source: "person_elena", target: "pol_zero_trust", relationship: "AUTHOR_OF", status: "active" },
  { id: "e6", source: "srv_auth", target: "pol_zero_trust", relationship: "GOVERNED_BY", status: "active" },
  { id: "e7", source: "srv_payment", target: "pol_gdpr17", relationship: "COMPLIANT_WITH", status: "active" },

  // Circular Dependency Ring (For Algorithmic Cycle Detection Demo)
  { id: "e_cycle_1", source: "srv_auth", target: "srv_payment", relationship: "DISPATCHES_TO", status: "active" },
  { id: "e_cycle_2", source: "srv_payment", target: "srv_billing", relationship: "ROUTES_TRANSACTION_TO", status: "active" },
  { id: "e_cycle_3", source: "srv_billing", target: "srv_auth", relationship: "VALIDATES_CREDENTIALS_WITH", status: "active" },

  // Pillar B: Team Alpha Ownership & Reporting to Sarah
  { id: "e_alpha_own", source: "team_alpha", target: "srv_auth_v2", relationship: "OWNS", status: "active" },
  { id: "e_alpha_rep", source: "team_alpha", target: "person_sarah", relationship: "REPORTS_TO", status: "active" },
  { id: "e_alpha_mem1", source: "mem_team_alpha", target: "team_alpha", relationship: "RECORDS_OWNERSHIP_OF", status: "active", sessionOrigin: "Session 1" },
  { id: "e_alpha_mem2", source: "mem_team_alpha", target: "srv_auth_v2", relationship: "INVOLVES_SERVICE", status: "active", sessionOrigin: "Session 1" },
  { id: "e_alpha_mem3", source: "mem_team_alpha", target: "person_sarah", relationship: "ESCALATES_TO", status: "active", sessionOrigin: "Session 1" },

  // Cross-Session Persistent Memory Connections
  { id: "e8", source: "mem_sess_1", target: "person_marcus", relationship: "INVOLVES_ENGINEER", sessionOrigin: "Session 1", status: "active" },
  { id: "e9", source: "mem_sess_1", target: "srv_auth", relationship: "MODIFIED_CONFIG", sessionOrigin: "Session 1", status: "active" },
  { id: "e10", source: "mem_sess_2", target: "mem_sess_1", relationship: "CONTRADICTS_ASSUMPTION", sessionOrigin: "Session 2", status: "active" },
  { id: "e11", source: "mem_sess_2", target: "pol_zero_trust", relationship: "FLAGS_NON_COMPLIANCE", sessionOrigin: "Session 2", status: "active" },

  // Incident & Traceability Connections
  { id: "e12", source: "inc_outage", target: "srv_payment", relationship: "IMPACTS", status: "active" },
  { id: "e13", source: "inc_outage", target: "srv_auth", relationship: "ROOT_CAUSE_LOCATED_AT", status: "active" },
  { id: "e14", source: "srv_auth", target: "vuln_cve", relationship: "SUSCEPTIBLE_TO", status: "active" },
  { id: "e15", source: "dec_agent_auto", target: "inc_outage", relationship: "RESOLVES", status: "active" },
  { id: "e16", source: "dec_agent_auto", target: "mem_sess_1", relationship: "LEVERAGES_CONTEXT_FROM", status: "active" },
  { id: "e17", source: "dec_agent_auto", target: "pol_zero_trust", relationship: "RESTORES_COMPLIANCE_WITH", status: "active" },

  // Episodic Memory Ties (Raw Session Nodes -> Facts)
  { id: "ep1", source: "sess_1", target: "mem_sess_1", relationship: "RECORDED_EVENT", isEpisodic: true },
  { id: "ep2", source: "sess_1", target: "mem_team_alpha", relationship: "RECORDED_PREFERENCE", isEpisodic: true },
  { id: "ep3", source: "sess_2", target: "mem_sess_2", relationship: "RECORDED_COMPLIANCE_FLAG", isEpisodic: true },
  { id: "ep4", source: "sess_2", target: "inc_outage", relationship: "INGESTED_INCIDENT", isEpisodic: true },
  { id: "ep5", source: "sess_3", target: "dec_agent_auto", relationship: "EXECUTED_DECISION", isEpisodic: true },

  // User -> Session Hydration (Module 1: (u:User)-[:HAD_SESSION]->(s:Session))
  { id: "e_usr_1", source: "user_marcus", target: "sess_1", relationship: "HAD_SESSION", status: "active" },
  { id: "e_usr_2", source: "user_elena", target: "sess_2", relationship: "HAD_SESSION", status: "active" },
  { id: "e_usr_3", source: "user_judge", target: "sess_3", relationship: "HAD_SESSION", status: "active" },

  // Session -> Fact Recording (Module 1: (s:Session)-[:RECORDED_FACT]->(f:Fact))
  { id: "e_fct_1", source: "sess_1", target: "fact_1", relationship: "RECORDED_FACT", status: "active" },
  { id: "e_fct_2", source: "sess_1", target: "fact_3", relationship: "RECORDED_FACT", status: "active" },
  { id: "e_fct_3", source: "sess_2", target: "fact_2", relationship: "RECORDED_FACT", status: "active" },
  { id: "e_fct_4", source: "sess_3", target: "fact_4", relationship: "RECORDED_FACT", status: "active" },

  // Canonical Microservice Graph Dependencies (Module 2: [:DEPENDS_ON|CALLS])
  { id: "e_dep_1", source: "srv_payment", target: "srv_auth", relationship: "DEPENDS_ON", status: "active" },
  { id: "e_dep_2", source: "srv_auth", target: "db_redis", relationship: "DEPENDS_ON", status: "active" },
  { id: "e_dep_3", source: "srv_billing", target: "srv_auth", relationship: "DEPENDS_ON", status: "active" },
  { id: "e_call_1", source: "srv_payment", target: "srv_auth", relationship: "CALLS", status: "active" },
];

export const DEMO_PRESET_SCENARIOS: {
  id: string;
  title: string;
  category: "Traceability" | "Persistent Memory" | "Complex Relationships";
  query: string;
  badge: string;
  algorithmName: string;
  trace: AgentDecisionTrace;
}[] = [
  {
    id: "scenario-1",
    title: "Trace Root Cause of API Outage",
    category: "Traceability",
    query: "Why is the EU Payment Gateway failing, and how does Marcus's previous deployment tie into our Zero-Trust policy?",
    badge: "Blast-Radius BFS Traversal",
    algorithmName: "FalkorDB BFS Blast-Radius Traversal (GraphBLAS)",
    trace: {
      traceId: "TRC-8994-FALKOR-ROOT",
      query: "Why is the EU Payment Gateway failing, and how does Marcus's previous deployment tie into our Zero-Trust policy?",
      timestamp: "Just now",
      sessionId: "sess_3",
      userProfile: "DevOps Incident Commander",
      confidenceScore: 0.994,
      groundingScore: 0.994,
      hallucinationRisk: 0.001,
      falkorLatencyMs: 1.12,
      graphAlgorithm: "FalkorDB BFS Blast-Radius Traversal & Relational Path Ingestion",
      cypherQuery: "MATCH (i:Incident {id: 'inc_outage'})-[:IMPACTS]->(p:Service)-[:AUTHENTICATES_VIA]->(a:Service)-[:SUSCEPTIBLE_TO]->(v:Vulnerability) MATCH (a)<-[:MODIFIED_CONFIG]-(m:SessionMemory)-[:INVOLVES_ENGINEER]->(e:Person) RETURN i, p, a, v, m, e",
      toolCalls: [
        {
          toolName: "falkordb_execute_cypher",
          purpose: "Traverse 3-hop dependency chain from Incident to Root Vulnerability",
          input: { graph: "production_topology", startNode: "inc_outage", maxDepth: 4 },
          output: "Returned 6 nodes, 5 edges in 0.8ms. Path verified.",
          latencyMs: 0.8,
        },
        {
          toolName: "falkordb_memory_recall",
          purpose: "Correlate previous session hotfix deploy to current degraded service state",
          input: { memoryLabel: "Hotfix Deploy #912", target: "srv_auth" },
          output: "Recalled Session 1 commit by Marcus Vance bypassing fallback tokens.",
          latencyMs: 0.32,
        },
      ],
      decisionSummary:
        "Root cause definitively isolated in 1.12ms: EU Payment Engine timeouts propagate upstream to Auth Gateway v2.4. Cross-session persistent memory recalls that Marcus bypassed fallback token validation 3 days ago in Session 1 (#912). This opened vulnerability to CVE-2026-1049 (Token Desync), directly violating Zero-Trust Rule #3 enforced by Dr. Elena in Session 2.",
      recommendations: [
        "Execute automated rollback of Auth Gateway token configuration to sha256:d8a2.",
        "Restore Zero-Trust fallback parameter in FalkorDB policy node.",
        "Notify Elena Rostova and Marcus Vance with cryptographic audit trace TRC-8994.",
      ],
      auditableGraphProof: {
        rootEntities: ["inc_outage", "srv_payment"],
        intermediateHops: ["srv_auth", "mem_sess_1", "vuln_cve", "mem_sess_2"],
        terminalConclusion: "dec_agent_auto",
      },
      retrievedSubgraph: {
        nodesCount: 7,
        edgesCount: 8,
        entities: ["inc_outage", "srv_payment", "srv_auth", "mem_sess_1", "vuln_cve", "pol_zero_trust", "dec_agent_auto"],
      },
      reasoningPath: [
        {
          step: 1,
          title: "Incident Ingestion & Service Blast Radius",
          cypherQuery: "MATCH (i:Incident {id: 'inc_outage'})-[:IMPACTS]->(p:Service) RETURN i, p",
          explanation: "Identified active incident #402 impacting EU Payment Gateway with 18.4% error rate across 14,200 users.",
          activatedNodes: ["inc_outage", "srv_payment"],
          activatedEdges: ["e12"],
          status: "verified",
        },
        {
          step: 2,
          title: "Upstream Dependency Hop",
          cypherQuery: "MATCH (p:Service)-[:AUTHENTICATES_VIA]->(a:Service) WHERE p.id = 'srv_payment' RETURN a",
          explanation: "Traversed dependency graph to isolate Auth Gateway v2.4 as upstream mission-critical identity provider.",
          activatedNodes: ["srv_auth"],
          activatedEdges: ["e1"],
          status: "traversed",
        },
        {
          step: 3,
          title: "Cross-Session Memory Recall (Session 1)",
          cypherQuery: "MATCH (a:Service)<-[:MODIFIED_CONFIG]-(m:SessionMemory)-[:INVOLVES_ENGINEER]->(eng:Person) RETURN m, eng",
          explanation: "Retrieved persistent memory node from Session 1: Marcus Vance bypassed fallback token validation during hotfix #912.",
          activatedNodes: ["mem_sess_1", "person_marcus"],
          activatedEdges: ["e8", "e9"],
          status: "traversed",
        },
        {
          step: 4,
          title: "Policy & Vulnerability Correlation (Session 2)",
          cypherQuery: "MATCH (a:Service)-[:GOVERNED_BY]->(pol:Policy), (a)-[:SUSCEPTIBLE_TO]->(v:Vulnerability) RETURN pol, v",
          explanation: "Correlated token bypass with CVE-2026-1049 and confirmed direct violation of Zero-Trust Rule #3 flagged by Dr. Elena in Session 2.",
          activatedNodes: ["pol_zero_trust", "vuln_cve", "mem_sess_2"],
          activatedEdges: ["e6", "e10", "e11", "e14"],
          status: "traversed",
        },
        {
          step: 5,
          title: "Remediation Decision Node Synthesis",
          cypherQuery: "CREATE (d:Decision {action: 'ROLLBACK', confidence: 0.994})-[:RESOLVES]->(i:Incident) RETURN d",
          explanation: "Generated auditable remediation decision node with 99.4% confidence and complete cryptographic path proof.",
          activatedNodes: ["dec_agent_auto"],
          activatedEdges: ["e15", "e16", "e17"],
          status: "concluded",
        },
      ],
    },
  },
  {
    id: "scenario-2",
    title: "Recall User Constraint from Previous Session",
    category: "Persistent Memory",
    query: "Who should be alerted if Auth-V2 fails, based on constraints defined in Session 1?",
    badge: "Cross-Session Recall",
    algorithmName: "FalkorDB Multi-Hop Relational Traversal",
    trace: {
      traceId: "TRC-7712-RECALL-SARAH",
      query: "Who should be alerted if Auth-V2 fails, based on constraints defined in Session 1?",
      timestamp: "Just now",
      sessionId: "sess_2",
      userProfile: "Security & Operations Lead",
      confidenceScore: 0.998,
      groundingScore: 0.998,
      hallucinationRisk: 0.0,
      falkorLatencyMs: 0.88,
      graphAlgorithm: "FalkorDB Multi-Hop Subgraph Traversal",
      cypherQuery: "MATCH (s:Service {id: 'srv_auth_v2'})<-[:OWNS]-(t:Team)-[:REPORTS_TO]->(p:Person) RETURN t.label, p.label, p.properties",
      toolCalls: [
        {
          toolName: "falkordb_cross_session_fetch",
          purpose: "Query persistent memory node 'Ownership of Auth-V2' registered in Session 1",
          input: { sessionId: "sess_1", targetEntity: "srv_auth_v2" },
          output: "Matched fact: Team Alpha owns Auth-V2 and reports to Sarah Connor.",
          latencyMs: 0.52,
        },
      ],
      decisionSummary:
        "Based on persistent memory crystallized during Session 1, microservice Auth-V2 is owned by Team Alpha, which reports directly to Sarah Connor (VP of Engineering). If Auth-V2 fails, Sarah Connor must be alerted immediately via executive Slack channel #incident-exec and PagerDuty P1 escalation.",
      recommendations: [
        "Dispatch P1 automated notification to Sarah Connor (channel #incident-exec).",
        "Page Team Alpha on-call rotation lead Marcus Vance.",
        "Log incident association edge from srv_auth_v2 to team_alpha in FalkorDB.",
      ],
      auditableGraphProof: {
        rootEntities: ["srv_auth_v2"],
        intermediateHops: ["mem_team_alpha", "team_alpha"],
        terminalConclusion: "person_sarah",
      },
      retrievedSubgraph: {
        nodesCount: 4,
        edgesCount: 4,
        entities: ["srv_auth_v2", "mem_team_alpha", "team_alpha", "person_sarah"],
      },
      reasoningPath: [
        {
          step: 1,
          title: "Persistent Fact Ingestion from Session 1",
          cypherQuery: "MATCH (m:SessionMemory {id: 'mem_team_alpha'})-[:INVOLVES_SERVICE]->(s:Service) RETURN m, s",
          explanation: "Retrieved crystallized memory node from Session 1 establishing ownership constraint for Auth-V2.",
          activatedNodes: ["mem_team_alpha", "srv_auth_v2"],
          activatedEdges: ["e_alpha_mem2"],
          status: "verified",
        },
        {
          step: 2,
          title: "Team Ownership Resolution",
          cypherQuery: "MATCH (t:Team)-[:OWNS]->(s:Service {id: 'srv_auth_v2'}) RETURN t",
          explanation: "Traversed OWNS edge to Team Alpha, responsible for Core Identity & SSO infrastructure.",
          activatedNodes: ["team_alpha"],
          activatedEdges: ["e_alpha_own"],
          status: "traversed",
        },
        {
          step: 3,
          title: "Organizational Escalation Traversal",
          cypherQuery: "MATCH (t:Team {id: 'team_alpha'})-[:REPORTS_TO]->(p:Person) RETURN p",
          explanation: "Resolved reporting hierarchy: Team Alpha reports directly to Sarah Connor (VP of Engineering).",
          activatedNodes: ["person_sarah"],
          activatedEdges: ["e_alpha_rep"],
          status: "concluded",
        },
      ],
    },
  },
  {
    id: "scenario-3",
    title: "Find Circular Dependency",
    category: "Complex Relationships",
    query: "Find circular dependencies across our microservices topology that could cause deadlock.",
    badge: "Cycle Detection (Tarjan)",
    algorithmName: "FalkorDB Cycle Detection & Strongly Connected Components",
    trace: {
      traceId: "TRC-3309-CYCLE-DETECT",
      query: "Find circular dependencies across our microservices topology that could cause deadlock.",
      timestamp: "Just now",
      sessionId: "sess_3",
      userProfile: "Architecture Reviewer",
      confidenceScore: 1.0,
      groundingScore: 1.0,
      hallucinationRisk: 0.0,
      falkorLatencyMs: 1.34,
      graphAlgorithm: "FalkorDB Cycle Detection / Strongly Connected Components (Tarjan's Algo)",
      cypherQuery: "MATCH path = (s:Service)-[:DISPATCHES_TO|ROUTES_TRANSACTION_TO|VALIDATES_CREDENTIALS_WITH*2..6]->(s) RETURN [node in nodes(path) | node.label] AS cycleLoop, length(path) AS hopCount",
      toolCalls: [
        {
          toolName: "falkordb_graphblas_cycle_find",
          purpose: "Run adjacency matrix power iteration to detect closed directed cycles",
          input: { graph: "microservices", minHops: 2, maxHops: 6 },
          output: "Cycle discovered: srv_auth -> srv_payment -> srv_billing -> srv_auth (length 3).",
          latencyMs: 1.15,
        },
      ],
      decisionSummary:
        "FalkorDB graph cycle detection detected a dangerous circular dependency ring: Auth Gateway v2.4 -> EU Payment Engine -> Billing Dispatcher -> Auth Gateway v2.4 (3 hops). In synchronous cascading failures, this topological loop creates deadlock during retry storms.",
      recommendations: [
        "Decouple Billing Dispatcher from synchronous Auth Gateway validation via asymmetric JWT verification.",
        "Introduce asynchronous message buffering between EU Payment and Billing Dispatcher.",
        "Store circular dependency alert node in FalkorDB to flag CI/CD regressions.",
      ],
      auditableGraphProof: {
        rootEntities: ["srv_auth"],
        intermediateHops: ["srv_payment", "srv_billing"],
        terminalConclusion: "srv_auth",
      },
      retrievedSubgraph: {
        nodesCount: 3,
        edgesCount: 3,
        entities: ["srv_auth", "srv_payment", "srv_billing"],
      },
      reasoningPath: [
        {
          step: 1,
          title: "Adjacency Matrix Multiplication in GraphBLAS",
          cypherQuery: "MATCH (a:Service)-[:DISPATCHES_TO]->(b:Service) RETURN a, b",
          explanation: "Analyzed inter-service synchronous calls from Auth Gateway v2.4 into EU Payment Engine.",
          activatedNodes: ["srv_auth", "srv_payment"],
          activatedEdges: ["e_cycle_1"],
          status: "verified",
        },
        {
          step: 2,
          title: "Transaction Routing Hop",
          cypherQuery: "MATCH (p:Service)-[:ROUTES_TRANSACTION_TO]->(bill:Service) RETURN p, bill",
          explanation: "Followed downstream transaction dispatch to Billing Dispatcher worker queue.",
          activatedNodes: ["srv_billing"],
          activatedEdges: ["e_cycle_2"],
          status: "traversed",
        },
        {
          step: 3,
          title: "Closed Loop Discovery (Cycle Closure)",
          cypherQuery: "MATCH (bill:Service)-[:VALIDATES_CREDENTIALS_WITH]->(a:Service {id: 'srv_auth'}) RETURN bill, a",
          explanation: "Detected reverse credential validation edge creating closed cycle back to Auth Gateway v2.4.",
          activatedNodes: ["srv_auth"],
          activatedEdges: ["e_cycle_3"],
          status: "concluded",
        },
      ],
    },
  },
  {
    id: "scenario-4",
    title: "Test Contradiction & Deprecation Update",
    category: "Persistent Memory",
    query: "Actually, Auth-V2 is now deprecated and replaced by Auth-V3. Update graph relationships and supersede old ownership.",
    badge: "Edge Supersession",
    algorithmName: "FalkorDB Dynamic Subgraph Mutation & Edge Supersession",
    trace: {
      traceId: "TRC-9901-SUPERSEDE-V3",
      query: "Actually, Auth-V2 is now deprecated and replaced by Auth-V3. Update graph relationships and supersede old ownership.",
      timestamp: "Just now",
      sessionId: "sess_3",
      userProfile: "Lead Core Engineer",
      confidenceScore: 0.996,
      groundingScore: 0.996,
      hallucinationRisk: 0.0,
      falkorLatencyMs: 0.95,
      graphAlgorithm: "FalkorDB Subgraph Mutation & Temporal Lineage Preservation",
      cypherQuery: "MATCH (t:Team {id: 'team_alpha'})-[r:OWNS]->(old:Service {id: 'srv_auth_v2'}) SET r.status = 'superseded', old.status = 'Deprecated' CREATE (old)-[:SUPERSEDED_BY {timestamp: timestamp()}]->(new:Service {id: 'srv_auth_v3'}), (t)-[:OWNS {status: 'active'}]->(new) RETURN old, new",
      toolCalls: [
        {
          toolName: "falkordb_mutate_edge_status",
          purpose: "Mark old OWNS edge as superseded and establish new active relationship to Auth-V3",
          input: { edgeId: "e_alpha_own", newTarget: "srv_auth_v3", supersedeType: "SUPERSEDED_BY" },
          output: "Edge e_alpha_own marked superseded. Created edge e_alpha_own_v3 and e_v2_v3_superseded.",
          latencyMs: 0.61,
        },
      ],
      decisionSummary:
        "Contradiction successfully resolved in FalkorDB: Microservice Auth-V2 is marked 'Deprecated / Superseded'. The prior ownership edge from Team Alpha to Auth-V2 is preserved with status 'superseded' for full audit compliance, and a new active OWNS edge has been created linking Team Alpha to Auth-V3 alongside a SUPERSEDED_BY lineage edge.",
      recommendations: [
        "Migrate incoming EU Payment traffic routing from Auth-V2 to Auth-V3.",
        "Retain superseded edge history in FalkorDB for SOC2 change-management audit.",
        "Notify Sarah Connor that Team Alpha now owns Auth-V3.",
      ],
      auditableGraphProof: {
        rootEntities: ["team_alpha", "srv_auth_v2"],
        intermediateHops: ["srv_auth_v3"],
        terminalConclusion: "srv_auth_v3",
      },
      retrievedSubgraph: {
        nodesCount: 3,
        edgesCount: 3,
        entities: ["team_alpha", "srv_auth_v2", "srv_auth_v3"],
      },
      reasoningPath: [
        {
          step: 1,
          title: "Detecting Fact Contradiction",
          cypherQuery: "MATCH (t:Team {id: 'team_alpha'})-[r:OWNS]->(old:Service {id: 'srv_auth_v2'}) RETURN t, r, old",
          explanation: "Identified existing active fact: Team Alpha owns Auth-V2. New user statement contradicts current state.",
          activatedNodes: ["team_alpha", "srv_auth_v2"],
          activatedEdges: ["e_alpha_own"],
          status: "verified",
        },
        {
          step: 2,
          title: "Non-Destructive Edge Supersession",
          cypherQuery: "SET r.status = 'superseded', old.status = 'Deprecated' RETURN r",
          explanation: "Instead of deleting history, FalkorDB marks old relationship as 'superseded' to preserve temporal audit trail.",
          activatedNodes: ["srv_auth_v2"],
          activatedEdges: ["e_alpha_own"],
          status: "traversed",
        },
        {
          step: 3,
          title: "Establishing New Relational Lineage",
          cypherQuery: "CREATE (old)-[:SUPERSEDED_BY]->(new:Service {id: 'srv_auth_v3'}), (t)-[:OWNS {status: 'active'}]->(new) RETURN new",
          explanation: "Formed active OWNS link from Team Alpha to Auth-V3, linked by explicit SUPERSEDED_BY edge.",
          activatedNodes: ["srv_auth_v3"],
          activatedEdges: ["e_v2_v3_superseded", "e_alpha_own_v3"],
          status: "concluded",
        },
      ],
    },
  },
];
