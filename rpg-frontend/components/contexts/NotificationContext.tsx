'use client';
import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';

interface Notification {
    texto: string;
    tipo: 'sucesso' | 'erro';
    id: number;
}

interface NotificationContextType {
    showNotification: (texto: string, tipo: 'sucesso' | 'erro') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification deve ser usado dentro de um NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    
    // MEMÓRIA PARA EVITAR DUPLICATAS
    const lastNotification = useRef<{ text: string, time: number } | null>(null);

    const showNotification = (texto: string, tipo: 'sucesso' | 'erro') => {
        const now = Date.now();

        // TRAVA DE SEGURANÇA: Se a mesma mensagem apareceu há menos de 1 segundo, ignora.
        if (lastNotification.current && 
            lastNotification.current.text === texto && 
            (now - lastNotification.current.time) < 1000) {
            return;
        }

        // Atualiza a memória
        lastNotification.current = { text: texto, time: now };

        const id = now;
        const newNotification = { texto, tipo, id };
        
        setNotifications(prev => [...prev, newNotification]);

        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 4000);
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            
            <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
                {notifications.map(n => (
                    <div 
                        key={n.id} 
                        className={`pointer-events-auto px-6 py-4 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] font-bold text-white min-w-[320px] animate-in fade-in slide-in-from-right-20 duration-300 flex items-center gap-4 border-l-8 transform hover:scale-105 transition-transform ${
                            n.tipo === 'sucesso' 
                                ? 'bg-emerald-600 border-emerald-300' 
                                : 'bg-rose-600 border-rose-300'
                        }`}
                    >
                        <span className="text-2xl drop-shadow-md">{n.tipo === 'sucesso' ? '✨' : '🚫'}</span>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-black tracking-widest opacity-80">
                                {n.tipo === 'sucesso' ? 'SUCESSO' : 'ERRO'}
                            </span>
                            <span className="text-sm font-medium leading-tight">{n.texto}</span>
                        </div>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
};