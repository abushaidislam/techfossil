import React, { useState, useEffect } from 'react';
import { RelationshipNode, RelationshipEdge } from '../types';
import { KnowledgeGraph } from '../components/graph/KnowledgeGraph';
import { Network, HelpCircle, Layers, GitBranch, ArrowRight } from 'lucide-react';

interface Props {
  onSelectTechnology: (slug: string) => void;
}

export const KnowledgeGraphView: React.FC<Props> = ({ onSelectTechnology }) => {
  const [nodes, setNodes] = useState<RelationshipNode[]>([]);
  const [edges, setEdges] = useState<RelationshipEdge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/graph')
      .then((res) => res.json())
      .then((data) => {
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleNodeClick = (nodeId: string, nodeType: string) => {
    if (nodeType === 'technology') {
      onSelectTechnology(nodeId);
    }
  };

  return (
    <div className="space-y-6 py-6">
      <div className="border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-amber-400" />
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-sans tracking-tight">
            Ecosystem Knowledge Graph
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-neutral-400 font-sans max-w-3xl leading-relaxed mt-1">
          Explore multi-directional dependencies, governing organizations, standard extensions, and competing architectures mapped across the technology ecosystem.
        </p>
      </div>

      {loading ? (
        <div className="py-24 text-center font-mono text-xs text-neutral-400 flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Building relationship topology...</span>
        </div>
      ) : (
        <KnowledgeGraph
          nodes={nodes}
          edges={edges}
          onSelectNode={handleNodeClick}
        />
      )}
    </div>
  );
};
