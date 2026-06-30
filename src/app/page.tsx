'use client';

import { useSearchContext } from '@/hooks/useSearchContext'
import Image from 'next/image';
import SearchInput from '@/components/SearchInput';
import TextCard from '@/components/TextCard';
import { sampleText } from '@/data/sampleText';

export default function Home() {
  const {
    searchTerm,
    setSearchTerm,
    totalMatches,
    currentMatchIndex,
    goToNext,
    goToPrev,
  } = useSearchContext();

  return (
    <div className="max-h-screen flex flex-col flex-1 items-center justify-center bg-blue-300 font-sans text-black">
      <div className="h-full mx-6 flex flex-col w-full max-w-4xl">
        <div className="my-4">
          <div className="flex w-full justify-between items-center text-center mt-3 mb-5">
            <h1 className="text-3xl font-bold">Smart Search Reader</h1>
            <Image
              src="/icon-192.png"
              width={80}
              height={80}
              alt="Smart Search Reader"
              className="rounded-lg"
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
        <TextCard />
      </div>
    </div>
  );
}