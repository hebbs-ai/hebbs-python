'use client';

import { useEffect, useState } from 'react';
import { codeToHtml } from 'shiki';

const TYPESCRIPT_CODE = `import { HebbsClient } from '@hebbs/sdk';

const hebbs = new HebbsClient('localhost:6380');
await hebbs.connect();

// Prime: load everything we know about this prospect
const primed = await hebbs.prime({ entityId: 'acme_corp' });

// Recall: find relevant memories using multiple strategies
const recalled = await hebbs.recall({
  cue: prospectMessage,
  strategies: ['similarity', 'temporal'],
  entityId: 'acme_corp',
});

// Generate response using recalled memories as context
const response = await llm.chat(prospectMessage, {
  context: recalled,
});

// Remember: store what mattered from this exchange
await hebbs.remember({
  content: extractKeyInfo(prospectMessage, response),
  importance: scoreImportance(prospectMessage),
  context: { topic: classify(prospectMessage) },
  entityId: 'acme_corp',
});

// After N conversations, consolidate into knowledge
const insights = await hebbs.reflect({ entityId: 'acme_corp' });
// Insights are now used in future recall() automatically

// When the world changes, update beliefs
await hebbs.revise(outdatedMemory.id, {
  content: 'New competitive info...',
});
// Dependent insights auto-invalidate and re-reflect

// GDPR deletion — one call
await hebbs.forget({ entityId: 'acme_corp' });`;

const PYTHON_CODE = `from hebbs import HebbsClient

hebbs = HebbsClient("localhost:6380")
hebbs.connect()

# Prime: load everything we know about this prospect
primed = hebbs.prime(entity_id="acme_corp")

# Recall: find relevant memories using multiple strategies
recalled = hebbs.recall(
    cue=prospect_message,
    strategies=["similarity", "temporal"],
    entity_id="acme_corp",
)

# Generate response using recalled memories as context
response = llm.chat(prospect_message, context=recalled)

# Remember: store what mattered from this exchange
hebbs.remember(
    content=extract_key_info(prospect_message, response),
    importance=score_importance(prospect_message),
    context={"topic": classify(prospect_message)},
    entity_id="acme_corp",
)

# After N conversations, consolidate into knowledge
insights = hebbs.reflect(entity_id="acme_corp")
# Insights are now used in future recall() automatically

# When the world changes, update beliefs
hebbs.revise(outdated_memory.id, content="New competitive info...")
# Dependent insights auto-invalidate and re-reflect

# GDPR deletion — one call
hebbs.forget(entity_id="acme_corp")`;

export function CodePanel() {
  const [activeTab, setActiveTab] = useState<'typescript' | 'python'>('typescript');
  const [highlightedTs, setHighlightedTs] = useState<string>('');
  const [highlightedPy, setHighlightedPy] = useState<string>('');

  useEffect(() => {
    async function highlight() {
      try {
        const [tsHtml, pyHtml] = await Promise.all([
          codeToHtml(TYPESCRIPT_CODE, {
            lang: 'typescript',
            theme: 'github-dark-default',
          }),
          codeToHtml(PYTHON_CODE, {
            lang: 'python',
            theme: 'github-dark-default',
          }),
        ]);
        setHighlightedTs(tsHtml);
        setHighlightedPy(pyHtml);
      } catch {
        // Fallback: no highlighting
      }
    }
    highlight();
  }, []);

  const code = activeTab === 'typescript' ? TYPESCRIPT_CODE : PYTHON_CODE;
  const highlighted = activeTab === 'typescript' ? highlightedTs : highlightedPy;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex h-10 shrink-0 items-center border-b border-glass-border px-4">
        <span className="text-[11px] font-medium tracking-widest uppercase text-white/40">
          Agent Code
        </span>
        <div className="ml-auto flex gap-1">
          <TabButton
            label="TypeScript"
            active={activeTab === 'typescript'}
            onClick={() => setActiveTab('typescript')}
          />
          <TabButton
            label="Python"
            active={activeTab === 'python'}
            onClick={() => setActiveTab('python')}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 scrollbar-thin">
        {highlighted ? (
          <div
            className="shiki-container text-[13px] leading-relaxed [&_pre]:!bg-transparent [&_code]:!bg-transparent"
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        ) : (
          <pre className="font-mono text-[13px] leading-relaxed text-[#c8ccd4]">
            <code>{code}</code>
          </pre>
        )}
      </div>

      <div className="shrink-0 border-t border-glass-border px-4 py-2">
        <p className="text-[10px] text-white/20">
          This is the exact code pattern powering the conversation on the left.
          {activeTab === 'typescript' ? ' Install: npm i @hebbs/sdk' : ' Install: pip install hebbs'}
        </p>
      </div>
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-2.5 py-1 text-[10px] font-medium transition-all ${
        active ? 'bg-white/10 text-white/70' : 'text-white/30 hover:text-white/50'
      }`}
    >
      {label}
    </button>
  );
}
