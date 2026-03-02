'use client';

import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  NodeProps,
  Handle,
  Position,
  MarkerType,
} from 'reactflow';
import dagre from '@dagrejs/dagre';
import { ConceptMapData } from '@/lib/types';
import { X, Maximize2 } from 'lucide-react';
import 'reactflow/dist/style.css';

interface ConceptMapProps {
  data: ConceptMapData;
  onClose: () => void;
}

const NODE_WIDTH = 200;
const NODE_HEIGHT = 70;

// Difficulty → color mapping (green=easy → yellow → orange → red=hard)
const DIFFICULTY_COLORS: Record<number, { bg: string; border: string; text: string; glow: string }> = {
  1: { bg: '#0a2e1f', border: '#22c55e', text: '#4ade80', glow: 'rgba(34,197,94,0.15)' },
  2: { bg: '#1a2e0a', border: '#84cc16', text: '#a3e635', glow: 'rgba(132,204,22,0.15)' },
  3: { bg: '#2e2a0a', border: '#eab308', text: '#facc15', glow: 'rgba(234,179,8,0.15)' },
  4: { bg: '#2e1a0a', border: '#f97316', text: '#fb923c', glow: 'rgba(249,115,22,0.15)' },
  5: { bg: '#2e0a0a', border: '#ef4444', text: '#f87171', glow: 'rgba(239,68,68,0.15)' },
};

function getDifficultyColor(difficulty: number) {
  return DIFFICULTY_COLORS[Math.min(5, Math.max(1, difficulty))] || DIFFICULTY_COLORS[3];
}

function getLayoutedElements(
  nodes: Node[],
  edges: Edge[]
): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 70, ranksep: 100, marginx: 40, marginy: 40 });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = g.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

// Identify root nodes (no incoming edges)
function findRootNodes(nodes: ConceptMapData['nodes'], edges: ConceptMapData['edges']): Set<string> {
  const targets = new Set(edges.map(e => e.target));
  const roots = new Set<string>();
  for (const node of nodes) {
    if (!targets.has(node.id)) {
      roots.add(node.id);
    }
  }
  // If somehow no roots found, pick lowest-difficulty prerequisite nodes
  if (roots.size === 0) {
    const prereqs = nodes.filter(n => n.isPrerequisite).sort((a, b) => a.difficulty - b.difficulty);
    if (prereqs.length > 0) {
      roots.add(prereqs[0].id);
    } else if (nodes.length > 0) {
      roots.add(nodes[0].id);
    }
  }
  return roots;
}

