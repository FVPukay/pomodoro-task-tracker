import React from "react";

export default function PriorityMatrix() {
  return (
    <div className="w-full h-full bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col">
      {/* Title and Courtesy Link */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Priority Matrix <a
          href="https://www.jointaro.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-purple-800 hover:text-purple-500 transition-all hover:scale-105"
          >
            From Taro
          </a>
        </h2>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-hidden">
        <div className="w-full max-w-4xl h-full flex flex-col">
          {/* Impact labels above grid */}
          <div className="grid grid-cols-[100px_1fr_1fr_1fr] text-gray-800 font-medium text-center mb-2 text-xs sm:text-sm">
            <div /> {/* empty space above time-cost labels */}
            <span>High Impact (3)</span>
            <span>Mid Impact (2)</span>
            <span>Low Impact (1)</span>
          </div>

          {/* Combined grid for labels + matrix */}
          <div className="grid grid-cols-[100px_1fr_1fr_1fr] grid-rows-3 flex-1 w-full h-full">
            {/* Row 1 */}
            <div className="flex items-center justify-center text-gray-800 font-medium text-xs sm:text-sm">
              Low Time Cost (3)
            </div>
            <div className="flex items-center justify-center bg-green-700 text-white text-xl sm:text-2xl font-bold">
              9
            </div>
            <div className="flex items-center justify-center bg-green-300 text-white text-xl sm:text-2xl font-bold">
              6
            </div>
            <div className="flex items-center justify-center bg-yellow-300 text-white text-xl sm:text-2xl font-bold">
              3
            </div>

            {/* Row 2 */}
            <div className="flex items-center justify-center text-gray-800 font-medium text-xs sm:text-sm">
              Mid Time Cost (2)
            </div>
            <div className="flex items-center justify-center bg-green-300 text-white text-xl sm:text-2xl font-bold">
              6
            </div>
            <div className="flex items-center justify-center bg-yellow-300 text-white text-xl sm:text-2xl font-bold">
              4
            </div>
            <div className="flex items-center justify-center bg-orange-400 text-white text-xl sm:text-2xl font-bold">
              2
            </div>

            {/* Row 3 */}
            <div className="flex items-center justify-center text-gray-800 font-medium text-xs sm:text-sm">
              High Time Cost (1)
            </div>
            <div className="flex items-center justify-center bg-yellow-300 text-white text-xl sm:text-2xl font-bold">
              3
            </div>
            <div className="flex items-center justify-center bg-orange-400 text-white text-xl sm:text-2xl font-bold">
              2
            </div>
            <div className="flex items-center justify-center bg-red-600 text-white text-xl sm:text-2xl font-bold">
              1
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
