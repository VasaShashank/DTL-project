// Detect repeated substrings (e.g., "likeboys" repeated in "likeboyslikeboyslikeboys")
export const detectRepeatedSubstrings = (password) => {
    if (!password || password.length < 6) return null;

    const len = password.length;
    const pwd = password.toLowerCase();

    // Try substring lengths from 3 to half the password length
    for (let subLen = 3; subLen <= Math.floor(len / 2); subLen++) {
        const substring = pwd.substring(0, subLen);

        // Check if the password is mostly made of this substring repeated
        let count = 0;
        let pos = 0;

        while (pos < len) {
            if (pwd.substring(pos, pos + subLen) === substring) {
                count++;
                pos += subLen;
            } else {
                break;
            }
        }

        // If we found 2+ repetitions covering most of the password
        const coverage = (count * subLen) / len;
        if (count >= 2 && coverage >= 0.7) {
            return {
                pattern: substring,
                count: count,
                coverage: Math.round(coverage * 100)
            };
        }
    }

    return null;
};

// Shannon entropy calculation
export const calculateEntropy = (password) => {
    if (!password) return 0;

    const len = password.length;
    let pool = 0;

    if (/[a-z]/.test(password)) pool += 26;
    if (/[A-Z]/.test(password)) pool += 26;
    if (/[0-9]/.test(password)) pool += 10;
    if (/[^a-zA-Z0-9]/.test(password)) pool += 32;

    if (pool === 0) return 0;

    // Entropy = L * log2(pool)
    return Math.floor(len * Math.log2(pool));
};

// Calculate effective entropy with pattern penalties
export const calculateEffectiveEntropy = (password) => {
    if (!password) return 0;

    let entropy = calculateEntropy(password);
    let penaltyFactor = 1.0; // Start with no penalty

    // 1. Repeated substring penalty
    const repeatedPattern = detectRepeatedSubstrings(password);
    if (repeatedPattern) {
        if (repeatedPattern.count >= 3) {
            penaltyFactor *= 0.3; // 70% reduction for 3+ repetitions
        } else if (repeatedPattern.count === 2) {
            penaltyFactor *= 0.6; // 40% reduction for 2 repetitions
        }
    }

    // 2. Dictionary word penalty
    const pwd = password.toLowerCase();
    const commonWords = ['password', 'admin', 'user', 'login', 'welcome', 'letmein', 'monkey', 'dragon', 'master'];
    for (const word of commonWords) {
        if (pwd.includes(word)) {
            penaltyFactor *= 0.7; // 30% reduction
            break;
        }
    }

    // 3. Sequential pattern penalty
    const sequences = ['123', '234', '345', '456', '567', '678', '789', 'abc', 'bcd', 'cde'];
    for (const seq of sequences) {
        if (pwd.includes(seq)) {
            penaltyFactor *= 0.8; // 20% reduction
            break;
        }
    }

    return Math.floor(entropy * penaltyFactor);
};

export const estimateCrackTime = (entropy) => {
    if (entropy < 28) return 'Instantly';
    if (entropy < 40) return 'Seconds to Minutes';
    if (entropy < 50) return 'Hours to Days';
    if (entropy < 65) return 'Weeks to Months';
    if (entropy < 80) return 'Years';
    return 'Centuries+';
};

export const checkReuse = (vaultItems) => {
    const counts = {};
    const reuseMap = {};

    vaultItems.forEach(item => {
        const pwd = item.password;
        if (!pwd) return;
        counts[pwd] = (counts[pwd] || 0) + 1;
    });

    vaultItems.forEach(item => {
        if (counts[item.password] > 1) {
            reuseMap[item.id] = counts[item.password];
        }
    });

    return reuseMap;
};

export const calculateHealthScore = (vaultItems, reuseMap) => {
    if (!vaultItems || vaultItems.length === 0) return 100;

    let score = 100;
    const total = vaultItems.length;

    // 1. Deduct for weak passwords (< 50 bits entropy)
    const weakCount = vaultItems.filter(item => calculateEntropy(item.password) < 50).length;
    score -= (weakCount / total) * 40; // Max 40 points lost for weak passwords

    // 2. Deduct for reused passwords
    const reusedIds = Object.keys(reuseMap);
    if (reusedIds.length > 0) {
        // Reuse penalty: more reused items = lower score
        score -= Math.min(30, reusedIds.length * 5); // Max 30 points lost
    }

    // 3. Deduct for old passwords (> 90 days)
    const ninetyDays = 90 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const oldItems = vaultItems.filter(item => (now - (item.updatedAt || item.createdAt)) > ninetyDays).length; // Use updatedAt
    score -= (oldItems / total) * 20; // Max 20 points lost

    // 4. Bonus/Penalty for very empty or very good vault
    if (total < 3) score -= 10; // Encourages adding more items

    return Math.max(0, Math.floor(score));
};

