import { createContext, useContext, useMemo } from 'react';
import { createElement as h } from 'react';
import { useVault } from './vault-context';

const GamificationContext = createContext();

export const GamificationProvider = ({ children }) => {
    const { vaultItems, reuseMap, healthScore } = useVault();

    const stats = useMemo(() => {
        // 1. XP / Leveling
        const getStrength = (pwd) => {
            if (!pwd) return 0;
            let score = 0;
            if (pwd.length > 8) score += 1;
            if (pwd.length > 12) score += 1;
            if (/[A-Z]/.test(pwd)) score += 1;
            if (/[0-9]/.test(pwd)) score += 1;
            if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
            return score;
        };

        const totalXP = vaultItems.reduce((acc, item) => {
            return acc + (getStrength(item.password) * 50);
        }, 0);

        const level = 1 + Math.floor(totalXP / 1000);
        const nextLevelXP = level * 1000;
        const currentLevelStartXP = (level - 1) * 1000;
        const progressInLevel = totalXP - currentLevelStartXP;
        const widthPercent = Math.min(100, Math.max(0, (progressInLevel / 1000) * 100));

        // 2. Readiness Checklist
        const now = Date.now();
        const ninetyDays = 90 * 24 * 60 * 60 * 1000;

        const hasNoReuse = Object.keys(reuseMap).length === 0;

        // Use Health Score > 80 as proxy for "No Weak" + "Good Hygiene"
        // Also check explicitly for very old passwords
        const hasNoOld = !vaultItems.some(i => (now - (i.updatedAt || i.createdAt)) > ninetyDays);
        const isHealthy = healthScore >= 80;
        const hasVolume = vaultItems.length >= 5;

        const checklist = [
            { id: 'reuse', label: 'No Reused Passwords', met: hasNoReuse },
            { id: 'weak', label: 'Vault Health > 80', met: isHealthy },
            { id: 'old', label: 'No Old Passwords (>90d)', met: hasNoOld },
            { id: 'volume', label: 'At least 5 Items', met: hasVolume }
        ];

        const completedCount = checklist.filter(i => i.met).length;
        const readinessPercent = Math.floor((completedCount / checklist.length) * 100);

        return {
            totalXP,
            level,
            nextLevelXP,
            progressInLevel,
            widthPercent,
            readiness: {
                percent: readinessPercent,
                checklist,
                isReady: readinessPercent === 100
            }
        };
    }, [vaultItems, reuseMap, healthScore]);

    return h(GamificationContext.Provider, { value: stats }, children);
};

export const useGamification = () => useContext(GamificationContext);
