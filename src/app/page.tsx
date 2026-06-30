"use client";

import SearchInput from "@/components/SearchInput";
import { sampleText } from "@/data/sampleText";
import { getHighlightedSegments } from "@/utils/highlight";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(0);
  const matchRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const segments = useMemo(() => {
    return getHighlightedSegments(sampleText, searchTerm);
  }, [searchTerm]);

  const matches = segments.filter((s) => s.isMatch);
  const totalMatches = matches.length;

  // Navigation functions
  const goToMatch = (index: number) => {
    if (index < 0 || index >= totalMatches) return;
    setCurrentMatchIndex(index);
    matchRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const goToNext = () => {
    if (currentMatchIndex === null) {
      goToMatch(0);
    } else {
      goToMatch((currentMatchIndex + 1) % totalMatches);
    }
  };

  const goToPrev = () => {
    if (currentMatchIndex === null) {
      goToMatch(totalMatches - 1);
    } else {
      goToMatch((currentMatchIndex - 1 + totalMatches) % totalMatches);
    }
  };

  return (
    <div className="max-h-screen flex flex-col flex-1 items-center justify-center bg-blue-300 font-sans text-black">
      <div className="h-full mx-6 flex flex-col">
        <div className="my-4">
          <div className="flex w-full justify-between items-center text-center mt-3 mb-5">
            <h1 className="text-3xl font-bold">Smart Search Reader</h1>
            <Image
              src="/icon-192.png"
              width={80}
              height={80}
              alt="Smart Search Reader"
            />
          </div>
          <SearchInput
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            totalMatches={totalMatches}
            currentMatchIndex={currentMatchIndex}
            onPrev={goToPrev}
            onNext={goToNext}
            text={sampleText}
          />
        </div>
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
              } else {
                return <span key={idx}>{segment.text}</span>;
              }
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
