
import React, { useState, useEffect, useMemo } from 'react';
import { Pedido } from '../types';
import { useData } from '../context/DataContext';
import Icon from '../components/Icon';

// --- SUB-COMPONENTS ---

const TimeProgressBar: React.FC<{
    statusChangeTime: Date;
    statusDurationMinutes: number; // in minutes
}> = ({ statusChangeTime, statusDurationMinutes }) => {
    const [elapsed, setElapsed] = useState(0);
    const totalDuration = statusDurationMinutes * 60; // in seconds

    useEffect(() => {
        if (!statusChangeTime || totalDuration <= 0) {
            setElapsed(0);
            return;
        }

        const updateElapsed = () => {
            const elapsedSeconds = Math.floor((Date.now() - new Date(statusChangeTime).getTime()) / 1000);
            setElapsed(elapsedSeconds);
        };

        updateElapsed();
        const interval = setInterval(updateElapsed, 1000);

        return () => clearInterval(interval);
    }, [statusChangeTime, totalDuration]);

    const progress = totalDuration > 0 ? Math.min(100, (elapsed / totalDuration) * 100) : 0;
    const remainingSeconds = Math.max(0, totalDuration - elapsed);
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    let barColor = 'bg-green-500';
    if (progress > 70) barColor = 'bg-yellow-500';
    if (progress > 90) barColor = 'bg-red-500';

    if (totalDuration <= 0) return null;

    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-gray-600">Tempo Restante</span>
                <span className="text-sm font-bold text-gray-800">{`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className={`${barColor} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    );
};


const KitchenOrderCard: React.FC<{
    pedido: Pedido;
    onUpdateStatus: (id: string, status: Pedido['status']) => void;
    statusDuration: number;
}> = ({ pedido, onUpdateStatus, statusDuration }) => {
    const statusConfig = {
        pendente: { borderColor: '#3b82f6' },
        preparando: { borderColor: '#ea580c' },
        pronto: { borderColor: '#0891b2' },
        'em rota de entrega': { borderColor: '#4f46e5' },
    };

    const currentConfig = statusConfig[pedido.status as keyof typeof statusConfig] || { borderColor: '#6b7280' };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-5 space-y-4 border-l-8" style={{ borderColor: currentConfig.borderColor }}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-gray-800 text-lg">{pedido.cliente.nome}</p>
                    <p className="text-xs text-gray-500 font-mono">ID: {pedido.id.toUpperCase()}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-semibold">{pedido.itens.reduce((acc, i) => acc + i.quantidade, 0)} Itens</p>
                </div>
            </div>
            <div className="text-sm text-gray-700 space-y-2 max-h-32 overflow-y-auto pr-2 hide-scrollbar">
                {pedido.itens.map(({ item, quantidade, borda, tamanho }, i) => (
                    <div key={i}>
                        <p><span className="font-bold">{quantidade}x</span> {item.nome} {tamanho ? `(${tamanho})` : ''}</p>
                        {borda && <p className="text-xs text-orange-600 font-semibold pl-4">- Borda: {borda.nome}</p>}
                    </div>
                ))}
            </div>
            <div className="border-t border-gray-200 pt-3 space-y-3">
                <TimeProgressBar statusChangeTime={pedido.statusChangeTime} statusDurationMinutes={statusDuration} />
                
                {pedido.status === 'pendente' && (
                    <button onClick={() => onUpdateStatus(pedido.id, 'preparando')} className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                        <Icon name="chef-hat" className="w-5 h-5"/>
                        Iniciar Preparo
                    </button>
                )}
                {pedido.status === 'preparando' && (
                    <button onClick={() => onUpdateStatus(pedido.id, 'pronto')} className="w-full bg-green-600 text-white font-bold py-2.5 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                        <Icon name="pizza" className="w-5 h-5"/>
                        Marcar como Pronto
                    </button>
                )}
                 {pedido.status === 'pronto' && (
                    <button onClick={() => onUpdateStatus(pedido.id, 'em rota de entrega')} className="w-full bg-cyan-600 text-white font-bold py-2.5 rounded-lg hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2">
                        <Icon name="truck" className="w-5 h-5"/>
                        Enviar para Entrega
                    </button>
                )}
                {pedido.status === 'em rota de entrega' && (
                    <button onClick={() => onUpdateStatus(pedido.id, 'entregue')} className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                        <Icon name="check-circle-2" className="w-5 h-5"/>
                        Finalizar Entrega
                    </button>
                )}
            </div>
        </div>
    );
};

