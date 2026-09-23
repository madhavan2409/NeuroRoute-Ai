import React from 'react';
import { EventCategory, EventFilterOptions } from '../../types/event';
import { Search, Filter, SlidersHorizontal, RotateCcw } from 'lucide-react';

interface EventFilterBarProps {
  filters: EventFilterOptions;
  onFilterChange: (newFilters: EventFilterOptions) => void;
  totalResults: number;
}

const CATEGORIES: (EventCategory | 'ALL')[] = [
  'ALL',
  'Technology',
  'Workshop',
  'Hackathon',
  'Cultural',
  'Sports',
  'Career',
  'Academic',
  'Seminar',
];

export const EventFilterBar: React.FC<EventFilterBarProps> = ({
  filters,
  onFilterChange,
  totalResults,
}) => {
  const handleCategoryClick = (category: EventCategory | 'ALL') => {
    onFilterChange({ ...filters, category });
  };

  const handleReset = () => {
    onFilterChange({
      searchQuery: '',
      category: 'ALL',
      dateFilter: 'ALL',
      availability: 'ALL',
      sortBy: 'DATE_ASC',
    });
  };

  const hasActiveFilters =
    Boolean(filters.searchQuery) ||
    (filters.category && filters.category !== 'ALL') ||
    (filters.dateFilter && filters.dateFilter !== 'ALL') ||
    (filters.availability && filters.availability !== 'ALL') ||
    (filters.sortBy && filters.sortBy !== 'DATE_ASC');

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
      {/* Top Search & Controls Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery || ''}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Search by event title, keywords, organizer, or venue..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-semibold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Date Filter Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={filters.dateFilter || 'ALL'}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                dateFilter: e.target.value as EventFilterOptions['dateFilter'],
              })
            }
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Filter by date"
          >
            <option value="ALL">📅 Any Date</option>
            <option value="TODAY">Today</option>
            <option value="THIS_WEEK">This Week</option>
            <option value="THIS_MONTH">This Month</option>
            <option value="UPCOMING">All Upcoming</option>
          </select>

          {/* Availability Dropdown */}
          <select
            value={filters.availability || 'ALL'}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                availability: e.target.value as EventFilterOptions['availability'],
              })
            }
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Filter by availability"
          >
            <option value="ALL">🎟️ All Statuses</option>
            <option value="OPEN_ONLY">Open for Registration</option>
            <option value="HAS_SEATS">Has Available Seats</option>
          </select>

          {/* Sort By Dropdown */}
          <select
            value={filters.sortBy || 'DATE_ASC'}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                sortBy: e.target.value as EventFilterOptions['sortBy'],
              })
            }
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Sort events"
          >
            <option value="DATE_ASC">Sort: Soonest Date</option>
            <option value="DATE_DESC">Sort: Latest Date</option>
            <option value="POPULARITY">Sort: Most Popular</option>
            <option value="SEATS_LEFT">Sort: Seats Remaining</option>
            <option value="TITLE_ASC">Sort: Title (A-Z)</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition"
              title="Reset all filters"
              aria-label="Reset all filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] shrink-0 mr-1">
          Category:
        </span>
        {CATEGORIES.map((cat) => {
          const isSelected = (filters.category || 'ALL') === cat;
          return (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`px-3 py-1.5 rounded-full font-semibold transition shrink-0 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          );
        })}
      </div>

      {/* Results Count Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
        <span>
          Showing <strong className="text-slate-900">{totalResults}</strong> event{totalResults === 1 ? '' : 's'}
        </span>
        {hasActiveFilters && (
          <span className="text-indigo-600 font-medium">Filtered results</span>
        )}
      </div>
    </div>
  );
};
