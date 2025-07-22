
import React, { useState, useMemo } from 'react';
import { Mesa } from '../types';
import { useData } from '../context/DataContext';
import Icon from '../components/Icon';

type TableStatus = Mesa['status'];

const STATUS_CONFIG: Record<TableStatus, { label: string; color: string; icon: string }> = {
    livre: { label: 'Livre', color: 'bg-green-500 border-green-700 text-white', icon: 'check-circle' },
    ocupada: { label: 'Ocupada', color: 'bg-red-500 border-red-700 text-white', icon: 'users' },
    reservada: { label: 'Reservada', color: 'bg-yellow-400 border-yellow-600 text-white', icon: 'bookmark' },
};

// --- SUB-COMPONENTS ---

const StatusFilter: React.FC<{
    selected: 'todos' | TableStatus;
    onSelect: (status: 'todos' | TableStatus) => void;
}> = ({ selected, onSelect }) => (
    <div className="flex justify-center flex-wrap gap-3">
        <button onClick={() => onSelect('todos')} className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${selected === 'todos' ? 'bg-red-600 text-white shadow-lg' : 'bg-white hover:bg-red-100'}`}>
            Todas
        </button>
        {Object.entries(STATUS_CONFIG).map(([status, { label }]) => (
            <button key={status} onClick={() => onSelect(status as TableStatus)} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${selected === status ? 'bg-red-600 text-white shadow-lg' : 'bg-white hover:bg-red-100'}`}>
                {label}
            </button>
        ))}
    </div>
);

const TableCard: React.FC<{ mesa: Mesa; onSelect: (mesa: Mesa) => void }> = ({ mesa, onSelect }) => {
    const config = STATUS_CONFIG[mesa.status];
    return (
        <div onClick={() => onSelect(mesa)} className={`relative p-6 rounded-3xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl ${config.color} border-b-8`} style={{borderColor: config.color.split(' ')[1]}}>
            <div className="flex justify-between items-center text-white">
                <span className="text-4xl font-extrabold">{mesa.numero}</span>
                <Icon name={config.icon} className="w-8 h-8 opacity-70" />
            </div>
            <div className="mt-4 text-white">
                <p className="font-bold">{config.label}</p>
                <p className="text-sm opacity-80">{mesa.capacidade} lugares</p>
            </div>
        </div>
    );
};

const TableEditModal: React.FC<{
    mesa: Mesa | null;
    onClose: () => void;
    onSave: (mesaId: number, newStatus: TableStatus) => void;
}> = ({ mesa, onClose, onSave }) => {
    if (!mesa) return null;

    const handleSave = (newStatus: TableStatus) => {
        onSave(mesa.id, newStatus);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <header className="p-6 border-b flex flex-col items-center">
                    <h2 className="text-3xl font-bold text-gray-800">Mesa {mesa.numero}</h2>
                    <p className="text-gray-500">{mesa.capacidade} lugares</p>
                </header>
                <main className="p-6 space-y-3">
                    <p className="text-center text-sm font-semibold text-gray-600 uppercase">Alterar Status</p>
                    {Object.entries(STATUS_CONFIG).map(([status, { label, color }]) => (
                        <button key={status} onClick={() => handleSave(status as TableStatus)} className={`w-full py-4 rounded-xl font-bold text-lg transition-transform hover:scale-105 ${color}`}>
                            {label}
                        </button>
                    ))}
                </main>
            </div>
        </div>
    );
};

// --- MAIN MESAS COMPONENT ---

export default function Mesas() {
    const { mesas, isLoading, updateMesaStatus } = useData();
    const [selectedFilter, setSelectedFilter] = useState<'todos' | TableStatus>('todos');
    const [selectedMesa, setSelectedMesa] = useState<Mesa | null>(null);

    const filteredMesas = useMemo(() => {
        if (selectedFilter === 'todos') return mesas;
        return mesas.filter(m => m.status === selectedFilter);
    }, [mesas, selectedFilter]);

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto min-h-full bg-gradient-to-br from-orange-50/10 to-red-50/10">
            <div className="space-y-2">
                <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                    <Icon name="users" className="w-8 h-8 text-purple-600"/>
                    Gestão de Mesas
                </h1>
                <p className="text-gray-600 text-lg">Visualize e gerencie o status de todas as mesas.</p>
            </div>

            <div className="sticky top-0 z-10 bg-white/50 backdrop-blur-lg p-4 -mx-4 rounded-b-2xl border-b border-orange-100">
                <StatusFilter selected={selectedFilter} onSelect={setSelectedFilter} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                 {isLoading ? [...Array(10)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-gray-200/80 rounded-3xl h-36"></div>
                )) : filteredMesas.map(mesa => (
                    <TableCard key={mesa.id} mesa={mesa} onSelect={setSelectedMesa} />
                ))}
            </div>

            {!isLoading && filteredMesas.length === 0 && (
                <div className="text-center col-span-full py-20 bg-white/50 rounded-2xl">
                    <p className="text-2xl font-semibold text-gray-600">Nenhuma mesa encontrada!</p>
                    <p className="text-gray-400 mt-2">Tente alterar o filtro de status.</p>
                </div>
            )}

            <TableEditModal mesa={selectedMesa} onClose={() => setSelectedMesa(null)} onSave={updateMesaStatus} />
        </div>
    );
}
