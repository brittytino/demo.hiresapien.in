"use client";

import React, { useState } from "react";
import { GripVertical } from "lucide-react";

interface RankingUIProps {
  items: string[];
  onUpdate: (ranked: string[]) => void;
  defaultValue?: string[];
}

export function RankingUI({ items, onUpdate, defaultValue }: RankingUIProps) {
  const [ranked, setRanked] = useState<string[]>(defaultValue || [...items]);
  const [dragging, setDragging] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDragging(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOver(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragging === null || dragging === dropIndex) {
      setDragging(null);
      setDragOver(null);
      return;
    }

    const newRanked = [...ranked];
    const [draggedItem] = newRanked.splice(dragging, 1);
    newRanked.splice(dropIndex, 0, draggedItem);

    setRanked(newRanked);
    onUpdate(newRanked);
    setDragging(null);
    setDragOver(null);
  };

  const handleDragEnd = () => {
    setDragging(null);
    setDragOver(null);
  };

  // Touch-friendly: move up/down buttons
  const moveItem = (index: number, direction: "up" | "down") => {
    const newRanked = [...ranked];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newRanked.length) return;
    [newRanked[index], newRanked[targetIndex]] = [newRanked[targetIndex], newRanked[index]];
    setRanked(newRanked);
    onUpdate(newRanked);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500 font-medium mb-3">
        Drag items to reorder, or use the arrows. Rank from <strong>highest</strong> to{" "}
        <strong>lowest</strong> priority.
      </p>

      {ranked.map((item, index) => (
        <div
          key={item}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 transition-all select-none cursor-grab active:cursor-grabbing ${
            dragging === index
              ? "opacity-40 border-indigo-400 bg-indigo-50 shadow-inner"
              : dragOver === index
              ? "border-indigo-500 bg-indigo-50 shadow-md scale-[1.01]"
              : "border-gray-200 bg-white hover:border-indigo-200 hover:bg-gray-50 shadow-sm"
          }`}
        >
          {/* Rank badge */}
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
              index === 0
                ? "bg-amber-100 text-amber-700"
                : index === 1
                ? "bg-gray-100 text-gray-600"
                : index === 2
                ? "bg-orange-50 text-orange-600"
                : "bg-gray-50 text-gray-400"
            }`}
          >
            {index + 1}
          </div>

          {/* Drag handle */}
          <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />

          {/* Item label */}
          <span className="flex-1 text-sm font-semibold text-gray-800">{item}</span>

          {/* Up/Down buttons for accessibility and mobile */}
          <div className="flex flex-col gap-0.5 flex-shrink-0">
            <button
              onClick={() => moveItem(index, "up")}
              disabled={index === 0}
              className="px-2 py-0.5 text-xs text-gray-400 hover:text-indigo-600 disabled:opacity-20 transition-colors font-bold"
              aria-label="Move up"
            >
              ▲
            </button>
            <button
              onClick={() => moveItem(index, "down")}
              disabled={index === ranked.length - 1}
              className="px-2 py-0.5 text-xs text-gray-400 hover:text-indigo-600 disabled:opacity-20 transition-colors font-bold"
              aria-label="Move down"
            >
              ▼
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
