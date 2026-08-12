/**
 * 📚 KNOWLEDGE RETRIEVER MODULE (server/ai/retriever.js)
 * Ingests Markdown files from server/knowledge/ and performs semantic context scoring.
 */

import fs from 'fs';
import path from 'path';

const KNOWLEDGE_DIR = path.join(process.cwd(), 'server', 'knowledge');
let knowledgeChunks = [];

export function loadKnowledgeBase() {
  knowledgeChunks = [];
  try {
    if (!fs.existsSync(KNOWLEDGE_DIR)) {
      console.warn(`[Knowledge Retriever] Directory ${KNOWLEDGE_DIR} not found.`);
      return;
    }

    const files = fs.readdirSync(KNOWLEDGE_DIR);
    files.forEach(file => {
      if (file.endsWith('.md')) {
        const filePath = path.join(KNOWLEDGE_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        // Chunking by double newline / section headers
        const sections = content.split(/\n(?=# |\n)/).filter(Boolean);
        sections.forEach((sec, idx) => {
          knowledgeChunks.push({
            id: `${file}_sec_${idx}`,
            source: file,
            content: sec.trim()
          });
        });
      }
    });

    console.log(`[Knowledge Retriever] Loaded ${knowledgeChunks.length} knowledge chunks from ${files.length} markdown files.`);
  } catch (err) {
    console.warn('[Knowledge Retriever Error]:', err.message);
  }
}

export function retrieveRelevantContext(queryText, topK = 3) {
  if (knowledgeChunks.length === 0) {
    loadKnowledgeBase();
  }

  const qTokens = (queryText || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);

  const scored = knowledgeChunks.map(chunk => {
    let score = 0;
    const contentLower = chunk.content.toLowerCase();

    qTokens.forEach(token => {
      if (token.length < 2) return;
      if (contentLower.includes(token)) {
        score += 2;
      }
    });

    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const topChunks = scored.slice(0, topK).filter(s => s.score > 0).map(s => s.chunk);

  if (topChunks.length === 0 && knowledgeChunks.length > 0) {
    return knowledgeChunks.slice(0, 2);
  }

  return topChunks;
}

// Initial Ingestion
loadKnowledgeBase();