// Tooltip rendered via portal so it floats above all nodes
function Tooltip({ anchor, data, colors }: { anchor: DOMRect; data: Record<string, unknown>; colors: { border: string; text: string } }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const x = anchor.left + anchor.width / 2;
    const y = anchor.bottom + 10;
    // Keep tooltip on screen
    const tooltipW = 288;
    const clampedX = Math.max(tooltipW / 2 + 8, Math.min(x, window.innerWidth - tooltipW / 2 - 8));
    const flipY = y + 160 > window.innerHeight;
    setPos({ x: clampedX, y: flipY ? anchor.top - 10 : y });
  }, [anchor]);

  return createPortal(
    <div
      ref={ref}
      className="pointer-events-none"
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        transform: pos.y < anchor.top ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
        zIndex: 9999,
      }}
    >
      <div className="w-72 p-4 bg-[#0f1629] border border-border rounded-xl shadow-2xl">
        <p className="text-xs font-semibold mb-1.5" style={{ color: colors.text }}>{String(data.label)}</p>
        <p className="text-xs text-text-secondary leading-relaxed">{String(data.description)}</p>
        {!data.isPrerequisite && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
            <span className="text-[10px] text-text-secondary">Difficulty:</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((d) => (
                <div
                  key={d}
                  className="w-2 h-2 rounded-full"
                  style={{ background: d <= (data.difficulty as number) ? colors.border : '#1e293b' }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

// Custom node component
function ConceptNode({ data }: NodeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  const colors = data.isPrerequisite
    ? { bg: '#141a2a', border: '#334155', text: '#94a3b8', glow: 'transparent' }
    : getDifficultyColor(data.difficulty);

  const handleMouseEnter = () => {
    if (nodeRef.current) {
      setAnchorRect(nodeRef.current.getBoundingClientRect());
    }
    setShowTooltip(true);
  };

  return (
    <div
      ref={nodeRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !border-2 !border-background" style={{ background: colors.border }} />

      {/* Glow effect */}
      {data.isRoot && (
        <div
          className="absolute -inset-2 rounded-2xl animate-pulse"
          style={{ background: data.isPrerequisite ? 'transparent' : colors.glow, opacity: 0.6 }}
        />
      )}

      <div
        className="relative px-4 py-3 rounded-xl text-center transition-all duration-200 cursor-pointer min-w-[180px]"
        style={{
          background: colors.bg,
          border: `2px solid ${colors.border}`,
          boxShadow: showTooltip ? `0 0 20px ${colors.glow}` : 'none',
        }}
      >
        {/* Start here badge */}
        {data.isRoot && !data.isPrerequisite && (
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider whitespace-nowrap"
            style={{ background: colors.border, color: '#0a0f1e' }}
          >
            Start Here
          </div>
        )}
        {data.isRoot && data.isPrerequisite && (
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-700 text-slate-300 whitespace-nowrap"
          >
            Foundation
          </div>
        )}

        {/* Difficulty dots */}
        {!data.isPrerequisite && (
          <div className="flex justify-center gap-0.5 mb-1.5">
            {[1, 2, 3, 4, 5].map((d) => (
              <div
                key={d}
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: d <= data.difficulty ? colors.border : '#1e293b',
                }}
              />
            ))}
          </div>
        )}

        <p className="text-xs font-semibold leading-tight" style={{ color: colors.text }}>
          {data.label}
        </p>

        {data.isPrerequisite && (
          <span className="text-[10px] mt-0.5 block" style={{ color: '#64748b' }}>prerequisite</span>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !border-2 !border-background" style={{ background: colors.border }} />

      {/* Tooltip via portal — renders on document.body so it floats above everything */}
      {showTooltip && data.description && anchorRect && (
        <Tooltip anchor={anchorRect} data={data} colors={colors} />
      )}
    </div>
  );
}

const nodeTypes = { concept: ConceptNode };

export default function ConceptMap({ data, onClose }: ConceptMapProps) {
  const rootNodes = useMemo(() => findRootNodes(data.nodes, data.edges), [data]);
  const [hoveredEdge, setHoveredEdge] = useState<{ id: string; label: string; x: number; y: number } | null>(null);

  const layoutResult = useMemo(() => {
    const rfNodes: Node[] = data.nodes.map((node) => ({
      id: node.id,
      type: 'concept',
      position: { x: 0, y: 0 },
      data: {
        label: node.label,
        description: node.description,
        isPrerequisite: node.isPrerequisite,
        difficulty: node.difficulty,
        isRoot: rootNodes.has(node.id),
      },
    }));

    const rfEdges: Edge[] = data.edges.map((edge, i) => ({
      id: `edge-${i}`,
      source: edge.source,
      target: edge.target,
      data: { label: edge.label },
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#475569', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 16,
        height: 16,
        color: '#475569',
      },
    }));

    return getLayoutedElements(rfNodes, rfEdges);
  }, [data, rootNodes]);

  const [nodes, , onNodesChange] = useNodesState(layoutResult.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutResult.edges);

  const onEdgeMouseEnter = useCallback((_: React.MouseEvent, edge: Edge) => {
    const label = edge.data?.label;
    if (!label) return;
    // Highlight the hovered edge
    setEdges((eds) => eds.map((e) =>
      e.id === edge.id
        ? { ...e, style: { stroke: '#38bdf8', strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: '#38bdf8' }, animated: true }
        : e
    ));
    setHoveredEdge({ id: edge.id, label, x: _.clientX, y: _.clientY });
  }, [setEdges]);

  const onEdgeMouseLeave = useCallback(() => {
    setEdges((eds) => eds.map((e) => ({
      ...e,
      style: { stroke: '#475569', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16, color: '#475569' },
      animated: false,
    })));
    setHoveredEdge(null);
  }, [setEdges]);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full h-full max-w-6xl max-h-[90vh] bg-surface border border-border rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Maximize2 className="w-5 h-5 text-accent" />
            <div>
              <h3
                className="text-xl text-text-primary"
                style={{ fontFamily: 'var(--font-instrument-serif)' }}
              >
                Concept Map
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Follow the arrows from top to bottom. Hover any concept for details.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-6 py-2.5 border-b border-border bg-background/50 text-[11px] text-text-secondary">
          <span className="font-semibold text-text-primary mr-1">Read:</span>
          <span>Top → Bottom</span>
          <span className="text-border">|</span>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ background: '#141a2a', border: '1.5px solid #334155' }} />
            <span>Prerequisite</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ background: '#0a2e1f', border: '1.5px solid #22c55e' }} />
            <span>Easy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ background: '#2e2a0a', border: '1.5px solid #eab308' }} />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ background: '#2e0a0a', border: '1.5px solid #ef4444' }} />
            <span>Hard</span>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
              {[1,2,3].map(d => <div key={d} className="w-1.5 h-1.5 rounded-full bg-accent" />)}
              {[4,5].map(d => <div key={d} className="w-1.5 h-1.5 rounded-full bg-border" />)}
            </div>
            <span>= Difficulty level</span>
          </div>
        </div>

        {/* Graph */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onEdgeMouseEnter={onEdgeMouseEnter}
            onEdgeMouseLeave={onEdgeMouseLeave}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            minZoom={0.2}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1e293b" />
            <Controls
              className="!bg-surface !border-border !rounded-lg !shadow-lg"
              showInteractive={false}
            />
            <MiniMap
              nodeColor={(node) => {
                if (node.data?.isPrerequisite) return '#334155';
                const colors = getDifficultyColor(node.data?.difficulty || 3);
                return colors.border;
              }}
              maskColor="rgba(10, 15, 30, 0.8)"
              className="!bg-background !border-border !rounded-lg"
            />
          </ReactFlow>

          {/* Edge hover label — rendered outside ReactFlow so it never overlaps */}
          {hoveredEdge && createPortal(
            <div
              className="pointer-events-none"
              style={{
                position: 'fixed',
                left: hoveredEdge.x,
                top: hoveredEdge.y - 32,
                transform: 'translate(-50%, -100%)',
                zIndex: 9999,
              }}
            >
              <div className="px-3 py-1.5 bg-accent text-background text-xs font-semibold rounded-lg shadow-lg whitespace-nowrap">
                {hoveredEdge.label}
              </div>
            </div>,
            document.body
          )}
        </div>
      </div>
    </div>
  );
}
