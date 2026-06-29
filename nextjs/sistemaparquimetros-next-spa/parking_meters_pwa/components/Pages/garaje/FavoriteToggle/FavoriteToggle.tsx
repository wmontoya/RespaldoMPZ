import {FaStar } from "react-icons/fa";

export const FavoriteToggle: React.FC<{ isFavorite?: boolean; onClick: () => void; }> = ({ isFavorite, onClick }) => {

    const IconComponent =  FaStar;
    const baseColor = isFavorite ? "orange" : "#233876";
    const hoverColor = isFavorite ? "gold" : "#1C64F2";
    const strokeColor = isFavorite ? "gray" : "black";
    const strokeWidth = isFavorite ? 15 : 12;

    return (
        <span
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            style={{
                cursor: "pointer",
                transition: "color 0.3s ease, opacity 0.3s ease",
                opacity: 0.9,
            }}
            onMouseEnter={(e: any) => (e.currentTarget.style.opacity = 1)}
            onMouseLeave={(e: any) => (e.currentTarget.style.opacity = 0.9)}
        >
            <IconComponent
                color={baseColor}
                size={30}
                style={{
                    stroke: strokeColor,
                    strokeWidth: strokeWidth,
                    transition: "color 0.3s ease",
                }}
                onMouseEnter={(e: { currentTarget: { style: { color: string; }; }; }) => (e.currentTarget.style.color = hoverColor)}
                onMouseLeave={(e: { currentTarget: { style: { color: string; }; }; }) => (e.currentTarget.style.color = baseColor)}
            />
        </span>
    );
};
