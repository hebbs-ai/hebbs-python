# TASK-01: HEBBS Skill Issues from OpenClaw E2E Testing

Source: [openclaw-e2e-transcript.md](openclaw-e2e-transcript.md) and [openclaw-e2e-findings.md](openclaw-e2e-findings.md)

---

## Issue 1: Storage reliability (data directory loss)

**Severity:** Critical
**Component:** hebbs-server (storage layer)

The server process kept running after the data directory (`~/.hebbs/data`) was deleted from disk. Reads returned empty results silently. Writes failed with an I/O error only when attempted.

**From transcript:**

```
hebbs-cli forget --entity-id hebbs_e2e_20260312_1148c

Error: Server unavailable at http://localhost:6380. Is hebbs-server running?
(storage error: storage I/O error in write_batch: atomic batch write failed:
IO error: No such file or directory: While open a file for appending:
/Users/paragarora/.hebbs/data/000008.log: No such file or directory)
```

Server was still running (`pgrep` confirmed pid 46022) but `ls ~/.hebbs` returned "No such file or directory."

After recreating the directory and restarting, the server recovered but all previously stored memories were lost.

**What needs fixing:**
- Server should detect data directory loss and fail loudly (health check, not silent empty reads)
- Consider a periodic fsync/directory-exists check in the storage layer
- Skill's "Before every command" section should verify `~/.hebbs/data` exists, not just that the server responds
- Investigate what deleted the directory (external process? test cleanup? macOS tmp purge?)

---

## Issue 2: Causal recall pulls unrelated memories

**Severity:** Medium
**Component:** hebbs engine (causal strategy scoring)

Causal recall seeded from a project memory (caching result) returned an unrelated preference memory in the results.

**From transcript:**

Recall seeded from memory ID7 (caching result) returned:

| # | Content | Causal relevance |
|---|---------|-----------------|
| 1 | The team decided to cache dashboard queries... | 0.828 |
| 2 | Project Aurora launch slipped... | 0.837 |
| 3 | **Parag dislikes em dashes...** | **0.349** |
| 4 | Project Aurora is the codename... | 0.399 |

Row 3 is noise. A preference about punctuation has no causal relationship to a caching decision. The graph traversal appears to fall back to semantic similarity when no explicit edges exist, pulling in topically unrelated memories.

**What needs fixing:**
- Causal strategy should only traverse explicit edges, not blend in semantic similarity as a fallback
- Or: apply a minimum causal relevance threshold to filter noise
- Entity scoping helps as a workaround but should not be required for causal correctness

---

## Issue 3: CLI output parseability for agents

**Severity:** Medium
**Component:** hebbs-cli (output format)

The agent failed twice trying to extract memory IDs from human-readable `remember` output. The `--format json` flag is not available on `remember`, so agents must regex-parse the ULID from free-text output.

**From transcript (attempt 1):**

```
hebbs-cli remember "Project Aurora launch slipped..." --importance 0.84 \
  --entity-id hebbs_e2e_20260312_1148 \
  --edge hebbs_e2e_20260312_1148:related_to:0.8

Error: Invalid memory ID 'hebbs_e2e_20260312_1148'. Expected 26-char ULID or 32-char hex string.
```

The agent used the entity ID as the edge target because it could not cleanly extract the memory ID from the previous `remember` output.

**From transcript (attempt 2):**

```
--edge Project:related_to:0.8

Error: Invalid memory ID 'Project'. Expected 26-char ULID or 32-char hex string.
```

The agent's ID extractor grabbed the word "Project" from the content line instead of the ULID. It took a third attempt with a ULID-specific regex to succeed.

**What needs fixing:**
- Add `--format json` support to `remember` so agents get structured output with the memory ID
- Or: make the human-readable output put the memory ID on a clearly labeled, parseable line (e.g., `id: 01KKGB7WFXXFVBV6C5K72DGBED`)
- The SKILL.md should explicitly warn agents to capture IDs before using `--edge`

---

## Issue 4: Analogical recall is too fuzzy

**Severity:** Low
**Component:** hebbs engine (analogical strategy)

Analogical recall returned structural similarity scores of uniformly 0.5 across all memories, with only embedding similarity varying. It did not meaningfully differentiate structure.

**From transcript:**

Query: "A performance bottleneck was resolved by adding a caching layer."

