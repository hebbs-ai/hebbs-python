# HEBBS Skill for Claude

Teaches Claude how to use [HEBBS](https://hebbs.dev) — a local-first cognitive memory engine that stores, indexes, and retrieves knowledge.

## Install the skill

### OpenClaw

```bash
git clone https://github.com/hebbs-ai/hebbs-skill.git /tmp/hebbs-skill && cp -r /tmp/hebbs-skill/hebbs ~/.openclaw/skills/hebbs && rm -rf /tmp/hebbs-skill
```

Restart your OpenClaw session to pick up the skill.

### Claude Code

```bash
git clone https://github.com/hebbs-ai/hebbs-skill.git /tmp/hebbs-skill && cp -r /tmp/hebbs-skill/hebbs ~/.claude/skills/hebbs && rm -rf /tmp/hebbs-skill
```

### Claude.ai

1. Download this repo as a ZIP
2. Extract it, then zip just the `hebbs/` folder
3. Go to Settings > Capabilities > Skills > Upload the ZIP

## Install HEBBS

The skill requires `hebbs-server` and `hebbs-cli` binaries.

**macOS (Homebrew):**

```bash
brew install hebbs-ai/tap/hebbs
```

**Any platform (Linux, macOS):**

```bash
curl -sSf https://hebbs.ai/install | sh
```

## Start the server

```bash
HEBBS_AUTH_ENABLED=false hebbs-server --data-dir ~/.hebbs/data
```

To run in the background:

```bash
HEBBS_AUTH_ENABLED=false nohup hebbs-server --data-dir ~/.hebbs/data > /tmp/hebbs-server.log 2>&1 &
```

Data is stored in `~/.hebbs/data`. The server listens on gRPC port 6380 and HTTP port 6381.

## Verify

```bash
hebbs-cli recall "test" --format json
```

## Links

- [HEBBS](https://hebbs.dev)
- [HEBBS GitHub](https://github.com/hebbs-ai/hebbs)
- [Homebrew Tap](https://github.com/hebbs-ai/homebrew-tap)
