import { createContext, useContext, useState, useEffect } from 'react';
import { createElement as h } from 'react';
import { saveItem, getStore, clearStore } from '../core/storage';

const AuditContext = createContext();

export const AuditProvider = ({ children }) => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const logs = await getStore('audit');
            // Sort new to old
            setEvents(logs.sort((a, b) => b.timestamp - a.timestamp));
        } catch (e) {
            console.error("Failed to load audit logs", e);
        }
    };

    const addLog = async (type, msg) => {
        const log = {
            timestamp: Date.now(),
            type,
            msg,
            timeString: new Date().toLocaleTimeString() + ' - ' + new Date().toLocaleDateString()
        };
        await saveItem('audit', log);
        await loadEvents();
    };

    return h(AuditContext.Provider, {
        value: {
            events,
            addLog,
            clearLogs: async () => {
                try {
                    await clearStore('audit');
                    await addLog('warning', 'Audit log cleared by user');
                } catch (e) {
                    console.error("Failed to clear logs", e);
                }
            }
        }
    }, children);
};

export const useAudit = () => useContext(AuditContext);
