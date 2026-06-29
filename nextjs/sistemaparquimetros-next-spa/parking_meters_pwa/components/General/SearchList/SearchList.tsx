import { useState, useRef, useCallback, useEffect } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

interface SearchListProps {
  items: Array<any>;
  filterLabel: string;
  label?: string;
  onSelect: (selectedItem: any) => void;
  onClear?: () => void;
  filtered?: string;
}

export const SearchList: React.FC<SearchListProps> = ({ items, label, filterLabel, onSelect, onClear, filtered }) => {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (filtered) {
      setQuery(filtered);
      onSelect(items.filter(item =>
        item[filterLabel].toLowerCase().includes(filtered.toLowerCase())
      )[0]);
    }
  }, [filtered]);

  const filteredItems = query
    ? items.filter(item =>
      item[filterLabel].toLowerCase().includes(query.toLowerCase())
    )
    : items;

  const onFocus = useCallback(() => {
    setActive(true);
    window.addEventListener('click', onClickOutside);
  }, []);

  const onClickOutside = useCallback((event: MouseEvent) => {
    if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
      setActive(false);
      window.removeEventListener('click', onClickOutside);
    }
  }, []);

  const handleSelect = (item: any) => {
    setQuery(item[filterLabel]);
    setActive(false);
    onSelect(item);
  };

  const handleClear = () => {
    setQuery('');
    setActive(false);
    if (onClear) {
      onClear()
    }
  };

  return (
    <div className="relative w-full " ref={searchRef}>
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={onFocus}
          className="bg-blue-50 p-2 pr-7 pl-7 text-sm border border-gray-300 rounded-md w-full text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        />
        {query && (
          <FaTimes
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
          />
        )}
        <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 cursor-pointer hover:text-red-500" />
      </div>
      {active && (
        <ul className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <li
                key={item.id || index}
                className="p-2 border-b border-gray-300 dark:border-gray-600 last:border-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                onClick={() => handleSelect(item)}
              >
                {item[filterLabel]}
              </li>
            ))
          ) : (
            <li className="p-2 text-gray-500 dark:text-gray-400">No hay resultados</li>
          )}
        </ul>
      )}
    </div>
  );
};
