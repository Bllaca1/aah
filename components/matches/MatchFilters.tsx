import React, { useState, useEffect, ComponentType } from 'react';
import { GAMES } from '../../constants';
import { MatchTeamSize, ServerRegion } from '../../types';
import { Gamepad2, Users, Globe, Coins } from 'lucide-react';

interface MatchFiltersProps {
  onChange: (filters: { game: string; teamSize: string; region: string; wager: string; }) => void;
}

interface FilterOption {
    value: string;
    label: string;
    icon?: ComponentType<{ className?: string }>;
}

interface FilterButtonGroupProps {
    options: FilterOption[];
    selectedValue: string;
    onSelect: (value: string) => void;
}

const FilterButtonGroup: React.FC<FilterButtonGroupProps> = ({ options, selectedValue, onSelect }) => {
    return (
        <div className="flex flex-wrap gap-2">
            {options.map(({ value, label, icon: Icon }) => (
                <button
                    key={value}
                    onClick={() => onSelect(value)}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 ${
                        selectedValue === value
                        ? 'bg-brand-primary text-white shadow-lg'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                >
                    {Icon && <Icon className="h-4 w-4 mr-2" />}
                    {label}
                </button>
            ))}
        </div>
    );
};

const FilterCategory: React.FC<{ icon: React.ReactNode, label: string, children: React.ReactNode }> = ({ icon, label, children }) => (
    <div>
        <label className="flex items-center text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
            {icon}
            <span className="ml-2">{label}</span>
        </label>
        {children}
    </div>
);


const MatchFilters: React.FC<MatchFiltersProps> = ({ onChange }) => {
    const [filters, setFilters] = useState({
        game: 'all',
        wager: 'all',
        teamSize: 'all',
        region: 'all',
    });

    useEffect(() => {
        onChange(filters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };
    
    const gameOptions: FilterOption[] = [{ value: 'all', label: 'All' }, ...GAMES.map(g => ({ value: g.id, label: g.name, icon: g.icon }))];
    const wagerOptions: FilterOption[] = [
        { value: 'all', label: 'Any' },
        { value: '1-10', label: '1-10 C' },
        { value: '11-50', label: '11-50 C' },
        { value: '51-100', label: '51-100 C' },
        { value: '100+', label: '100+ C' },
    ];
    const teamSizeOptions: FilterOption[] = [{ value: 'all', label: 'All' }, ...Object.values(MatchTeamSize).map(s => ({ value: s, label: s }))];
    const regionOptions: FilterOption[] = [{ value: 'all', label: 'All' }, ...Object.values(ServerRegion).map(r => ({ value: r, label: r }))];

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FilterCategory icon={<Gamepad2 className="h-5 w-5 text-gray-500 dark:text-gray-400"/>} label="Game">
                    <FilterButtonGroup
                        options={gameOptions}
                        selectedValue={filters.game}
                        onSelect={(value) => handleFilterChange('game', value)}
                    />
                </FilterCategory>
                <FilterCategory icon={<Coins className="h-5 w-5 text-gray-500 dark:text-gray-400"/>} label="Wager">
                    <FilterButtonGroup
                        options={wagerOptions}
                        selectedValue={filters.wager}
                        onSelect={(value) => handleFilterChange('wager', value)}
                    />
                </FilterCategory>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FilterCategory icon={<Users className="h-5 w-5 text-gray-500 dark:text-gray-400"/>} label="Team Size">
                    <FilterButtonGroup
                        options={teamSizeOptions}
                        selectedValue={filters.teamSize}
                        onSelect={(value) => handleFilterChange('teamSize', value)}
                    />
                </FilterCategory>

                <FilterCategory icon={<Globe className="h-5 w-5 text-gray-500 dark:text-gray-400"/>} label="Region">
                     <FilterButtonGroup
                        options={regionOptions}
                        selectedValue={filters.region}
                        onSelect={(value) => handleFilterChange('region', value)}
                    />
                </FilterCategory>
            </div>
        </div>
    );
};

export default MatchFilters;