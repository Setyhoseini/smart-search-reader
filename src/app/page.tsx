import { sampleText } from "@/data/sampleText";
import Image from "next/image";

export default function Home() {
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
          <input
            type="text"
            placeholder="Type a keyword..."
            className="w-full px-4 py-2 mb-4 font-semibold border-2 border-gray-900 placeholder-blue-900 text-black transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="max-w-4xl mb-12 mx-auto p-6 text-[18px] overflow-y-auto bg-white shadow-lg rounded-xl">
          {sampleText}
        </div>
      </div>
    </div>
  );
}
