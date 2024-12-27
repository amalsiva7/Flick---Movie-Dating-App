import { ArrowRight } from 'lucide-react'

export default function Filters() {
  return (
    <aside className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-l p-6">
      <div className="space-y-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-600">age:</label>
            <div className="flex items-center space-x-2 ">
              <input
                type="number"
                className="w-20 px-3 py-1 rounded-lg border"
                placeholder="Min"
              />
              <span>-</span>
              <input
                type="number"
                className="w-20 px-3 py-1  rounded-lg border"
                placeholder="Max"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-600">height:</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                className="w-20 px-3 py-1  rounded-lg border"
                placeholder="Min"
              />
              <span>-</span>
              <input
                type="number"
                className="w-20 px-3 py-1  rounded-lg border"
                placeholder="Max"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-600">location:</label>
            <input
              type="text"
              className="w-full px-3 py-1  rounded-lg border"
              placeholder="Enter location"
            />
          </div>

          <button className="w-full bg-gray-800 text-white rounded-lg py-2 px-4 flex items-center justify-center space-x-2">
            <span>Apply</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}

