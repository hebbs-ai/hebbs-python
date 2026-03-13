# API Ergonomics Report

Friction points discovered during Phase 14 reference application development.

---

## Missing convenience methods

### [MEDIUM] No shorthand for similarity recall

Every similarity recall requires constructing the full call: `hebbs.recall(cue=text, strategy='similarity', top_k=10, entity_id=eid)`. A shorthand like `hebbs.recall_similar(text, top_k=10)` would cover 80% of use cases.

**Suggestion:** Add `HEBBS.recall_similar(cue, top_k=10, entity_id=None)` convenience method.

### [LOW] No batch remember()

Ingesting 50 call summaries requires 50 individual `remember()` calls. A batch API would reduce overhead for bulk ingestion scenarios.

**Suggestion:** Add `HEBBS.remember_batch(items: list[dict]) -> list[Memory]`.

### [LOW] No way to get subscribe stats

The `SubscribeStream` wrapper doesn't expose the underlying stats (`chunks_processed`, `memories_pushed`, `bloom_rejections`). This makes it hard to debug subscribe behavior.

**Suggestion:** Add `SubscribeStream.stats() -> dict` method wrapping the native stats.

## Awkward type conversions

### [MEDIUM] RecallStrategy accepts string or enum inconsistently

`recall(strategy='similarity')` and `recall(strategy=RecallStrategy.SIMILARITY)` both work, but the string values are not documented in the type hints. Users discover valid strings by reading source code.

**Suggestion:** Document valid string values in the docstring. Consider a `Literal` type hint.

## Unhelpful error messages

### [MEDIUM] Generic InvalidInputError for multiple failure modes

When `recall()` fails due to missing `entity_id` for temporal strategy, the error says "invalid input" without specifying which parameter is wrong or what strategy requires it.

**Suggestion:** Include the strategy name and the missing parameter in the error message.

## Missing features

### [HIGH] No custom embedder in embedded mode

`HEBBS.open()` only supports mock or ONNX embedder. There is no way to pass a custom embedder (e.g., OpenAI embeddings) through the Python API in embedded mode. This limits embedding provider comparison to mock vs ONNX.

**Suggestion:** Add an embedder parameter to `HEBBS.open()` or support a callback-based embedder that delegates to Python-side embedding code.

### [HIGH] No LLM provider configuration in embedded mode

The reflect pipeline in embedded mode uses the default (mock) LLM provider. There is no API to configure OpenAI/Anthropic/Ollama as the reflect LLM in embedded mode. This means `reflect()` in the demo produces mock insights, not real LLM-generated ones.

**Suggestion:** Add `llm_provider` parameter to `HEBBS.open()` or a `set_llm_provider()` method, or allow configuring LLM via environment variables.

### [MEDIUM] No way to list all memories for an entity

There's no `hebbs.list(entity_id=X)` method. To see all memories for an entity, you must use `recall()` with a broad cue, which is imprecise.

**Suggestion:** Add `HEBBS.list(entity_id=None, limit=100) -> list[Memory]`.

## Performance surprises

### [LOW] First remember() with ONNX embedder is slow (model download)

The first `remember()` call with `use_mock_embedder=False` can take 5-30 seconds as it downloads the ONNX model. There is no progress indicator or warning.

**Suggestion:** Add a `warmup()` method or print a message during model download.

## Documentation gaps

### [MEDIUM] Unclear which context fields are meaningful

The `context` parameter accepts any dict, but it's unclear which keys HEBBS uses internally (e.g., for analogical recall's structural similarity). Users don't know whether their context keys affect recall quality.

**Suggestion:** Document recommended context keys and explain how they affect each recall strategy.

---

## Summary

| Severity | Count |
|----------|-------|
| High | 2 |
| Medium | 4 |
| Low | 4 |
| **Total** | **10** |
