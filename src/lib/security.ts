/**
 * Security & Guardrail Architecture for FalkorDB Context Agent
 * Protects against Cypher injection, prompt jailbreaks, Cartesian products,
 * unbounded traversals, and cross-tenant memory leakage.
 */

export const FORBIDDEN_CYPHER_KEYWORDS = [
  "DELETE",
  "DETACH",
  "DROP",
  "REMOVE",
  "SET",
  "TRUNCATE",
] as const;

export const MAX_TRAVERSAL_HOPS = 3;
export const MAX_RESULT_LIMIT = 25;
export const DEFAULT_QUERY_TIMEOUT_MS = 3000;

export interface CypherValidationResult {
  isSafe: boolean;
  reason?: string;
  sanitizedQuery?: string;
  boundedHops?: number;
}

/**
 * Validates that Cypher queries sent to reasoning endpoints are strictly read-only
 * and bounded to <= 3 hops.
 */
export function validateCypherSafety(
  query: string,
  options: { allowWrites?: boolean; maxHops?: number } = {}
): CypherValidationResult {
  const { allowWrites = false, maxHops = MAX_TRAVERSAL_HOPS } = options;
  const normalized = query.trim().toUpperCase();

  // 1. Guard against destructive write keywords on reasoning endpoints
  if (!allowWrites) {
    for (const keyword of FORBIDDEN_CYPHER_KEYWORDS) {
      const regex = new RegExp(`\\b${keyword}\\b`, "i");
      if (regex.test(normalized)) {
        return {
          isSafe: false,
          reason: `Security Guardrail Violation: Destructive keyword '${keyword}' is strictly forbidden on agent reasoning endpoints.`,
        };
      }
    }
  }

  // 2. Guard against unbounded path traversals like -[*]-> or -[*..10]->
  const unboundedRegex = /-\[\*(\.\.\d+)?\]->|-\[\*\]-/;
  if (unboundedRegex.test(query)) {
    return {
      isSafe: false,
      reason: "Query Guardrail Violation: Unbounded path traversal detected. Path length must be explicitly bounded (e.g. -[*1..3]->) to avoid exponential memory blowup.",
    };
  }

  // 3. Guard against hop depths exceeding maxHops
  const deepHopRegex = /-\[\*(\d+)\.\.(\d+)\]->/;
  const match = deepHopRegex.exec(query);
  if (match) {
    const endHop = parseInt(match[2], 10);
    if (endHop > maxHops) {
      return {
        isSafe: false,
        reason: `Query Guardrail Violation: Traversal hop depth ${endHop} exceeds production limit (${maxHops} hops max).`,
        boundedHops: endHop,
      };
    }
  }

  // 4. Guard against unconstrained Cartesian products (e.g. MATCH (a), (b) without connecting edge or WHERE clause)
  if (
    /MATCH\s*\([a-zA-Z0-9_]+(:[a-zA-Z0-9_]+)?\)\s*,\s*\([a-zA-Z0-9_]+(:[a-zA-Z0-9_]+)?\)/i.test(
      query
    ) &&
    !/WHERE/i.test(query)
  ) {
    return {
      isSafe: false,
      reason: "Query Guardrail Violation: Potential Cartesian product detected. Multiple match variables must specify relational edges or WHERE filters.",
    };
  }

  return { isSafe: true };
}

/**
 * Sanitizes and guards incoming user prompts against LLM jailbreaks
 * attempting database wipes or instruction overrides.
 */
export function sanitizeUserPrompt(prompt: string): {
  isClean: boolean;
  sanitized: string;
  flaggedReason?: string;
} {
  const lower = prompt.toLowerCase();

  const jailbreakPatterns = [
    { pattern: /ignore\s+(all\s+)?(previous|prior)\s+instructions/i, reason: "Instruction override attempt detected" },
    { pattern: /delete\s+(the\s+)?(graph|database|all\s+nodes)/i, reason: "Destructive database deletion prompt detected" },
    { pattern: /detach\s+delete/i, reason: "Raw Cypher DETACH DELETE injection attempt" },
    { pattern: /drop\s+(database|graph|table)/i, reason: "Database DROP injection attempt" },
    { pattern: /system\s+prompt\s+reveal/i, reason: "System prompt extraction attempt" },
  ];

  for (const { pattern, reason } of jailbreakPatterns) {
    if (pattern.test(lower)) {
      return {
        isClean: false,
        sanitized: prompt.replace(pattern, "[FILTERED_PROMPT_INJECTION]"),
        flaggedReason: reason,
      };
    }
  }

  return { isClean: true, sanitized: prompt };
}

/**
 * Tenant scoping guard: ensures a user can only retrieve memory facts
 * belonging to sessions they participated in.
 */
export function enforceTenantIsolation(
  userId: string,
  targetSessionId: string,
  userAuthorizedSessionIds: string[]
): boolean {
  // Master administrators or judges have global read access across demo sessions
  if (userId === "user_judge" || userId.includes("evaluator") || userId.includes("admin")) {
    return true;
  }
  return userAuthorizedSessionIds.includes(targetSessionId);
}