const AGE_THRESHOLDS = {
    warning: 90 * 24 * 60 * 60 * 1000, // 90 days
    danger: 365 * 24 * 60 * 60 * 1000  // 1 year
};

export const getSmartTips = (healthScore, reuseMap, vaultItems) => {
    const tips = [];
    const now = Date.now();

    // 1. Critical: Existing Reuse
    const reusedCount = Object.keys(reuseMap).length;
    if (reusedCount > 0) {
        tips.push({
            type: 'danger',
            title: reusedCount === 1 ? 'reuse detected' : `${reusedCount} Reused Passwords`,
            msg: `You have ${reusedCount} accounts sharing passwords. One breach could expose them all.`
        });
    }

    // 2. Critical: Very Old Passwords (> 1 Year)
    const veryOldItems = vaultItems.filter(i => (now - (i.updatedAt || i.createdAt)) > AGE_THRESHOLDS.danger);
    if (veryOldItems.length > 0) {
        tips.push({
            type: 'danger',
            title: 'Ancient Passwords Detected',
            msg: `${veryOldItems.length} passwords are over a year old. Rotate them immediately.`
        });
    }

    // 3. Warning: General Health
    if (healthScore < 50) {
        tips.push({
            type: 'warning',
            title: 'Weak Overall Hygiene',
            msg: 'Your vault health is critical. Prioritize updating weak passwords.'
        });
    }

    // 4. Warning: Weak Cryptography
    const weakItems = vaultItems.filter(i => calculateEntropy(i.password) < 40);
    if (weakItems.length > 0) {
        tips.push({
            type: 'warning',
            title: 'Strengthen Weak Passwords',
            msg: `${weakItems.length} passwords are easily crackable. Aim for > 50 bits of entropy.`
        });
    }

    // 5. Info: Rotation Recommended (> 90 Days)
    const oldItems = vaultItems.filter(i => {
        const age = now - (i.updatedAt || i.createdAt);
        return age > AGE_THRESHOLDS.warning && age <= AGE_THRESHOLDS.danger;
    });

    if (oldItems.length > 0) {
        tips.push({
            type: 'info',
            title: 'Rotation Suggested',
            msg: `${oldItems.length} passwords haven't been changed in 3 months.`
        });
    }

    // 6. Success State
    if (tips.length === 0) {
        tips.push({
            type: 'success',
            title: 'Great Job!',
            msg: 'Your password hygiene is excellent. Keep it up!'
        });
    }

    return tips;
};

// Common dictionary words for detection
const COMMON_WORDS = [
    'password', 'admin', 'user', 'login', 'welcome', 'letmein', 'monkey',
    'dragon', 'master', 'sunshine', 'princess', 'football', 'shadow',
    'michael', 'jennifer', 'computer', 'baseball', 'jordan', 'harley'
];