// --- MAIN COZINHA COMPONENT ---

export default function Cozinha() {
    const { pedidos, isLoading, updatePedidoStatus, pizzeriaInfo } = useData();

    const kitchenOrders = useMemo(() => {
        return pedidos.filter(p => ['pendente', 'preparando', 'pronto', 'em rota de entrega'].includes(p.status))
                      .sort((a, b) => new Date(a.created_date).getTime() - new Date(b.created_date).getTime());
    }, [pedidos]);

    const columns: Record<Pedido['status'], Pedido[]> = {
        pendente: [],
        preparando: [],
        pronto: [],
        'em rota de entrega': [],
        entregue: [],
        cancelado: [],
    };
    
    kitchenOrders.forEach(p => {
        if (columns[p.status]) {
            columns[p.status].push(p);
        }
    })

    const getOrderMaxTime = (pedido: Pedido): number => {
        const timingsForStatus = pizzeriaInfo.statusTimings[pedido.status];
        if (!timingsForStatus) return 0;

        const itemCategories = [...new Set(pedido.itens.map(i => i.item.categoria))];
        if (itemCategories.length === 0) return timingsForStatus['default'] || 0;
        
        const times = itemCategories.map(cat => timingsForStatus[cat] ?? timingsForStatus['default'] ?? 0);
        return Math.max(...times);
    };

    const renderColumn = (title: string, status: Pedido['status'], orders: Pedido[], color: string) => (
        <div className="bg-gray-100/70 rounded-3xl p-5 flex-1 min-w-[320px]">
            <h2 className={`text-2xl font-extrabold mb-5 flex items-center gap-3 ${color}`}>
                <div className="w-3 h-3 rounded-full bg-current" />
                {title}
                <span className="bg-gray-200 text-gray-700 text-sm font-bold px-3 py-1 rounded-full">{orders.length}</span>
            </h2>
            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => <div key={i} className="animate-pulse bg-white/80 rounded-2xl h-60"></div>)}
                </div>
            ) : (
                <div className="space-y-4 h-[calc(100vh-220px)] overflow-y-auto hide-scrollbar pr-2">
                    {orders.map(pedido => (
                        <KitchenOrderCard
                            key={pedido.id}
                            pedido={pedido}
                            onUpdateStatus={updatePedidoStatus}
                            statusDuration={getOrderMaxTime(pedido)}
                        />
                    ))}
                     {orders.length === 0 && (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500 font-medium">Nenhum pedido aqui.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <div className="p-6 h-full flex flex-col bg-gradient-to-br from-orange-50/10 to-red-50/10">
            <div className="space-y-1 mb-6">
                <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                    <Icon name="chef-hat" className="w-8 h-8 text-orange-600"/>
                    Visão de Operações
                </h1>
                <p className="text-gray-600 text-lg">Acompanhe os pedidos em tempo real da pendência à entrega.</p>
            </div>
            <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
                {renderColumn('Pendente', 'pendente', columns['pendente'], 'text-blue-600')}
                {renderColumn('Em Preparo', 'preparando', columns['preparando'], 'text-orange-600')}
                {renderColumn('Pronto', 'pronto', columns['pronto'], 'text-cyan-600')}
                {renderColumn('Em Rota', 'em rota de entrega', columns['em rota de entrega'], 'text-indigo-600')}
            </div>
        </div>
    );
}
