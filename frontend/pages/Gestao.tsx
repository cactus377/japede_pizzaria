
import React, { useState, useMemo, useEffect } from 'react';
import { ItemCardapio, Borda } from '../types';
import { useData } from '../context/DataContext';
import Icon from '../components/Icon';

const emptyItem: Omit<ItemCardapio, 'id' | 'custo'> & { custo?: number } = {
    nome: '',
    descricao: '',
    preco: 0,
    custo: 0,
    categoria: 'pizza',
    disponivel: true,
    imagemUrl: '',
    tamanhos: [{ nome: 'Média', precoAdicional: 0 }],
    bordas: [],
};


// --- SUB-COMPONENTS ---

const ItemEditModal: React.FC<{
    item: ItemCardapio | Omit<ItemCardapio, 'id'> | null;
    onClose: () => void;
    onSave: (item: ItemCardapio | Omit<ItemCardapio, 'id'>) => void;
}> = ({ item, onClose, onSave }) => {
    const { categorias, addCategoria } = useData();
    const [formData, setFormData] = useState(item);
    const [newCategoryName, setNewCategoryName] = useState("");

    useEffect(() => {
        setFormData(item);
    }, [item]);

    if (!formData) return null;

    const handleAddCategory = () => {
        if (newCategoryName && !categorias.find(c => c.toLowerCase() === newCategoryName.toLowerCase())) {
            const newCat = newCategoryName.toLowerCase();
            addCategoria(newCat);
            setFormData(prev => prev ? { ...prev, categoria: newCat } : null);
            setNewCategoryName("");
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const target = e.target;
        const { name, value } = target;

        if (target instanceof HTMLInputElement && target.type === 'checkbox') {
            const checked = target.checked;
            setFormData(prev => prev ? { ...prev, [name]: checked } : null);
        } else {
            setFormData(prev => prev ? { ...prev, [name]: target.type === 'number' ? parseFloat(value) || 0 : value } : null);
        }
    };
    
    const handleSizeChange = (index: number, field: 'nome' | 'precoAdicional', value: string | number) => {
        const newSizes = [...(formData.tamanhos || [])];
        newSizes[index] = { ...newSizes[index], [field]: field === 'precoAdicional' ? Number(value) : value };
        setFormData(prev => prev ? { ...prev, tamanhos: newSizes } : null);
    };

    const addSize = () => {
        const newSizes = [...(formData.tamanhos || []), { nome: 'Novo', precoAdicional: 0 }];
        setFormData(prev => prev ? { ...prev, tamanhos: newSizes } : null);
    };

    const removeSize = (index: number) => {
        const newSizes = formData.tamanhos?.filter((_, i) => i !== index) || [];
        setFormData(prev => prev ? { ...prev, tamanhos: newSizes } : null);
    };

    const handleBordaChange = (index: number, field: 'nome' | 'precoAdicional', value: string | number) => {
        const newBordas = [...(formData.bordas || [])];
        newBordas[index] = { ...newBordas[index], [field]: field === 'precoAdicional' ? Number(value) : value };
        setFormData(prev => prev ? { ...prev, bordas: newBordas } : null);
    };

    const addBorda = () => {
        const newBordas = [...(formData.bordas || []), { nome: 'Nova', precoAdicional: 0 }];
        setFormData(prev => prev ? { ...prev, bordas: newBordas } : null);
    };

    const removeBorda = (index: number) => {
        const newBordas = formData.bordas?.filter((_, i) => i !== index) || [];
        setFormData(prev => prev ? { ...prev, bordas: newBordas } : null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">{'id' in formData ? 'Editar' : 'Adicionar'} Item do Cardápio</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><Icon name="x" className="w-6 h-6"/></button>
                </header>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <main className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div className="md:col-span-2">
                            <label className="font-semibold text-sm">Nome</label>
                            <input type="text" name="nome" value={formData.nome} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg" required />
                        </div>
                        <div className="md:col-span-2">
                            <label className="font-semibold text-sm">Descrição</label>
                            <textarea name="descricao" value={formData.descricao} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg" rows={2}></textarea>
                        </div>
                        <div>
                            <label className="font-semibold text-sm">Preço de Venda (R$)</label>
                            <input type="number" name="preco" value={formData.preco} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg" step="0.01" required />
                        </div>
                         <div>
                            <label className="font-semibold text-sm">Custo do Produto (R$)</label>
                            <input type="number" name="custo" value={formData.custo || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg" step="0.01" />
                        </div>
                        <div className="md:col-span-2">
                             <label className="font-semibold text-sm">Categoria</label>
                            <select name="categoria" value={formData.categoria} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg bg-white capitalize">
                                {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                             <label className="font-semibold text-sm">...ou Adicionar Nova Categoria</label>
                            <div className="flex gap-2 mt-1">
                                <input type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="Ex: Especiais" className="w-full p-2 border rounded-lg" />
                                <button type="button" onClick={handleAddCategory} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold whitespace-nowrap hover:bg-blue-700 transition-colors">Adicionar</button>
                            </div>
                        </div>
                         <div className="md:col-span-2">
                            <label className="font-semibold text-sm">URL da Imagem</label>
                            <input type="text" name="imagemUrl" value={formData.imagemUrl} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg" placeholder="https://exemplo.com/imagem.jpg" />
                        </div>

                        <div className={`md:col-span-2 space-y-3 p-4 rounded-lg bg-gray-50 border ${!['pizza', 'pizzas'].includes(formData.categoria.toLowerCase()) ? 'hidden' : ''}`}>
                            <h3 className="font-semibold text-base">Opções de Pizza</h3>
                            {/* TAMANHOS */}
                            <div>
                                <h4 className="font-semibold text-sm mb-2">Tamanhos</h4>
                                {formData.tamanhos?.map((size, index) => (
                                    <div key={index} className="flex items-center gap-2 mb-2">
                                        <input type="text" value={size.nome} onChange={(e) => handleSizeChange(index, 'nome', e.target.value)} placeholder="Nome (Ex: Grande)" className="w-full p-2 border rounded-lg"/>
                                        <input type="number" value={size.precoAdicional} onChange={(e) => handleSizeChange(index, 'precoAdicional', e.target.value)} placeholder="Preço Adicional" className="w-48 p-2 border rounded-lg" step="0.01"/>
                                        <button type="button" onClick={() => removeSize(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><Icon name="minus" /></button>
                                    </div>
                                ))}
                                <button type="button" onClick={addSize} className="text-sm font-semibold text-blue-600 hover:underline">Adicionar Tamanho</button>
                            </div>
                            {/* BORDAS */}
                            <div>
                                <h4 className="font-semibold text-sm mb-2">Sabores de Borda</h4>
                                {formData.bordas?.map((borda, index) => (
                                    <div key={index} className="flex items-center gap-2 mb-2">
                                        <input type="text" value={borda.nome} onChange={(e) => handleBordaChange(index, 'nome', e.target.value)} placeholder="Nome (Ex: Catupiry)" className="w-full p-2 border rounded-lg"/>
                                        <input type="number" value={borda.precoAdicional} onChange={(e) => handleBordaChange(index, 'precoAdicional', e.target.value)} placeholder="Preço Adicional" className="w-48 p-2 border rounded-lg" step="0.01"/>
                                        <button type="button" onClick={() => removeBorda(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><Icon name="minus" /></button>
                                    </div>
                                ))}
                                <button type="button" onClick={addBorda} className="text-sm font-semibold text-blue-600 hover:underline">Adicionar Sabor de Borda</button>
                            </div>
                        </div>
                        
                        <div className="md:col-span-2 flex items-center gap-3">
                            <input type="checkbox" id="disponivel" name="disponivel" checked={formData.disponivel} onChange={handleChange} className="h-5 w-5 rounded text-red-600 focus:ring-red-500" />
                            <label htmlFor="disponivel" className="font-semibold text-sm">Item Disponível</label>
                        </div>

                    </main>
                    <footer className="p-6 border-t bg-gray-50 rounded-b-3xl flex justify-end gap-4">
                         <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300">Cancelar</button>
                         <button type="submit" className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">Salvar</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

// --- MAIN GESTAO COMPONENT ---

export default function Gestao() {
    const { itens, isLoading, saveItem, deleteItem } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ItemCardapio | Omit<ItemCardapio, 'id'> | null>(null);

    const filteredItems = useMemo(() => {
        return itens.filter(item =>
            item.nome.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a,b) => a.nome.localeCompare(b.nome));
    }, [itens, searchTerm]);

    const handleOpenModal = (item: ItemCardapio | null) => {
        setEditingItem(item ? JSON.parse(JSON.stringify(item)) : emptyItem); // Deep copy
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleSave = (item: ItemCardapio | Omit<ItemCardapio, 'id'>) => {
        saveItem(item as ItemCardapio); // Cast as context handles ID generation
        handleCloseModal();
    };

    const handleDelete = (itemId: string) => {
        if (window.confirm('Tem certeza que deseja excluir este item?')) {
            deleteItem(itemId);
        }
    };
    
    const toggleAvailability = (item: ItemCardapio) => {
        saveItem({ ...item, disponivel: !item.disponivel });
    };

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto min-h-full bg-gradient-to-br from-orange-50/10 to-red-50/10">
            <div className="flex justify-between items-start">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                        <Icon name="book-open" className="w-8 h-8 text-teal-600"/>
                        Gestão do Cardápio
                    </h1>
                    <p className="text-gray-600 text-lg">Adicione, edite e gerencie os itens do seu menu.</p>
                </div>
                <button onClick={() => handleOpenModal(null)} className="flex items-center gap-2 bg-red-600 text-white font-bold py-3 px-5 rounded-xl hover:bg-red-700 transition-colors shadow-lg">
                    <Icon name="plus" className="w-5 h-5"/>
                    Adicionar Item
                </button>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-md overflow-hidden">
                <div className="p-4 border-b">
                     <div className="relative">
                        <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
                        <input type="text" placeholder="Buscar por nome do item..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-2 text-base rounded-xl border-2 border-orange-100 focus:border-red-300 focus:ring-0 outline-none transition-colors bg-white/50" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50/50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Item</th>
                                <th scope="col" className="px-6 py-3">Categoria</th>
                                <th scope="col" className="px-6 py-3">Preço / Custo</th>
                                <th scope="col" className="px-6 py-3 text-center">Status</th>
                                <th scope="col" className="px-6 py-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? [...Array(5)].map((_, i) => (
                                <tr key={i} className="bg-white border-b"><td colSpan={5} className="p-4"><div className="h-12 bg-gray-200 rounded animate-pulse" /></td></tr>
                            )) : filteredItems.map(item => (
                                <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap flex items-center gap-4">
                                        <img src={item.imagemUrl} alt={item.nome} className="w-12 h-12 rounded-lg object-cover" />
                                        <span>{item.nome}</span>
                                    </th>
                                    <td className="px-6 py-4 capitalize">{item.categoria}</td>
                                    <td className="px-6 py-4">
                                        <p>R$ {item.preco.toFixed(2)}</p>
                                        <p className="text-xs text-gray-500">R$ {(item.custo || 0).toFixed(2)}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                          <input type="checkbox" checked={item.disponivel} onChange={() => toggleAvailability(item)} className="sr-only peer" />
                                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-red-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                        </label>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => handleOpenModal(item)} className="font-medium text-blue-600 hover:underline">Editar</button>
                                        <button onClick={() => handleDelete(item.id)} className="font-medium text-red-600 hover:underline">Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {!isLoading && filteredItems.length === 0 && (
                        <div className="text-center p-12">
                            <p className="text-xl font-semibold text-gray-600">Nenhum item encontrado.</p>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && <ItemEditModal item={editingItem} onClose={handleCloseModal} onSave={handleSave} />}
        </div>
    );
}