// Password weakness explainability engine
export const explainWeakness = (password) => {
    if (!password) return [];

    const weaknesses = [];
    const pwd = password.toLowerCase();
    const entropy = calculateEntropy(password);

    // 1. Length check
    if (password.length < 8) {
        weaknesses.push({
            type: 'length',
            severity: 'critical',
            message: `Only ${password.length} characters long. Passwords should be at least 12 characters.`
        });
    } else if (password.length < 12) {
        weaknesses.push({
            type: 'length',
            severity: 'warning',
            message: `${password.length} characters is below the recommended 12+ character minimum.`
        });
    }

    // 2. Entropy check
    if (entropy < 28) {
        weaknesses.push({
            type: 'entropy',
            severity: 'critical',
            message: `Extremely low randomness (${entropy} bits). Can be cracked instantly.`
        });
    } else if (entropy < 40) {
        weaknesses.push({
            type: 'entropy',
            severity: 'warning',
            message: `Low randomness (${entropy} bits). Vulnerable to brute-force attacks.`
        });
    }

    // 2.5. Repeated word/phrase pattern detection (NEW)
    const repeatedPattern = detectRepeatedSubstrings(password);
    if (repeatedPattern) {
        const severity = repeatedPattern.count >= 3 ? 'critical' : 'warning';
        weaknesses.push({
            type: 'repetition',
            severity: severity,
            message: `Contains repeated pattern "${repeatedPattern.pattern}" ${repeatedPattern.count} times (${repeatedPattern.coverage}% of password). This drastically reduces security.`
        });
    }

    // 3. Dictionary word detection
    for (const word of COMMON_WORDS) {
        if (pwd.includes(word)) {
            weaknesses.push({
                type: 'dictionary',
                severity: 'critical',
                message: `Contains common word "${word}". Easily guessed by attackers.`
            });
            break; // Only report first match
        }
    }

    // 4. Sequential patterns
    const sequences = ['123', '234', '345', '456', '567', '678', '789', 'abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'xyz'];
    for (const seq of sequences) {
        if (pwd.includes(seq)) {
            weaknesses.push({
                type: 'pattern',
                severity: 'warning',
                message: `Contains sequential pattern "${seq}". Predictable and easy to guess.`
            });
            break;
        }
    }

    // 5. Keyboard patterns
    const keyboardPatterns = ['qwerty', 'asdf', 'zxcv', 'qazwsx', '1qaz2wsx'];
    for (const pattern of keyboardPatterns) {
        if (pwd.includes(pattern)) {
            weaknesses.push({
                type: 'pattern',
                severity: 'warning',
                message: `Contains keyboard pattern "${pattern}". Common and easily cracked.`
            });
            break;
        }
    }

    // 6. Repeated characters
    const repeatedMatch = password.match(/(.)\1{2,}/);
    if (repeatedMatch) {
        const char = repeatedMatch[1];
        const count = repeatedMatch[0].length;
        weaknesses.push({
            type: 'repetition',
            severity: 'warning',
            message: `Character "${char}" repeated ${count} times. Reduces password strength.`
        });
    }

    // 7. Predictable structure (word + numbers at end)
    const wordNumberPattern = /^[a-zA-Z]+\d+$/;
    if (wordNumberPattern.test(password) && password.length < 15) {
        weaknesses.push({
            type: 'structure',
            severity: 'warning',
            message: `Predictable structure: word followed by numbers. Common pattern attackers try first.`
        });
    }

    // 8. Only lowercase or only uppercase
    if (password === pwd) {
        weaknesses.push({
            type: 'charset',
            severity: 'info',
            message: `Only lowercase letters. Add uppercase, numbers, and symbols for better security.`
        });
    } else if (password === password.toUpperCase()) {
        weaknesses.push({
            type: 'charset',
            severity: 'info',
            message: `Only uppercase letters. Mix case and add numbers/symbols for better security.`
        });
    }

    // 9. No special characters
    if (!/[^a-zA-Z0-9]/.test(password)) {
        weaknesses.push({
            type: 'charset',
            severity: 'info',
            message: `No special characters. Adding symbols (!@#$%^&*) significantly increases strength.`
        });
    }

    return weaknesses;
};

// Calculate radar chart metrics (all normalized to 0-100 scale)
export const calculateRadarMetrics = (vaultItems, reuseMap) => {
    if (!vaultItems || vaultItems.length === 0) {
        return {
            entropy: 100,
            reuse: 100,
            aging: 100,
            breachRisk: 100,
            health: 100
        };
    }

    const now = Date.now();
    const ninetyDays = 90 * 24 * 60 * 60 * 1000;

    // 1. Entropy Score (average password strength)
    const avgEntropy = vaultItems.reduce((sum, item) => sum + calculateEntropy(item.password), 0) / vaultItems.length;
    const entropyScore = Math.min(100, (avgEntropy / 80) * 100); // 80 bits = 100%

    // 2. Reuse Score (inverse of reuse percentage)
    const reuseCount = Object.keys(reuseMap).length;
    const reusePercentage = (reuseCount / vaultItems.length) * 100;
    const reuseScore = Math.max(0, 100 - reusePercentage);

    // 3. Aging Score (based on password freshness)
    const oldPasswords = vaultItems.filter(item => (now - (item.updatedAt || item.createdAt)) > ninetyDays).length;
    const agingPercentage = (oldPasswords / vaultItems.length) * 100;
    const agingScore = Math.max(0, 100 - agingPercentage);

    // 4. Breach Risk Score (inverse of common password usage)
    let commonPasswordCount = 0;
    vaultItems.forEach(item => {
        const pwd = item.password.toLowerCase();
        for (const word of COMMON_WORDS) {
            if (pwd.includes(word)) {
                commonPasswordCount++;
                break;
            }
        }
    });
    const breachPercentage = (commonPasswordCount / vaultItems.length) * 100;
    const breachRiskScore = Math.max(0, 100 - breachPercentage);

    // 5. Health Score (use existing calculation)
    const healthScore = calculateHealthScore(vaultItems, reuseMap);

    return {
        entropy: Math.round(entropyScore),
        reuse: Math.round(reuseScore),
        aging: Math.round(agingScore),
        breachRisk: Math.round(breachRiskScore),
        health: healthScore
    };
};


