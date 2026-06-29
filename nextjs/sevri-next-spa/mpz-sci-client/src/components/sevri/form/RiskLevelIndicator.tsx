import { BsShieldCheck, BsShieldExclamation, BsShieldX } from "react-icons/bs";
import { motion } from "framer-motion";

export const RiskLevelIndicator = ({ label, level }: { label: string; level: string }) => {
    const getStyles = () => {
        switch (level) {
            case "Bajo":
                return {
                    bg: "from-green-100 to-green-200 text-green-800 border-green-300 shadow-green-100",
                    icon: <BsShieldCheck className="text-green-600 text-xl" />,
                };
            case "Medio":
                return {
                    bg: "from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300 shadow-yellow-100",
                    icon: <BsShieldExclamation className="text-yellow-600 text-xl" />,
                };
            case "Alto":
                return {
                    bg: "from-red-100 to-red-200 text-red-800 border-red-300 shadow-red-100",
                    icon: <BsShieldX className="text-red-600 text-xl" />,
                };
            default:
                return {
                    bg: "from-gray-100 to-gray-200 text-gray-700 border-gray-300 shadow-gray-100",
                    icon: null,
                };
        }
    }; 

    const { bg, icon } = getStyles();

    return (
        <div className="w-full">
            <p className={`text-sm font-medium mb-1 ${level === "Bajo" ? "text-green-700" : level === "Medio" ? "text-yellow-700" : level === "Alto" ? "text-red-700" : "text-gray-700"}`}>
                {label}
            </p>
            <motion.div
                key={level}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border bg-gradient-to-br ${bg} ${level !== "Desconocido" ? "shadow-md" : ""}`}
            >
                {icon}
                <span className="font-semibold text-sm select-none">{level}</span>
            </motion.div>
        </div>
    );
};
