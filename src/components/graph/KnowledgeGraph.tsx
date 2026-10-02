import React, { useState, useEffect, useRef } from 'react';
import { RelationshipNode, RelationshipEdge } from '../../types';
import {
  Network,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Search,
  Filter,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface Props {
  nodes: RelationshipNode[];
  edges: RelationshipEdge[];
  onSelectNode?: (nodeId: string, nodeType: string) => void;
  selectedNodeId?: string;
}

interface SimNode extends RelationshipNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export const KnowledgeGraph: React.FC<Props> = ({
  nodes,
  edges,
  onSelectNode,
  selectedNodeId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNode, setActiveNode] = useState<RelationshipNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedNode, setDraggedNode] = useState<string | null>(null);

  // Position nodes radially initially
  const [simNodes, setSimNodes] = useState<SimNode[]>(() => {
    const width = 800;
    const height = 550;
    const count = nodes.length;
    return nodes.map((n, i) => {
      const angle = (i / count) * 2 * Math.PI;
      const radius = n.type === 'organization' ? 240 : 160 + (i % 3) * 35;
      return {
        ...n,
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
      };
    });
  });

  // Simple relaxation layout loop
  useEffect(() => {
    let animId: number;
    let iteration = 0;

    const tick = () => {
      if (iteration > 60) return; // Settle after 60 frames
      iteration++;

      setSimNodes((prevNodes) => {
        const next = prevNodes.map((n) => ({ ...n }));
        const kRepel = 1200;
        const width = 800;
        const height = 550;

        // Repulsion between nodes
        for (let i = 0; i < next.length; i++) {
          for (let j = i + 1; j < next.length; j++) {
            const dx = next[j].x - next[i].x;
            const dy = next[j].y - next[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            if (dist < 260) {
              const force = (kRepel / (dist * dist));
              const fx = (dx / dist) * force;
              const fy = (dy / dist) * force;
              next[i].x -= fx;
              next[i].y -= fy;
              next[j].x += fx;
              next[j].y += fy;
            }
          }
        }

        // Attraction along edges
        edges.forEach((edge) => {
          const source = next.find((n) => n.id === edge.source);
          const target = next.find((n) => n.id === edge.target);
          if (source && target) {
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const desiredDist = 130;
            const force = (dist - desiredDist) * 0.03;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            source.x += fx;
            source.y += fy;
            target.x -= fx;
            target.y -= fy;
          }
        });

        // Center gravity
        next.forEach((n) => {
          n.x += (width / 2 - n.x) * 0.02;
          n.y += (height / 2 - n.y) * 0.02;
        });

        return next;
      });

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [edges]);

  // Sync active node with prop
  const effectiveActiveNode = activeNode || (selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) || null : null);


  // Filter edges based on filterType
  const filteredEdges = edges.filter((e) => {
    if (filterType === 'all') return true;
    return e.type === filterType;
  });

  const filteredNodeIds = new Set<string>();
  filteredEdges.forEach((e) => {
    filteredNodeIds.add(e.source);
    filteredNodeIds.add(e.target);
  });

  const visibleNodes = simNodes.filter((n) => {
    const matchesFilter = filterType === 'all' || filteredNodeIds.has(n.id);
    const matchesSearch = !searchQuery || n.label.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Calculate connected edges and nodes for selected activeNode
  const connectedEdges = effectiveActiveNode
    ? edges.filter((e) => e.source === effectiveActiveNode.id || e.target === effectiveActiveNode.id)
    : [];

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).tagName === 'g') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    } else if (draggedNode) {
      setSimNodes((prev) =>
        prev.map((n) => {
          if (n.id === draggedNode) {
            return {
              ...n,
              x: (e.clientX - pan.x) / zoom,
              y: (e.clientY - pan.y) / zoom,
            };
          }
          return n;
        })
      );
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedNode(null);
  };

  const getNodeColor = (type: string, isHighlighted: boolean) => {
    if (type === 'organization') {
      return isHighlighted ? '#38bdf8' : '#0284c7';
    }
    return isHighlighted ? '#f59e0b' : '#334155';
  };

  return (
    <div className="bg-[#121316] border border-white/[0.08] rounded-md overflow-hidden flex flex-col h-[700px]">
      {/* Top Toolbar */}
      <div className="p-3 bg-[#0e0f11] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-white font-sans">TechFossil Knowledge Graph</span>
          <span className="text-neutral-400">({visibleNodes.length} nodes, {filteredEdges.length} edges)</span>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search entity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-neutral-900 border border-white/[0.08] rounded pl-7 pr-2 py-1 text-xs text-neutral-200 placeholder-neutral-400 w-36 focus:outline-none focus:border-amber-400"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-neutral-900 border border-white/[0.08] rounded px-2 py-1 text-xs text-neutral-200 focus:outline-none"
          >
            <option value="all">All Relationships</option>
            <option value="depends_on">depends_on</option>
            <option value="developed_by">developed_by</option>
            <option value="extends">extends</option>
            <option value="competes_with">competes_with</option>
            <option value="related_to">related_to</option>
          </select>

          <div className="flex items-center gap-1 border-l border-white/[0.08] pl-2">
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.15, 2))}
              className="p-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.15, 0.5))}
              className="p-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              className="p-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300"
              title="Reset View"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="flex-1 relative cursor-grab active:cursor-grabbing bg-[#0a0b0d] overflow-hidden select-none"
      >
        <svg
          className="w-full h-full"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#52525b" />
            </marker>
            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f59e0b" />
            </marker>
          </defs>

          {/* Background grid dots */}
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.75" fill="#26272b" />
          </pattern>
          <rect width="10000" height="10000" x="-5000" y="-5000" fill="url(#grid)" />

          {/* Edges */}
          <g>
            {filteredEdges.map((edge) => {
              const source = simNodes.find((n) => n.id === edge.source);
              const target = simNodes.find((n) => n.id === edge.target);
              if (!source || !target) return null;

              const isEdgeConnected =
                effectiveActiveNode && (edge.source === effectiveActiveNode.id || edge.target === effectiveActiveNode.id);

              return (
                <g key={edge.id}>
                  <line
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={isEdgeConnected ? '#f59e0b' : '#27272a'}
                    strokeWidth={isEdgeConnected ? 2 : 1}
                    strokeDasharray={edge.type === 'related_to' ? '4 2' : undefined}
                    markerEnd={isEdgeConnected ? 'url(#arrow-active)' : 'url(#arrow)'}
                    className="transition-colors duration-150"
                  />
                  {/* Edge Label on hover or active */}
                  {isEdgeConnected && (
                    <text
                      x={(source.x + target.x) / 2}
                      y={(source.y + target.y) / 2 - 6}
                      fill="#d4d4d8"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="bg-black/80 px-1 py-0.5 rounded pointer-events-none"
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* Nodes */}
          <g>
            {visibleNodes.map((node) => {
              const isSelected = effectiveActiveNode?.id === node.id;
              const isConnected =
                effectiveActiveNode &&
                (connectedEdges.some((e) => e.source === node.id || e.target === node.id) || isSelected);

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveNode(node);
                    if (onSelectNode) onSelectNode(node.id, node.type);
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setDraggedNode(node.id);
                  }}
                >
                  {/* Outer halo if active */}
                  {isSelected && (
                    <circle
                      r="22"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                      className="animate-spin-slow"
                    />
                  )}

                  {/* Core Node Circle */}
                  <circle
                    r={node.type === 'organization' ? 14 : 11}
                    fill={getNodeColor(node.type, isConnected || isSelected)}
                    stroke={isSelected ? '#ffffff' : '#18181b'}
                    strokeWidth="2"
                    className="transition-all duration-150 hover:scale-125"
                  />

                  {/* Node Label */}
                  <text
                    y={node.type === 'organization' ? 24 : 20}
                    textAnchor="middle"
                    fill={isSelected ? '#ffffff' : isConnected ? '#e4e4e7' : '#a1a1aa'}
                    fontSize="11"
                    fontFamily="sans-serif"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    className="pointer-events-none select-none drop-shadow-md"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Selected Entity Inspector Side Drawer */}
        {effectiveActiveNode && (
          <div className="absolute top-4 right-4 w-72 bg-[#121316]/95 backdrop-blur-md border border-white/[0.12] rounded-md p-4 shadow-xl z-20 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-amber-400">
                  {effectiveActiveNode.type}
                </span>
                <h4 className="text-sm font-bold text-white font-sans">{effectiveActiveNode.label}</h4>
                {effectiveActiveNode.category && (
                  <span className="text-[11px] text-neutral-400 font-mono">
                    Category: {effectiveActiveNode.category}
                  </span>
                )}
              </div>
              <button
                onClick={() => setActiveNode(null)}
                className="text-neutral-400 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>

            <div className="border-t border-white/[0.06] pt-2">
              <span className="text-[11px] font-mono text-neutral-400 block mb-1">
                Connected Relationships ({connectedEdges.length})
              </span>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {connectedEdges.map((e) => {
                  const otherNodeId = e.source === effectiveActiveNode.id ? e.target : e.source;
                  const otherNode = nodes.find((n) => n.id === otherNodeId);
                  const isOutgoing = e.source === effectiveActiveNode.id;

                  return (
                    <div
                      key={e.id}
                      className="text-[11px] font-mono p-1.5 rounded bg-neutral-900/60 border border-white/[0.04] flex items-center justify-between"
                    >
                      <span className="text-neutral-300">
                        {isOutgoing ? '→' : '←'} {e.label}
                      </span>
                      <button
                        onClick={() => {
                          const target = nodes.find((n) => n.id === otherNodeId);
                          if (target) setActiveNode(target);
                        }}
                        className="text-amber-400 hover:underline font-semibold"
                      >
                        {otherNode?.label || otherNodeId}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {effectiveActiveNode.type === 'technology' && onSelectNode && (
              <button
                onClick={() => onSelectNode(effectiveActiveNode.id, 'technology')}
                className="w-full mt-2 py-1.5 bg-white/[0.08] hover:bg-white/[0.12] text-xs font-mono text-white rounded transition-colors text-center"
              >
                Open Full Technology Dossier →
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer Legend */}
      <div className="p-2.5 bg-[#0e0f11] border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-neutral-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            Technology
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
            Organization
          </span>
        </div>
        <span className="text-neutral-400">Click node to inspect • Drag to rearrange • Scroll to zoom</span>
      </div>
    </div>
  );
};
