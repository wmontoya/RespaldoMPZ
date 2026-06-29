import React from "react";
import { FaSearch } from 'react-icons/fa';

interface SearchInputProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({ searchTerm, onSearchChange }) => {
    return (
        <div className="relative flex-grow flex items-center max-w-lg mr-4">
            <input
                type="text"
                className="block w-full p-2 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 h-[40px] "
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <FaSearch className="text-gray-500 dark:text-gray-300" />
            </div>
        </div>
    );
};
