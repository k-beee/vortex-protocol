import React from "react";
import { Search, Filter } from "lucide-react";
import { SUPPORTED_ASSETS } from "../config/vortexConfig";

interface MarketFiltersProps {
  selectedAsset: string;
  onSelectAsset: (asset: string) => void;
  selectedState: string;
  onSelectState: (state: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const MarketFilters: React.FC<MarketFiltersProps> = ({
  selectedAsset,
  onSelectAsset,
  selectedState,
  onSelectState,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="bg-white border border-vortex-border p-4 mb-6 font-mono shadow-sm">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        
        {/* Asset Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500 uppercase mr-2 flex items-center">
            <Filter className="w-3 h-3 mr-1 text-vortex-accent" /> ASSET:
          </span>

          <button
            onClick={() => onSelectAsset("ALL")}
            className={`px-3 py-1 text-xs font-bold transition-all ${
              selectedAsset === "ALL"
                ? "bg-black text-white border border-black"
                : "bg-vortex-deep text-gray-700 hover:text-black border border-vortex-border"
            }`}
          >
            ALL_PAIRS
          </button>

          {SUPPORTED_ASSETS.map((asset) => (
            <button
              key={asset}
              onClick={() => onSelectAsset(asset)}
              className={`px-3 py-1 text-xs font-bold transition-all ${
                selectedAsset === asset
                  ? "bg-vortex-accent text-white border border-vortex-accent"
                  : "bg-vortex-deep text-gray-700 hover:text-black border border-vortex-border"
              }`}
            >
              {asset}/USDT
            </button>
          ))}
        </div>

        {/* State Filter & Search */}
        <div className="flex items-center space-x-3">
          
          {/* Status Select */}
          <select
            value={selectedState}
            onChange={(e) => onSelectState(e.target.value)}
            className="bg-vortex-deep border border-vortex-border text-black text-xs font-mono py-1.5 px-3 focus:outline-none focus:border-vortex-accent"
          >
            <option value="ALL">ALL STATES</option>
            <option value="OPEN">STATE: OPEN</option>
            <option value="SETTLED">STATE: SETTLED</option>
            <option value="INCONCLUSIVE">STATE: INCONCLUSIVE</option>
          </select>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Filter pair..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-vortex-deep border border-vortex-border text-black text-xs font-mono pl-8 pr-3 py-1.5 focus:outline-none focus:border-vortex-accent w-36 sm:w-48"
            />
          </div>

        </div>

      </div>
    </div>
  );
};
