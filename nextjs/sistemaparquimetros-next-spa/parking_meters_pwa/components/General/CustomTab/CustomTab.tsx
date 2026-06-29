import { useState, ReactNode, ReactElement } from 'react';

interface Tab {
  label: string;
  icon?: ReactElement;
  isDisabled?: boolean;
}

interface CustomTabProps {
  tabs: Tab[];
  children: ReactNode[];
  onTabChange?: (index: number) => void;
}

export const CustomTab = ({ tabs, children,onTabChange }: CustomTabProps) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabClick = (index: number, isDisabled?: boolean) => {
    if (!isDisabled) {
      setActiveTab(index);
      if (onTabChange) {
        onTabChange(index);
      }
    }
  };

  return (
    <>
      <ul className="flex w-full text-sm font-medium text-center text-gray-300 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400 gap-2">
        {tabs.map((tab, index) => (
          <li key={tab.label} className="flex-grow ">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleTabClick(index, tab.isDisabled);
              }}
              className={`flex justify-center items-center w-full px-2 py-3 rounded-t-lg ${tab.isDisabled
                ? 'text-gray-500 cursor-not-allowed dark:text-gray-500'
                : index === activeTab
                  ? 'text-white font-bold bg-blue-700'
                  : 'text-white font-light bg-blue-900 hover:bg-blue-500 dark:hover:bg-blue-500'
                }`}
              aria-current={index === activeTab ? 'page' : undefined}
            >
              {tab.icon && (
                <span className="mr-1">
                  {tab.icon}
                </span>
              )}
              {tab.label}
            </a>
          </li>
        ))}
      </ul>

      <div className="mt-4">
        {children[activeTab]}
      </div>
    </>
  );
};
