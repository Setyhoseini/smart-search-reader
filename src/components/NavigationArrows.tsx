import Image from "next/image";

interface NavigationArrowsProps {
  totalMatches: number;
  currentMatchIndex: number | null;
  onPrev: () => void;
  onNext: () => void;
  query: string;
}

export default function NavigationArrows({
  totalMatches,
  currentMatchIndex,
  onPrev,
  onNext,
  query,
}: NavigationArrowsProps) {
  if (!query || totalMatches === 0) return null;

  return (
    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
      <span className="text-gray-600 font-medium text-sm">
        {currentMatchIndex !== null ? currentMatchIndex + 1 : 0}/{totalMatches}
      </span>

      <Image src="/line-vertical.svg" width={24} height={24} alt="Separator" />

      <button
        onClick={onPrev}
        disabled={totalMatches === 0}
        className="disabled:opacity-50 disabled:cursor-not-allowed p-1 hover:bg-gray-100 rounded transition"
      >
        <Image
          src="/chevron.svg"
          width={20}
          height={20}
          alt="Previous"
          className="rotate-270"
        />
      </button>

      <button
        onClick={onNext}
        disabled={totalMatches === 0}
        className="disabled:opacity-50 disabled:cursor-not-allowed p-1 hover:bg-gray-100 rounded transition"
      >
        <Image
          src="/chevron.svg"
          width={20}
          height={20}
          alt="Next"
          className="rotate-90"
        />
      </button>
    </div>
  );
}
