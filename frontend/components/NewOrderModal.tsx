

import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Pedido, ItemCardapio, Cliente, Mesa, Borda, CartItem as AppCartItem } from '../types';
import Icon from './Icon';

interface NewOrderModalProps {
    onClose: () => void;
}

type OrderType = 'delivery' | 'mesa' | 'balcao';

interface CartItem extends AppCartItem {}

// --- SUB-COMPONENTS ---
const ItemCustomizationModal: React.FC<{
    item: ItemCardapio;
    onClose: () => void;
    onAddToCart: (item: ItemCardapio, tamanho: string, precoFinal: number, borda?: Borda) => void;
}> = ({ item, onClose, onAddToCart }) => {
    const [selectedTamanho, setSelectedTamanho] = useState(item.tamanhos ? item.tamanhos[0].nome : 'Único');
    const [selectedBorda, setSelectedBorda] = useState<Borda | undefined>(undefined);
    const [precoFinal, setPrecoFinal] = useState(item.preco);

    useEffect(() => {
        const tamanhoInfo = item.tamanhos?.find(t => t.nome === selectedTamanho);
        const precoTamanho = tamanhoInfo?.precoAdicional || 0;
        const precoBorda = selectedBorda?.precoAdicional || 0;
        setPrecoFinal(item.preco + precoTamanho + precoBorda);
    }, [selectedTamanho, selectedBorda, item.preco, item.tamanhos]);

    const handleAddToCart = () => {
        onAddToCart(item, selectedTamanho, precoFinal, selectedBorda);
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800">{item.nome}</h3>
                    <p className="text-gray-500 text-sm mt-1">{item.descricao}</p>
                </div>
                <div className="p-6 space-y-4 bg-gray-50">
                    {item.tamanhos && (
                        <div>
                            <label className="font-semibold text-sm">Tamanho</label>
                            <div className="flex gap-2 flex-wrap mt-2">
                                {item.tamanhos.map(t => (
                                    <button key={t.nome} onClick={() => setSelectedTamanho(t.nome)} className={`px-3 py-1 text-xs rounded-full font-semibold ${selectedTamanho === t.nome ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                        {t.nome} {t.precoAdicional > 0 ? `(+R$${t.precoAdicional.toFixed(2)})` : ''}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {item.bordas && item.bordas.length > 0 && (
                         <div>
                             <label className="font-semibold text-sm">Borda Recheada</label>
                             <select onChange={(e) => setSelectedBorda(e.target.value ? item.bordas?.find(b => b.nome === e.target.value) : undefined)} className="w-full mt-2 bg-white border border-gray-200 rounded-lg p-2 text-sm">
                                <option value="">Sem borda</option>
                                {item.bordas.map(borda => (
                                    <option key={borda.nome} value={borda.nome}>
                                        {borda.nome} (+ R$ {borda.precoAdicional.toFixed(2)})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
                <div className="p-6 flex justify-between items-center border-t">
                    <span className="text-2xl font-extrabold text-gray-900">R$ {precoFinal.toFixed(2)}</span>
                    <button onClick={handleAddToCart} className="bg-red-600 text-white rounded-lg font-semibold px-6 py-3 hover:bg-red-700 transition-colors">
                        Adicionar
                    </button>
                </div>
            </div>
        </div>
    )
};

interface OrderCreationStep2Props {
    itens: ItemCardapio[];
    handleItemClick: (item: ItemCardapio) => void;
    cart: CartItem[];
    updateCartQuantity: (itemId: string, tamanho: string, bordaNome: string | undefined, newQuantity: number) => void;
    cartTotal: number;
}

const OrderCreationStep2: React.FC<OrderCreationStep2Props> = ({
    itens,
    handleItemClick,
    cart,
    updateCartQuantity,
    cartTotal,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('todos');
    
    const filteredItems = useMemo(() => {
        return itens.filter(item =>
            item.disponivel &&
            (category === 'todos' || item.categoria === category) &&
            (item.nome.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }, [itens, searchTerm, category]);

    return (
        <div className="grid grid-cols-3 gap-6 h-full">
            {/* Menu */}
            <div className="col-span-2 flex flex-col h-full">
                <input type="text" placeholder="Buscar item..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-4 pr-4 py-2 mb-4 text-base rounded-xl border-2 border-orange-100 focus:border-red-300 focus:ring-0 outline-none transition-colors" />
                <div className="flex-1 overflow-y-auto pr-2 hide-scrollbar">
                     <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredItems.map(item => (
                            <div key={item.id} onClick={() => handleItemClick(item)} className="bg-white rounded-xl shadow-sm overflow-hidden transform hover:scale-105 transition-transform duration-200 group cursor-pointer flex flex-col text-center p-3">
                                <img src={item.imagemUrl} alt={item.nome} className="w-full h-24 object-cover rounded-lg"/>
                                <div className="py-2 flex-1 flex flex-col justify-center">
                                    <h4 className="font-bold text-sm text-gray-800 leading-tight">{item.nome}</h4>
                                    <p className="text-xs text-gray-500 capitalize">{item.categoria}</p>
                                </div>
                                <p className="font-extrabold text-red-600">R$ {item.preco.toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cart */}
            <div className="col-span-1 bg-gray-50 rounded-xl flex flex-col h-full">
                <h3 className="font-bold text-lg p-4 border-b">Carrinho</h3>
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    {cart.length === 0 ? <p className="text-gray-500 text-sm text-center pt-10">Adicione itens ao pedido.</p> : cart.map(item => (
                        <div key={`${item.id}-${item.tamanho}-${item.borda?.nome}`} className="flex items-start gap-3 bg-white p-2 rounded-lg">
                            <div className="flex-1">
                                <p className="font-semibold text-sm text-gray-800">{item.nome}</p>
                                <p className="text-xs text-gray-500">{item.tamanho} {item.borda ? `+ ${item.borda.nome}` : ''}</p>
                                <p className="font-bold text-sm text-red-600">R$ {item.precoFinal.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-1 bg-gray-100 rounded-full">
                                <button onClick={() => updateCartQuantity(item.id, item.tamanho, item.borda?.nome, item.quantidade - 1)} className="p-1.5"><Icon name="minus" className="w-3 h-3"/></button>
                                <span className="font-bold w-4 text-center text-sm">{item.quantidade}</span>
                                <button onClick={() => updateCartQuantity(item.id, item.tamanho, item.borda?.nome, item.quantidade + 1)} className="p-1.5"><Icon name="plus" className="w-3 h-3"/></button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t bg-white rounded-b-xl">
                    <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total</span>
                        <span>R$ {cartTotal.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- MAIN MODAL COMPONENT ---
export default function NewOrderModal({ onClose }: NewOrderModalProps) {
    const { itens, clientes, mesas, addPedido, addCliente, updateMesaStatus } = useData();
    const [step, setStep] = useState(1);
    const [orderType, setOrderType] = useState<OrderType | null>(null);
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [newClientName, setNewClientName] = useState('');
    const [selectedMesaId, setSelectedMesaId] = useState<number | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [customizingItem, setCustomizingItem] = useState<ItemCardapio | null>(null);

    const freeMesas = useMemo(() => mesas.filter(m => m.status === 'livre'), [mesas]);

    const handleNextStep = () => {
        if (step === 1) {
            if (orderType === 'mesa' && selectedMesaId) setStep(2);
            if ((orderType === 'delivery' || orderType === 'balcao') && (selectedClientId || newClientName)) setStep(2);
        }
    };
    
    const addToCart = (item: ItemCardapio, tamanho: string, precoFinal: number, borda?: Borda) => {
        const cartKey = `${item.id}-${tamanho}-${borda?.nome || 'none'}`;
        const existing = cart.find(ci => `${ci.id}-${ci.tamanho}-${ci.borda?.nome || 'none'}` === cartKey);

        if (existing) {
            updateCartQuantity(item.id, tamanho, borda?.nome, existing.quantidade + 1);
        } else {
            setCart(prev => [...prev, { ...item, quantidade: 1, tamanho, precoFinal, borda }]);
        }
    };

    const updateCartQuantity = (itemId: string, tamanho: string, bordaNome: string | undefined, newQuantity: number) => {
        const cartKey = `${itemId}-${tamanho}-${bordaNome || 'none'}`;
        if (newQuantity <= 0) {
            setCart(prev => prev.filter(ci => `${ci.id}-${ci.tamanho}-${ci.borda?.nome || 'none'}` !== cartKey));
        } else {
            setCart(prev => prev.map(ci => (`${ci.id}-${ci.tamanho}-${ci.borda?.nome || 'none'}` === cartKey) ? { ...ci, quantidade: newQuantity } : ci));
        }
    };
    
    const handleItemClick = (item: ItemCardapio) => {
        if (item.tamanhos || item.bordas) {
            setCustomizingItem(item);
        } else {
            addToCart(item, "Único", item.preco, undefined);
        }
    }

    const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.precoFinal * item.quantidade, 0), [cart]);

    const handleCreateOrder = () => {
        if (!orderType || cart.length === 0) return;

        let finalClient: Cliente | undefined;

        if (orderType === 'mesa') {
            const mesa = mesas.find(m => m.id === selectedMesaId);
            if (mesa) {
                finalClient = addCliente({ nome: `Mesa ${mesa.numero}`, telefone: '', endereco: '' });
            }
        } else if (newClientName) {
            finalClient = addCliente({ nome: newClientName, telefone: '', endereco: '' });
        } else if (selectedClientId) {
            finalClient = clientes.find(c => c.id === selectedClientId);
        }

        if (!finalClient) {
            console.error("Cliente não pôde ser determinado para o pedido.");
            return;
        }

        const custoTotal = cart.reduce((sum, cartItem) => sum + ((cartItem.custo || 0) * cartItem.quantidade), 0);
        const lucroTotal = cartTotal - custoTotal;

        const newPedido: Pedido = {
            id: `ped-${Date.now()}`,
            cliente: finalClient,
            itens: cart.map(c => ({ item: c, quantidade: c.quantidade, tamanho: c.tamanho, borda: c.borda })),
            status: 'pendente',
            valor_total: cartTotal,
            custo_total: custoTotal,
            lucro: lucroTotal,
            created_date: new Date(),
            tempo_estimado: 25, // Default, could be calculated later
            statusChangeTime: new Date(),
            tipo: orderType,
            mesaId: orderType === 'mesa' ? selectedMesaId! : undefined,
        };

        addPedido(newPedido);
        if (orderType === 'mesa' && selectedMesaId) {
            updateMesaStatus(selectedMesaId, 'ocupada');
        }
        onClose();
    };


    const renderStep1 = () => (
        <>
            <div>
                <h3 className="font-bold text-gray-800 mb-3">1. Tipo de Pedido</h3>
                <div className="grid grid-cols-3 gap-4">
                    <button onClick={() => setOrderType('delivery')} className={`p-4 rounded-xl border-2 text-center transition-colors ${orderType === 'delivery' ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                        <Icon name="truck" className="w-8 h-8 mx-auto text-red-600 mb-2"/>
                        <span className="font-semibold">Delivery</span>
                    </button>
                    <button onClick={() => setOrderType('mesa')} className={`p-4 rounded-xl border-2 text-center transition-colors ${orderType === 'mesa' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                        <Icon name="users" className="w-8 h-8 mx-auto text-purple-600 mb-2"/>
                        <span className="font-semibold">Mesa</span>
                    </button>
                    <button onClick={() => setOrderType('balcao')} className={`p-4 rounded-xl border-2 text-center transition-colors ${orderType === 'balcao' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                        <Icon name="shopping-bag" className="w-8 h-8 mx-auto text-blue-600 mb-2"/>
                        <span className="font-semibold">Balcão</span>
                    </button>
                </div>
            </div>
            {orderType && (
            <div>
                <h3 className="font-bold text-gray-800 mb-3">2. Detalhes</h3>
                {(orderType === 'delivery' || orderType === 'balcao') && (
                    <div className="space-y-3">
                        <select value={selectedClientId} onChange={e => { setSelectedClientId(e.target.value); setNewClientName(''); }} className="w-full bg-white border border-gray-300 rounded-lg p-3">
                            <option value="">Selecione um cliente existente</option>
                            {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                        </select>
                        <p className="text-center text-sm text-gray-500">ou</p>
                        <input type="text" placeholder="Cadastre um novo cliente" value={newClientName} onChange={e => { setNewClientName(e.target.value); setSelectedClientId(''); }} className="w-full border border-gray-300 rounded-lg p-3"/>
                    </div>
                )}
                {orderType === 'mesa' && (
                     <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto">
                        {freeMesas.map(mesa => (
                             <button key={mesa.id} onClick={() => setSelectedMesaId(mesa.id)} className={`flex flex-col items-center justify-center w-full aspect-square rounded-xl text-white font-bold text-lg border-b-4 transition-transform hover:scale-105 ${selectedMesaId === mesa.id ? 'bg-red-500 border-red-700 ring-4 ring-red-200' : 'bg-green-400 border-green-600'}`}>
                                {mesa.numero}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            )}
        </>
    );

    const isNextDisabled = step === 1 && (!orderType || (orderType === 'mesa' ? !selectedMesaId : (!selectedClientId && !newClientName)));
    const isCreateDisabled = step === 2 && cart.length === 0;

    return (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={onClose}>
            {customizingItem && <ItemCustomizationModal item={customizingItem} onClose={() => setCustomizingItem(null)} onAddToCart={addToCart} />}
            <div className="bg-gray-100 rounded-3xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-6 border-b flex justify-between items-center bg-white rounded-t-3xl">
                    <h2 className="text-2xl font-bold text-gray-800">Novo Pedido - Etapa {step} de 2</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><Icon name="x" className="w-6 h-6"/></button>
                </header>

                <main className={`p-6 flex-1 overflow-y-auto ${step === 2 ? 'overflow-hidden' : ''} ${step === 1 ? 'space-y-6' : ''}`}>
                    {step === 1 ? renderStep1() : (
                        <OrderCreationStep2
                            itens={itens}
                            handleItemClick={handleItemClick}
                            cart={cart}
                            updateCartQuantity={updateCartQuantity}
                            cartTotal={cartTotal}
                        />
                    )}
                </main>

                <footer className="p-6 border-t bg-white/80 backdrop-blur-sm rounded-b-3xl flex justify-between items-center">
                    <div>
                        {step === 2 && <button onClick={() => setStep(1)} className="px-6 py-3 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300">Voltar</button>}
                    </div>
                    <div>
                        {step === 1 && <button onClick={handleNextStep} disabled={isNextDisabled} className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">Próximo</button>}
                        {step === 2 && <button onClick={handleCreateOrder} disabled={isCreateDisabled} className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">Criar Pedido (R$ {cartTotal.toFixed(2)})</button>}
                    </div>
                </footer>
            </div>
        </div>
    );
}