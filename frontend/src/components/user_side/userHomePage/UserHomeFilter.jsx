import { ArrowRight, MapPin } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { clearFilters, setFilters } from '../../../Redux/Filter/filterSlice';

export default function Filters() {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.filter);

  const [ageMin, setAgeMin] = useState(filters.ageMin || '');
  const [ageMax, setAgeMax] = useState(filters.ageMax || '');
  const [matchMin, setMatchMin] = useState(filters.matchMin || '');
  const [matchMax, setMatchMax] = useState(filters.matchMax || '');
  const [locationClicked, setLocationClicked] = useState(false);

  useEffect(() => {
    setAgeMin(filters.ageMin || '');
    setAgeMax(filters.ageMax || '');
    setMatchMin(filters.matchMin || '');
    setMatchMax(filters.matchMax || '');
  }, [filters]);

  const handleApplyFilters = () => {
    console.log("filter has been called ")
    const filterData = { ageMin, ageMax, matchMin, matchMax };
    dispatch(setFilters(filterData));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setAgeMin('');
    setAgeMax('');
    setMatchMin('');
    setMatchMax('');
    setLocationClicked(false);
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationClicked(true);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  return (
    <aside className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-l p-6">
      <div className="space-y-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Age:</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                className="w-20 px-3 py-1 rounded-lg border"
                placeholder="Min"
                value={ageMin}
                onChange={(e) => setAgeMin(e.target.value)}
              />
              <span>-</span>
              <input
                type="number"
                className="w-20 px-3 py-1 rounded-lg border"
                placeholder="Max"
                value={ageMax}
                onChange={(e) => setAgeMax(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-600">Match %:</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                className="w-20 px-3 py-1 rounded-lg border"
                placeholder="Min"
                value={matchMin}
                onChange={(e) => setMatchMin(e.target.value)}
              />
              <span>-</span>
              <input
                type="number"
                className="w-20 px-3 py-1 rounded-lg border"
                placeholder="Max"
                value={matchMax}
                onChange={(e) => setMatchMax(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-600">Location:</label>
            <button
              className={`w-full text-gray-700 rounded-lg py-2 px-4 flex items-center justify-center space-x-2 ${locationClicked ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
              onClick={handleGetLocation}
            >
              <MapPin size={16} />
              <span>Use Current Location</span>
            </button>
          </div>

          <button
            className="w-full bg-gray-800 text-white rounded-lg py-2 px-4 flex items-center justify-center space-x-2"
            onClick={handleApplyFilters}
          >
            <span>Apply</span>
            <ArrowRight size={16} />
          </button>
          <button
            className="w-full bg-gray-400 text-white rounded-lg py-2 px-4 flex items-center justify-center space-x-2"
            onClick={handleClearFilters}
          >
            <span>Clear Filters</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
