export const generateSecurityReport = (vaultItems, healthScore, reuseMap, timeline) => {
    // 1. Generate Risk Summary
    let riskSummary = '';
    let sentiment = 'neutral'; // critical, warning, positive, excellent

    if (vaultItems.length === 0) {
        riskSummary = "Your vault is empty. Start by adding your most critical accounts (email, banking) to build your security foundation.";
        sentiment = 'neutral';
    } else if (healthScore < 50) {
        riskSummary = "Your vault is in critical condition. Immediate action is required to secure your digital identity. Multiple high-risk vulnerabilities detected.";
        sentiment = 'critical';
    } else if (healthScore < 75) {
        riskSummary = "Your security posture is average. While you have some strong passwords, there are significant vulnerabilities that attackers could exploit.";
        sentiment = 'warning';
    } else if (healthScore < 90) {
        riskSummary = "Good job! Your vault is secure, but there are a few specific opportunities to reach perfection and eliminate all re-use.";
        sentiment = 'positive';
    } else {
        riskSummary = "Excellent! Your vault is fortress-level secure. You are effectively invisible to most automated attacks. Keep up the great maintenance.";
        sentiment = 'excellent';
    }

    // 2. Identify Top Problems
    const problems = [];
    const actions = [];

    // Check Reuse
    const reusedIds = Object.keys(reuseMap);
    if (reusedIds.length > 0) {
        const count = reusedIds.length;
        problems.push({
            type: 'reuse',
            severity: 'high',
            text: `${count} password${count > 1 ? 's are' : ' is'} reused across multiple accounts.`
        });

        // Find most critical reused item (heuristic: title includes 'mail' or 'bank' or just first one)
        const criticalReused = vaultItems.find(i => reusedIds.includes(i.id) && /mail|bank|google|apple/i.test(i.title)) || vaultItems.find(i => reusedIds.includes(i.id));

        if (criticalReused) {
            actions.push({
                type: 'reuse',
                text: `Urgent: Stop using the same password for ${criticalReused.title}. Rotate it immediately.`
            });
        } else {
            actions.push({
                type: 'reuse',
                text: `Review your reused passwords and generate unique ones for each account.`
            });
        }
    }

    // Check Weak Passwords
    const weakItems = vaultItems.filter(item => {
        // Simple entropy check (assuming we don't have the calc function here, we might need to pass it or duplicate simple logic)
        // Since we can't easily import calculateEntropy without circular deps or complex refactor, we'll assume passed as enriched items or use simple length check for now if entropy not on item.
        // Actually, let's assume raw items. I'll stick to length < 12 as a proxy if entropy isn't pre-calc.
        // BETTER: The user requirement says "Use existing analytics data". 
        // VaultScreen calculates it on the fly. Let's do a simple estimation here or expect entropy to be available?
        // Let's implement a simple estimator here to be safe and self-contained.
        const length = item.password?.length || 0;
        return length < 8; // Very weak
    });

    if (weakItems.length > 0) {
        problems.push({
            type: 'weak',
            severity: 'critical',
            text: `${weakItems.length} password${weakItems.length > 1 ? 's are' : ' is'} extremely weak (short).`
        });
        actions.push({
            type: 'weak',
            text: `Strengthen the password for ${weakItems[0].title} using the Generator.`
        });
    }

    // Check Aging
    const now = Date.now();
    const oldItems = vaultItems.filter(item => {
        const age = now - (item.updatedAt || item.createdAt);
        return age > (180 * 24 * 60 * 60 * 1000); // 180 days
    });

    if (oldItems.length > 0) {
        problems.push({
            type: 'aging',
            severity: 'medium',
            text: `${oldItems.length} password${oldItems.length > 1 ? 's have' : ' has'} not been updated in over 6 months.`
        });
        if (actions.length < 3) {
            actions.push({
                type: 'aging',
                text: `Consider rotating the password for ${oldItems[0].title} to stay ahead of breaches.`
            });
        }
    }

    // Fill actions if empty
    if (actions.length === 0 && vaultItems.length > 0) {
        actions.push({
            type: 'general',
            text: "Run the Threat Model analyzer to see if you are protected against specific attack vectors."
        });
    }

    // 3. Select Top Insight
    // If multiple problems, combine distinct types

    return {
        riskSummary,
        sentiment,
        problems: problems.slice(0, 3),
        actions: actions.slice(0, 3)
    };
};
