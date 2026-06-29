import { FaPlus } from "react-icons/fa";
import { IconType } from "react-icons";

interface CustomButtonProps {
    onClick: () => void;
    actionButton?: string;
    color: "blue" | "red" | "green" | "gray" | "grayoutline";
    Icon?: IconType;
    buttonKey?: any;
    className?:string;
    iconClassName?:string;
}

const colorClasses = {
    blue: "bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800",
    red: "bg-red-700 hover:bg-red-800 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800",
    green: "bg-green-700 hover:bg-green-800 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800",
    gray: "bg-gray-500 hover:bg-gray-800 focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800",
    grayoutline: "bg-blue-900 text-white hover:bg-blue-600 focus:ring-gray-300 dark:bg-gray-700 dark:text-yellow-400 dark:hover:bg-gray-600 dark:focus:ring-gray-700"
};

export const CustomButton = ({ onClick, actionButton, color, Icon = FaPlus, buttonKey,className, iconClassName="mr-2" }: CustomButtonProps) => (
    <button
        key={buttonKey}
        onClick={onClick}
        type="button"
        className={`flex items-center text-white font-medium rounded-lg text-sm focus:outline-none focus:ring-4 ${colorClasses[color]} ${className}`}
    >
        <Icon size={20} className={`${iconClassName}`} />
        {actionButton && (actionButton)}
    </button>
);
