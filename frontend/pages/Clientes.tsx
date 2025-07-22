
import React, { useState, useMemo, useEffect } from 'react';
import { Cliente, Pedido } from '../types';
import { useData } from '../context/DataContext';
import Icon from '../components/Icon';

const emptyCliente: Omit<Cliente, 'id'> = {
    nome: '',
    telefone: '',
    endereco: '',
};

// --- SUB-COMPONENTS ---

const ClientEditModal: React.FC<{
    cliente: Cliente | Omit<Cliente, 'id'> | null;
    onClose: () => void;
    onSave: (cliente: Cliente | Omit<Cliente, 'id'>) => void;
}> = ({ cliente, onClose, onSave }) => {
    const [formData, setFormData] = useState(cliente);

    useEffect(() => {
        setFormData(cliente);
    }, [cliente]);

    if (!formData) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">{'id' in formData ? 'Editar' : 'Adicionar'} Cliente</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><Icon name="x" className="w-6 h-6"/></button>
                </header>
                <form onSubmit={handleSubmit}>
                    <main className="p-6 space-y-4">
                        <div>
                            <label className="font-semibold text-sm">Nome Completo</label>
                            <input type="text" name="nome" value={formData.nome} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg" required />
                        </div>
                        <div>
                            <label className="font-semibold text-sm">Telefone</label>
                            <input type="tel" name="telefone" value={formData.telefone} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg" placeholder="(99) 99999-9999" />
                        </div>
                         <div>
                            <label className="font-semibold text-sm">Endereço</label>
                            <input type="text" name="endereco" value={formData.endereco} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg" placeholder="Rua, Número, Bairro, Cidade" />
                        </div>
                    </main>
                    <footer className="p-6 border-t bg-gray-50 rounded-b-3xl flex justify-end gap-4">
                         <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300">Cancelar</button>
                         <button type="submit" className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">Salvar Cliente</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};


// --- MAIN Clientes COMPONENT ---
export default function Clientes() {
    const { clientes, pedidos, isLoading, addCliente, updateCliente, deleteCliente } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCliente, setEditingCliente] = useState<Cliente | Omit<Cliente, 'id'> | null>(null);

    const clientData = useMemo(() => {
        return clientes.map(cliente => {
            const clientPedidos = pedidos.filter(p => p.cliente.id === cliente.id && p.status === 'entregue');
            const totalGasto = clientPedidos.reduce((acc, p) => acc + p.valor_total, 0);
            return {
                ...cliente,
                totalPedidos: clientPedidos.length,
                totalGasto,
            };
        }).sort((a,b) => b.totalGasto - a.totalGasto);
    }, [clientes, pedidos]);

    const filteredClients = useMemo(() => {
        return clientData.filter(cliente =>
            cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cliente.telefone.includes(searchTerm)
        );
    }, [clientData, searchTerm]);

    const handleOpenModal = (cliente: Cliente | null) => {
        setEditingCliente(cliente ? { ...cliente } : emptyCliente);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCliente(null);
    };

    const handleSave = (cliente: Cliente | Omit<Cliente, 'id'>) => {
        if ('id' in cliente) {
            updateCliente(cliente);
        } else {
            addCliente(cliente);
        }
        handleCloseModal();
    };

    const handleDelete = (clienteId: string) => {
        if (window.confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
            deleteCliente(clienteId);
        }
    };
    
    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto min-h-full bg-gradient-to-br from-orange-50/10 to-red-50/10">
            <div className="flex justify-between items-start flex-wrap gap-4">
                 <div className="space-y-2">
                    <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                        <Icon name="contact" className="w-8 h-8 text-indigo-600"/>
                        Gestão de Clientes
                    </h1>
                    <p className="text-gray-600 text-lg">Gerencie sua base de clientes e veja o histórico.</p>
                </div>
                 <button onClick={() => handleOpenModal(null)} className="flex items-center gap-2 bg-red-600 text-white font-bold py-3 px-5 rounded-xl hover:bg-red-700 transition-colors shadow-lg pizza-shadow transform hover:scale-105">
                    <Icon name="plus" className="w-5 h-5"/>
                    Adicionar Cliente
                </button>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-md overflow-hidden">
                <div className="p-4 border-b">
                     <div className="relative">
                        <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
                        <input type="text" placeholder="Buscar por nome ou telefone..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-2 text-base rounded-xl border-2 border-orange-100 focus:border-red-300 focus:ring-0 outline-none transition-colors bg-white/50" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50/50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Cliente</th>
                                <th scope="col" className="px-6 py-3">Contato</th>
                                <th scope="col" className="px-6 py-3">Histórico</th>
                                <th scope="col" className="px-6 py-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? [...Array(5)].map((_, i) => (
                                <tr key={i} className="bg-white border-b"><td colSpan={4} className="p-4"><div className="h-12 bg-gray-200 rounded animate-pulse" /></td></tr>
                            )) : filteredClients.map(cliente => (
                                <tr key={cliente.id} className="bg-white border-b hover:bg-gray-50">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                        {cliente.nome}
                                    </th>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Icon name="phone" className="w-4 h-4"/>
                                            <span>{cliente.telefone || 'Não informado'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600 mt-1">
                                            <Icon name="map-pin" className="w-4 h-4"/>
                                            <span className="truncate max-w-xs">{cliente.endereco || 'Não informado'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p>{cliente.totalPedidos} pedidos</p>
                                        <p className="font-semibold text-green-700">R$ {cliente.totalGasto.toFixed(2)}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => handleOpenModal(cliente)} className="font-medium text-blue-600 hover:underline">Editar</button>
                                        <button onClick={() => handleDelete(cliente.id)} className="font-medium text-red-600 hover:underline">Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {!isLoading && filteredClients.length === 0 && (
                        <div className="text-center p-12">
                            <p className="text-xl font-semibold text-gray-600">Nenhum cliente encontrado.</p>
                            <p className="text-gray-400 mt-2">Tente alterar o termo de busca ou adicione um novo cliente.</p>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && <ClientEditModal cliente={editingCliente} onClose={handleCloseModal} onSave={handleSave} />}
        </div>
    );
}