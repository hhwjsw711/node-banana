"use client";

import { useReactFlow } from "@xyflow/react";
import { useWorkflowStore } from "@/store/workflowStore";
import { useMemo } from "react";

const STACK_GAP = 20;

export function MultiSelectToolbar() {
  const { nodes, onNodesChange } = useWorkflowStore();
  const { getViewport } = useReactFlow();

  const selectedNodes = useMemo(
    () => nodes.filter((node) => node.selected),
    [nodes]
  );

  // Calculate toolbar position (centered above selected nodes)
  const toolbarPosition = useMemo(() => {
    if (selectedNodes.length < 2) return null;

    const viewport = getViewport();

    // Find bounding box of selected nodes
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;

    selectedNodes.forEach((node) => {
      const nodeWidth = (node.style?.width as number) || node.measured?.width || 220;
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + nodeWidth);
    });

    // Convert flow coordinates to screen coordinates
    const centerX = (minX + maxX) / 2;
    const screenX = centerX * viewport.zoom + viewport.x;
    const screenY = minY * viewport.zoom + viewport.y - 50; // 50px above the top

    return { x: screenX, y: screenY };
  }, [selectedNodes, getViewport]);

  const handleStackHorizontally = () => {
    if (selectedNodes.length < 2) return;

    // Sort by current x position to maintain relative order
    const sortedNodes = [...selectedNodes].sort((a, b) => a.position.x - b.position.x);

    // Use the topmost y position as the alignment point
    const alignY = Math.min(...sortedNodes.map((n) => n.position.y));

    let currentX = sortedNodes[0].position.x;

    sortedNodes.forEach((node) => {
      const nodeWidth = (node.style?.width as number) || node.measured?.width || 220;

      onNodesChange([
        {
          type: "position",
          id: node.id,
          position: { x: currentX, y: alignY },
        },
      ]);

      currentX += nodeWidth + STACK_GAP;
    });
  };

  const handleStackVertically = () => {
    if (selectedNodes.length < 2) return;

    // Sort by current y position to maintain relative order
    const sortedNodes = [...selectedNodes].sort((a, b) => a.position.y - b.position.y);

    // Use the leftmost x position as the alignment point
    const alignX = Math.min(...sortedNodes.map((n) => n.position.x));

    let currentY = sortedNodes[0].position.y;

    sortedNodes.forEach((node) => {
      const nodeHeight = (node.style?.height as number) || node.measured?.height || 200;

      onNodesChange([
        {
          type: "position",
          id: node.id,
          position: { x: alignX, y: currentY },
        },
      ]);

      currentY += nodeHeight + STACK_GAP;
    });
  };

  if (!toolbarPosition || selectedNodes.length < 2) return null;

  return (
    <div
      className="fixed z-[100] flex items-center gap-1 bg-neutral-800 border border-neutral-600 rounded-lg shadow-xl p-1"
      style={{
        left: toolbarPosition.x,
        top: toolbarPosition.y,
        transform: "translateX(-50%)",
      }}
    >
      <button
        onClick={handleStackHorizontally}
        className="p-1.5 rounded hover:bg-neutral-700 text-neutral-400 hover:text-neutral-100 transition-colors"
        title="Stack horizontally (H)"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h4v16H6zM14 4h4v16h-4z" />
        </svg>
      </button>
      <button
        onClick={handleStackVertically}
        className="p-1.5 rounded hover:bg-neutral-700 text-neutral-400 hover:text-neutral-100 transition-colors"
        title="Stack vertically (V)"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v4H4zM4 14h16v4H4z" />
        </svg>
      </button>
    </div>
  );
}
