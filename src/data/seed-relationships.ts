import { RelationshipNode, RelationshipEdge } from '../types';

export const SEED_GRAPH_NODES: RelationshipNode[] = [
  { id: 'react', label: 'React', type: 'technology', category: 'Frontend', importance: 95 },
  { id: 'nextjs', label: 'Next.js', type: 'technology', category: 'Frameworks', importance: 96 },
  { id: 'typescript', label: 'TypeScript', type: 'technology', category: 'TypeScript', importance: 92 },
  { id: 'rust', label: 'Rust', type: 'technology', category: 'Rust', importance: 90 },
  { id: 'gemini', label: 'Google Gemini', type: 'technology', category: 'AI', importance: 99 },
  { id: 'claude-anthropic', label: 'Claude & Anthropic', type: 'technology', category: 'AI', importance: 97 },
  { id: 'ai-agents', label: 'AI Agent Architecture', type: 'technology', category: 'AI Agents', importance: 98 },
  { id: 'python', label: 'Python', type: 'technology', category: 'Python', importance: 91 },
  { id: 'nodejs', label: 'Node.js', type: 'technology', category: 'Backend', importance: 88 },
  { id: 'bun', label: 'Bun', type: 'technology', category: 'DevTools', importance: 86 },
  { id: 'postgresql', label: 'PostgreSQL', type: 'technology', category: 'Databases', importance: 93 },
  { id: 'docker', label: 'Docker & Containers', type: 'technology', category: 'DevOps', importance: 84 },
  // Organizations
  { id: 'org-meta', label: 'Meta', type: 'organization', importance: 85 },
  { id: 'org-vercel', label: 'Vercel', type: 'organization', importance: 88 },
  { id: 'org-google', label: 'Google / DeepMind', type: 'organization', importance: 95 },
  { id: 'org-anthropic', label: 'Anthropic', type: 'organization', importance: 92 },
  { id: 'org-microsoft', label: 'Microsoft', type: 'organization', importance: 94 },
  { id: 'org-openjs', label: 'OpenJS Foundation', type: 'organization', importance: 80 },
];

export const SEED_GRAPH_EDGES: RelationshipEdge[] = [
  { id: 'e1', source: 'nextjs', target: 'react', label: 'depends on', type: 'depends_on', confidence: 0.99 },
  { id: 'e2', source: 'nextjs', target: 'rust', label: 'uses (Turbopack)', type: 'depends_on', confidence: 0.95 },
  { id: 'e3', source: 'nextjs', target: 'org-vercel', label: 'developed by', type: 'developed_by', confidence: 1.0 },
  { id: 'e4', source: 'react', target: 'org-meta', label: 'created by', type: 'developed_by', confidence: 1.0 },
  { id: 'e5', source: 'react', target: 'typescript', label: 'typed with', type: 'related_to', confidence: 0.95 },
  { id: 'e6', source: 'gemini', target: 'org-google', label: 'developed by', type: 'developed_by', confidence: 1.0 },
  { id: 'e7', source: 'claude-anthropic', target: 'org-anthropic', label: 'developed by', type: 'developed_by', confidence: 1.0 },
  { id: 'e8', source: 'gemini', target: 'ai-agents', label: 'powers', type: 'extends', confidence: 0.96 },
  { id: 'e9', source: 'claude-anthropic', target: 'ai-agents', label: 'pioneers (MCP)', type: 'extends', confidence: 0.98 },
  { id: 'e10', source: 'typescript', target: 'org-microsoft', label: 'developed by', type: 'developed_by', confidence: 1.0 },
  { id: 'e11', source: 'nodejs', target: 'org-openjs', label: 'governed by', type: 'developed_by', confidence: 0.95 },
  { id: 'e12', source: 'bun', target: 'nodejs', label: 'replaces/competes with', type: 'competes_with', confidence: 0.93 },
  { id: 'e13', source: 'bun', target: 'postgresql', label: 'native SQL driver', type: 'depends_on', confidence: 0.91 },
  { id: 'e14', source: 'python', target: 'ai-agents', label: 'standard runtime for', type: 'related_to', confidence: 0.94 },
  { id: 'e15', source: 'docker', target: 'ai-agents', label: 'sandboxes', type: 'related_to', confidence: 0.89 },
];
