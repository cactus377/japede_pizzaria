

import React, { useState, useMemo } from 'react';
import { Pedido } from '../types';
import { useData } from '../context/DataContext';
import Icon from '../components/Icon';
import NewOrderModal from '../components/NewOrderModal';

type OrderStatus = Pedido['status'];

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: string }> = {
    pendente: { label: 'Pendente', color: 'bg-blue-100 text-blue-800', icon: 'clock' },
    preparando: { label: 'Preparando', color: 'bg-orange-100 text-orange-800', icon: 'chef-hat' },
    pronto: { label: 'Pronto', color: 'bg-cyan-100 text-cyan-800', icon: 'pizza' },
    'em rota de entrega': { label: 'Em Entrega', color: 'bg-indigo-100 text-indigo-800', icon: 'truck' },
    entregue: { label: 'Entregue', color: 'bg-green-100 text-green-800', icon: 'check-circle-2' },
    cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: 'x' },
};

const STATUS_FILTERS: Array<{ key: 'todos' | OrderStatus; label: string }> = [
    { key: 'todos', label: 'Todos' },
    { key: 'pendente', label: 'Pendentes' },
    { key: 'preparando', label: 'Preparando' },
    { key: 'pronto', label: 'Prontos' },
    { key: 'em rota de entrega', label: 'Em Entrega'},
    { key: 'entregue', label: 'Entregues' },
    { key: 'cancelado', label: 'Cancelados' },
];

// --- SUB-COMPONENTS ---