| Content | Embedding similarity | Structural similarity |
|---------|---------------------|----------------------|
| After enabling query caching... | 0.754 | 0.5 |
| The team decided to cache... | 0.638 | 0.5 |
| Parag prefers actionable summaries... | 0.539 | 0.5 |
| Project Aurora launch slipped... | 0.579 | 0.5 |
| Project Aurora is the codename... | 0.490 | 0.5 |

Every memory got structural_similarity=0.5. The strategy collapsed to a weaker version of similarity recall.

**What needs fixing:**
- Investigate why structural similarity is constant at 0.5 (possibly needs edges or richer context to differentiate)
- Consider documenting analogical as experimental in the skill until structural scoring improves
- May need a minimum memory count or edge density before analogical produces meaningful results

---

## Issue 5: Reflection LLM falls back silently to mock

**Severity:** Medium
**Component:** hebbs-server (reflect pipeline)

The server attempted to use OpenAI for reflect proposal/validation but had no API key configured. It fell back to a mock provider without informing the agent or user via the CLI output.

**From transcript (server log):**

```
WARN hebbs_server::server: failed to create reflect proposal LLM provider, falling back to mock
  error=configuration error: OpenAI provider requires api_key
WARN hebbs_server::server: failed to create reflect validation LLM provider, falling back to mock
  error=configuration error: OpenAI provider requires api_key
```

The agent only discovered this by reading the server log, not from any CLI output or `reflect-prepare` response.

**What needs fixing:**
- `reflect-prepare` response should include a field indicating whether LLM proposal/validation is available or mocked
- The skill should document that reflection works best with an LLM provider configured, and explain how to set one up
- Consider adding a `hebbs-cli health` or `hebbs-cli status` command that reports LLM provider state

---

## Issue 6: Skill loses priority to native memory tools

**Severity:** High
**Component:** hebbs skill (SKILL.md design)

Before the skill was installed, the agent used `memory_search` (a native first-class tool with explicit system prompt policy) instead of HEBBS for a memory recall question. Even after installation, skills are structurally weaker than native tools in the openclaw priority hierarchy.

**From transcript (pre-install behavior):**

User asked: "what did i say about dashes?"

Agent used `memory_search` (native tool) instead of HEBBS. Memory search returned empty results. Agent answered from in-context chat history.

When asked why it did not use HEBBS, the agent explained:

> "I have an explicit higher priority instruction that says: before answering anything about prior work, decisions, dates, people, preferences, or todos, run memory_search on MEMORY.md and memory/*.md. HEBBS exists as a skill, but it is not the mandated recall path in the base instructions."

**What the updated SKILL.md does:**

Added a Trigger section declaring HEBBS as preferred over file memory, and a Priority/fallback chain (insights > recall > file memory > say nothing found).

**What still needs fixing (beyond the skill):**
- Making HEBBS a first-class tool (not just CLI-via-skill) is the highest-impact fix
- Exposing `hebbs_recall`, `hebbs_remember`, `hebbs_insights` as native tools would bypass the skill priority problem entirely
- Short of that: the skill trigger language helps but cannot fully override system-level tool policies

---

## Issue 7: Agent misspells HEBBS as "HEBS" in prose

**Severity:** Low
**Component:** Agent memory contamination (not a HEBBS bug)

Throughout its analysis, the agent wrote "HEBS" instead of "HEBBS" in free-text prose. CLI commands used the correct spelling because they came from the skill instructions.

**From transcript:**

- "but ~/.hebs is gone on disk" (should be ~/.hebbs)
- "HEBS fell back to a mock provider" (should be HEBBS)
- "HEBS hit a real write failure" (should be HEBBS)
- "Use HEBS as the working memory layer" (should be HEBBS)

**Cause:** The previous repo/project was named "hebs". The agent likely had this stored in its file memory or session history, and the shorter spelling bled into its prose output.

**What needs fixing:**
- Not a HEBBS bug. The openclaw user's memory files need cleanup of the old "hebs" spelling.
- The SKILL.md correctly uses "HEBBS" everywhere, so this is purely a memory contamination issue on the agent side.

---

## Priority order for fixes

1. **Storage reliability** (Issue 1) - data loss is unacceptable
2. **Skill priority** (Issue 6) - biggest adoption blocker
3. **CLI output parseability** (Issue 3) - agents fail repeatedly without JSON output on remember
4. **Causal recall noise** (Issue 2) - correctness issue in a core feature
5. **Reflection LLM transparency** (Issue 5) - silent fallback confuses users
6. **Analogical recall fuzziness** (Issue 4) - low priority, can document as experimental
7. **Agent spelling** (Issue 7) - not a HEBBS issue
