import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { createElement as h } from 'react';
import { useAuth } from './auth-context';
import { useAudit } from './audit-context'; // New
import { encryptData, decryptData } from '../core/crypto';
import { saveItem, getStore, deleteItem } from '../core/storage';
import { checkReuse, calculateHealthScore, calculateEntropy } from '../utils/security'; // New

const VaultContext = createContext();

export const VaultProvider = ({ children }) => {
    const { userKey } = useAuth();
    const { addLog } = useAudit(); // New hook
    const [vaultItems, setVaultItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [timeline, setTimeline] = useState([]);

    useEffect(() => {
        if (userKey) {
            loadVault();
        } else {
            setVaultItems([]);
        }
    }, [userKey]);

    useEffect(() => {
        if (userKey) {
            loadTimeline();
        }
    }, [userKey]);

    // Derived State for Analytics
    const reuseMap = useMemo(() => checkReuse(vaultItems), [vaultItems]);
    const healthScore = useMemo(() => calculateHealthScore(vaultItems, reuseMap), [vaultItems, reuseMap]);

    // Record snapshot when health score changes
    useEffect(() => {
        if (vaultItems.length > 0 && userKey) {
            const weakCount = vaultItems.filter(item => calculateEntropy(item.password) < 45).length;
            const reuseCount = Object.keys(reuseMap).length;
            recordSnapshot(healthScore, weakCount, reuseCount);
        }
    }, [healthScore, vaultItems.length, userKey]);

    const loadVault = async () => {
        setLoading(true);
        try {
            const encryptedItems = await getStore('vault');
            const decrypted = await Promise.all(encryptedItems.map(async (item) => {
                try {
                    const data = await decryptData(userKey, item.iv, item.data);
                    return { ...data, id: item.id, createdAt: item.createdAt, updatedAt: item.updatedAt || item.createdAt };
                } catch (e) {
                    console.error("Failed to decrypt item", item.id);
                    return null;
                }
            }));
            const validItems = decrypted.filter(Boolean);
            setVaultItems(validItems.sort((a, b) => b.createdAt - a.createdAt));
        } catch (e) {
            console.error("Load vault failed", e);
        }
        setLoading(false);
    };

    const loadTimeline = async () => {
        try {
            const snapshots = await getStore('timeline');
            setTimeline(snapshots.sort((a, b) => a.timestamp - b.timestamp));
        } catch (e) {
            console.error('Failed to load timeline', e);
        }
    };

    const recordSnapshot = async (score, weakCount, reuseCount) => {
        try {
            // Only record one snapshot per day
            const now = Date.now();
            const today = new Date(now).setHours(0, 0, 0, 0);

            const recentSnapshots = await getStore('timeline');
            const todaySnapshot = recentSnapshots.find(s => {
                const snapshotDay = new Date(s.timestamp).setHours(0, 0, 0, 0);
                return snapshotDay === today;
            });

            if (!todaySnapshot) {
                await saveItem('timeline', {
                    timestamp: now,
                    healthScore: score,
                    weakCount,
                    reuseCount
                });
                await loadTimeline();
            }
        } catch (e) {
            console.error('Failed to record snapshot', e);
        }
    };

    const addPassword = async (passwordData) => {
        if (!userKey) return;

        // Log event
        // Log event (Best effort)
        try {
            await addLog('create', `Added password for ${passwordData.title}`);
        } catch (e) { console.warn("Audit log failed", e); }

        const id = crypto.randomUUID();
        const timestamp = Date.now();
        const encrypted = await encryptData(userKey, passwordData);

        const itemToStore = {
            id,
            createdAt: timestamp,
            updatedAt: timestamp,
            iv: encrypted.iv,
            data: encrypted.data
        };

        await saveItem('vault', itemToStore);
        await loadVault();

        // Post-add check for weak password
        const entropy = calculateEntropy(passwordData.password);
        if (entropy < 40) {
            try {
                await addLog('warning', `Weak password detected for ${passwordData.title} (${Math.floor(entropy)} bits)`);
            } catch (e) { console.warn("Audit log failed", e); }
        }
    };

    const deletePassword = async (id) => {
        const item = vaultItems.find(i => i.id === id);
        if (item) {
            try {
                await addLog('delete', `Deleted password for ${item.title}`);
            } catch (e) { console.warn("Audit log failed", e); }
        }

        await deleteItem('vault', id);
        await loadVault();
    };

    return h(VaultContext.Provider, {
        value: {
            vaultItems,
            loading,
            addPassword,
            deletePassword,
            refreshVault: loadVault,
            reuseMap, // Exposed
            healthScore, // Exposed
            timeline // Exposed
        }
    }, children);
};

export const useVault = () => useContext(VaultContext);