const OrderDetailModal: React.FC<{
    pedido: Pedido | null;
    onClose: () => void;
    onUpdateStatus: (pedidoId: string, newStatus: OrderStatus) => void;
}> = ({ pedido, onClose, onUpdateStatus }) => {
    if (!pedido) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Detalhes do Pedido #{pedido.id.toUpperCase()}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><Icon name="x" className="w-6 h-6"/></button>
                </header>
                <main className="p-6 flex-1 overflow-y-auto space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-gray-500 text-sm uppercase">Cliente</h3>
                            <p className="text-lg text-gray-800">{pedido.cliente.nome}</p>
                            <p className="text-sm text-gray-600">{pedido.cliente.telefone}</p>
                            <p className="text-sm text-gray-600">{pedido.cliente.endereco}</p>
                        </div>
                        <div className="text-left md:text-right">
                            <h3 className="font-semibold text-gray-500 text-sm uppercase">Data & Hora</h3>
                            <p className="text-lg text-gray-800">{pedido.created_date.toLocaleDateString('pt-BR')} às {pedido.created_date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-500 text-sm uppercase mb-2">Itens</h3>
                        <div className="space-y-3 border rounded-xl p-4">
                            {pedido.itens.map(({ item, quantidade, tamanho, borda }, index) => (
                                <div key={index} className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-gray-800">{item.nome}</p>
                                        <p className="text-sm text-gray-500">{quantidade}x {tamanho && `(${tamanho})`}</p>
                                        {borda && <p className="text-xs text-orange-600 font-medium">+ Borda: {borda.nome}</p>}
                                    </div>
                                    <p className="font-medium text-gray-700">R$ {(item.preco * quantidade).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                     {pedido.pagamento && (
                        <div>
                            <h3 className="font-semibold text-gray-500 text-sm uppercase mb-2">Pagamento</h3>
                             <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                                <div className='flex items-center gap-2'>
                                    <Icon name={pedido.pagamento.metodo === 'dinheiro' ? 'coins' : 'credit-card'} className="w-6 h-6 text-gray-600"/>
                                    <span className='capitalize font-semibold'>{pedido.pagamento.metodo}</span>
                                </div>
                                {pedido.pagamento.trocoPara && <span className='text-sm text-gray-800'>Troco para R$ {pedido.pagamento.trocoPara.toFixed(2)}</span>}
                            </div>
                        </div>
                    )}
                    
                    <div>
                        <h3 className="font-semibold text-gray-500 text-sm uppercase mb-2">Resumo Financeiro</h3>
                        <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Valor Total</span>
                                <span className="font-semibold text-gray-800">R$ {pedido.valor_total.toFixed(2)}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-gray-600">Custo Total</span>
                                <span className="font-semibold text-gray-800">- R$ {pedido.custo_total.toFixed(2)}</span>
                            </div>
                             <div className="flex justify-between border-t pt-2 mt-2">
                                <span className="font-bold text-gray-800 text-base">Lucro</span>
                                <span className="font-extrabold text-green-600 text-lg">R$ {pedido.lucro.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                </main>
                <footer className="p-6 border-t bg-gray-50 rounded-b-3xl flex items-center justify-between">
                    <div className="flex-1">
                        <label htmlFor="status-select" className="block text-sm font-medium text-gray-700 mb-1">Alterar Status</label>
                        <select
                            id="status-select"
                            value={pedido.status}
                            onChange={(e) => onUpdateStatus(pedido.id, e.target.value as OrderStatus)}
                            className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:ring-red-500 focus:border-red-500"
                        >
                            {Object.entries(STATUS_CONFIG).map(([status, { label }]) => (
                                <option key={status} value={status}>{label}</option>
                            ))}
                        </select>
                    </div>
                </footer>
            </div>
        </div>
    );
};

const OrderCard: React.FC<{ pedido: Pedido, onSelect: (pedido: Pedido) => void }> = ({ pedido, onSelect }) => {
    const statusInfo = STATUS_CONFIG[pedido.status];
    return (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-5 space-y-4">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-gray-800 text-lg">{pedido.cliente.nome}</p>
                    <p className="text-xs text-gray-500 font-mono">ID: {pedido.id.toUpperCase()}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                    {statusInfo.label}
                </span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
                {pedido.itens.slice(0, 2).map(({ item, quantidade }, i) => (
                    <p key={i}>- {quantidade}x {item.nome}</p>
                ))}
                {pedido.itens.length > 2 && <p className="text-xs text-gray-500">+ {pedido.itens.length - 2} mais itens...</p>}
            </div>
            <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                <span className="font-extrabold text-xl text-red-600">R$ {pedido.valor_total.toFixed(2)}</span>
                <button onClick={() => onSelect(pedido)} className="bg-gray-800 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
                    Ver Detalhes
                </button>
            </div>
        </div>
    );
}

// --- MAIN PEDIDOS COMPONENT ---

export default function Pedidos() {
    const { pedidos, isLoading, updatePedidoStatus } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<'todos' | OrderStatus>('todos');
    const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleUpdateStatus = (pedidoId: string, newStatus: OrderStatus) => {
        updatePedidoStatus(pedidoId, newStatus);
        setSelectedPedido(null);
    };

    const filteredPedidos = useMemo(() => {
        return [...pedidos].sort((a,b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime()).filter(p => 
            (selectedStatus === 'todos' || p.status === selectedStatus) &&
            (p.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
             p.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [pedidos, searchTerm, selectedStatus]);

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto min-h-full bg-gradient-to-br from-orange-50/10 to-red-50/10">
            <div className="flex justify-between items-start flex-wrap gap-4">
                 <div className="space-y-2">
                    <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                        <Icon name="shopping-bag" className="w-8 h-8 text-blue-600"/>
                        Gestão de Pedidos
                    </h1>
                    <p className="text-gray-600 text-lg">Acompanhe e gerencie todos os pedidos em um só lugar.</p>
                </div>
                 <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-red-600 text-white font-bold py-3 px-5 rounded-xl hover:bg-red-700 transition-colors shadow-lg pizza-shadow transform hover:scale-105">
                    <Icon name="file-plus-2" className="w-5 h-5"/>
                    Novo Pedido
                </button>
            </div>


            <div className="sticky top-0 z-10 bg-white/50 backdrop-blur-lg p-4 -mx-4 rounded-b-2xl border-b border-orange-100 space-y-4">
                <div className="relative">
                    <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
                    <input type="text" placeholder="Buscar por cliente ou ID do pedido..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 text-base rounded-xl border-2 border-orange-100 focus:border-red-300 focus:ring-0 outline-none transition-colors" />
                </div>
                <div className="flex justify-center flex-wrap gap-2">
                    {STATUS_FILTERS.map(({ key, label }) => (
                        <button key={key} onClick={() => setSelectedStatus(key)} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${selectedStatus === key ? 'bg-red-600 text-white shadow-lg' : 'bg-white hover:bg-red-100'}`}>
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? [...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-gray-200/80 rounded-2xl h-56"></div>
                )) : filteredPedidos.map(pedido => (
                    <OrderCard key={pedido.id} pedido={pedido} onSelect={setSelectedPedido} />
                ))}
            </div>

            {!isLoading && filteredPedidos.length === 0 && (
                <div className="text-center col-span-full py-20 bg-white/50 rounded-2xl">
                    <p className="text-2xl font-semibold text-gray-600">Nenhum pedido encontrado!</p>
                    <p className="text-gray-400 mt-2">Tente alterar os filtros ou o termo de busca.</p>
                </div>
            )}

            <OrderDetailModal pedido={selectedPedido} onClose={() => setSelectedPedido(null)} onUpdateStatus={handleUpdateStatus} />
            {isModalOpen && <NewOrderModal onClose={() => setIsModalOpen(false)} />}
        </div>
    );
}