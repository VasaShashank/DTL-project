import { createContext, useContext, useState, useEffect } from 'react';
import { createElement as h } from 'react';
import { deriveKey, encryptData, decryptData, generateSalt } from '../core/crypto';
import { saveItem, getItem } from '../core/storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userKey, setUserKey] = useState(null);
    const [isSetup, setIsSetup] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkSetup();
    }, []);

    const checkSetup = async () => {
        try {
            const salt = await getItem('meta', 'salt');
            if (salt) {
                setIsSetup(true);
            }
        } catch (e) {
            console.error("Storage error", e);
        }
        setIsLoading(false);
    };

    const signup = async (password) => {
        const salt = generateSalt();
        const key = await deriveKey(password, salt);

        const verifier = await encryptData(key, { check: 'VALID' });

        await saveItem('meta', salt, 'salt');
        await saveItem('meta', verifier, 'verifier');

        setUserKey(key);
        setIsSetup(true);
        return true;
    };

    const login = async (password) => {
        try {
            const salt = await getItem('meta', 'salt');
            const verifier = await getItem('meta', 'verifier');

            if (!salt || !verifier) return false;

            const key = await deriveKey(password, salt);
            const decrypted = await decryptData(key, verifier.iv, verifier.data);

            if (decrypted.check === 'VALID') {
                setUserKey(key);
                return true;
            }
            return false;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    const logout = () => {
        setUserKey(null);
    };

    const panicLock = async (addLog) => {
        // Instant lock - clear userKey immediately
        setUserKey(null);

        // Log the emergency lock event (best effort)
        if (addLog) {
            try {
                await addLog('warning', 'Emergency lock activated');
            } catch (e) {
                console.warn('Failed to log panic lock', e);
            }
        }
    };

    return h(AuthContext.Provider, {
        value: {
            userKey,
            isSetup,
            isLoading,
            signup,
            login,
            logout,
            panicLock
        }
    }, children);
};

export const useAuth = () => useContext(AuthContext);
