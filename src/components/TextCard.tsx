"use client";

import React, { useRef, useEffect } from "react";
import { useSearchContext } from "@/hooks/useSearchContext";

export default function TextCard() {
  // Data from context
  const { segments, currentMatchIndex } = useSearchContext();

  // Refs for scrolling to matches (local to this component)
  const matchRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Auto-scroll to the current match when it changes
  useEffect(() => {
    if (currentMatchIndex !== null && matchRefs.current[currentMatchIndex]) {
      matchRefs.current[currentMatchIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentMatchIndex]);

  return (
    <div className="max-w-4xl mb-12 mx-auto p-6 text-[18px] overflow-y-auto bg-white shadow-lg rounded-xl">
      <p className="whitespace-pre-wrap leading-relaxed">
        {segments.map((segment, idx) => {
          if (segment.isMatch) {
            const matchIdx = segment.matchIndex!;
            const isActive = currentMatchIndex === matchIdx;
            return (
              <span
                key={idx}
                ref={(el) => {
                  matchRefs.current[matchIdx] = el;
                }}
                className={`
                  rounded transition-all duration-300
                  ${
                    isActive
                      ? "bg-yellow-500 ring-2 ring-yellow-600"
                      : "bg-yellow-200"
                  }
                `}
              >
                {segment.text}
              </span>
            );
          }
          return <span key={idx}>{segment.text}</span>;
        })}
      </p>
    </div>
  );
}
