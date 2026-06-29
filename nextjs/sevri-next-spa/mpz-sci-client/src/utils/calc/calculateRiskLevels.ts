export const calculateRiskLevel = (riskLevel: number) => {
    if (riskLevel <= 3 || !riskLevel) return 'Bajo';
    if (riskLevel <= 6) return 'Medio';
    return 'Alto';
};

export const calculateNewRiskLevel = (probability: number, impact: number, aptitude: string, actitude: string) => {
    let riskLevel = probability * impact;
    if (aptitude === 'positive') riskLevel = Math.max(1, riskLevel - 1);
    if (aptitude === 'negative') riskLevel = Math.min(9, riskLevel + 1);
    if (actitude === 'positive') riskLevel = Math.max(1, riskLevel - 1);
    if (actitude === 'negative') riskLevel = Math.min(9, riskLevel + 1);
    return calculateRiskLevel(riskLevel);
};


export const parseRiskLevel = (riskLevel: string) => {
    switch (riskLevel) {
        case 'Bajo':
            return "low";
        case 'Medio':
            return "medium";
        case 'Alto':
            return "high";
        default:
            return 0;
    }
}