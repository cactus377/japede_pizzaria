

import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Pedido, CartItem } from '../types';
import Icon from './Icon';

interface CheckoutModalProps {
    onClose: () => void;
    onOrderSuccess: () => void;
    cart: CartItem[];
    total: number;
}

type DeliveryType = 'delivery' | 'balcao';
type PaymentMethod = 'dinheiro' | 'cartao';
type View = 'form' | 'success';

export default function CheckoutModal({ onClose, onOrderSuccess, cart, total }: CheckoutModalProps) {
    const { currentUser, addPedido } = useData();
    const [view, setView] = useState<View>('form');
    const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
    const [address, setAddress] = useState(currentUser?.endereco || '');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('dinheiro');
    const [troco, setTroco] = useState('');
    const [error, setError] = useState('');
    const [newOrderId, setNewOrderId] = useState('');
    
    useEffect(() => {
        if(deliveryType === 'balcao') {
            setError('');
        }
    }, [deliveryType]);

    if (!currentUser) return null;

    const handleSubmit = () => {
        if (deliveryType === 'delivery' && !address.trim()) {
            setError('O endereço é obrigatório para delivery.');
            return;
        }
        setError('');

        const custoTotal = cart.reduce((sum, cartItem) => sum + ((cartItem.custo || 0) * cartItem.quantidade), 0);
        const lucroTotal = total - custoTotal;

        const newPedido: Pedido = {
            id: `ped-${Date.now()}`,
            cliente: currentUser,
            itens: cart.map(c => ({ item: c, quantidade: c.quantidade, tamanho: c.tamanho, borda: c.borda })),
            status: 'pendente',
            valor_total: total,
            custo_total: custoTotal,
            lucro: lucroTotal,
            created_date: new Date(),
            tempo_estimado: 25,
            statusChangeTime: new Date(),
            tipo: deliveryType,
            pagamento: {
                metodo: paymentMethod,
                trocoPara: paymentMethod === 'dinheiro' && troco ? parseFloat(troco) : undefined
            }
        };

        addPedido(newPedido);
        setNewOrderId(newPedido.id.toUpperCase());
        setView('success');
    };

    const handleCloseAndReset = () => {
        onOrderSuccess();
        onClose();
    };

    const renderForm = () => (
        <>
            <header className="p-6 border-b flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Finalizar Pedido</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><Icon name="x" className="w-6 h-6"/></button>
            </header>
            <main className="p-6 space-y-6">
                <div>
                    <h3 className="font-semibold text-gray-700 mb-2">1. Tipo de Entrega</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setDeliveryType('delivery')} className={`p-4 rounded-xl border-2 text-center transition-colors ${deliveryType === 'delivery' ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                            <Icon name="truck" className="w-8 h-8 mx-auto text-red-600 mb-2"/>
                            <span className="font-semibold">Delivery</span>
                        </button>
                        <button onClick={() => setDeliveryType('balcao')} className={`p-4 rounded-xl border-2 text-center transition-colors ${deliveryType === 'balcao' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                            <Icon name="shopping-bag" className="w-8 h-8 mx-auto text-blue-600 mb-2"/>
                            <span className="font-semibold">Retirada no Balcão</span>
                        </button>
                    </div>
                </div>

                {deliveryType === 'delivery' && (
                     <div>
                        <label className="font-semibold text-sm text-gray-700">Endereço de Entrega</label>
                        <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Seu endereço completo" className="w-full mt-1 p-2 border rounded-lg" />
                         {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                    </div>
                )}
                
                <div>
                    <h3 className="font-semibold text-gray-700 mb-2">2. Pagamento</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setPaymentMethod('dinheiro')} className={`p-4 rounded-xl border-2 text-center transition-colors ${paymentMethod === 'dinheiro' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                            <Icon name="coins" className="w-8 h-8 mx-auto text-green-600 mb-2"/>
                            <span className="font-semibold">Dinheiro</span>
                        </button>
                        <button onClick={() => setPaymentMethod('cartao')} className={`p-4 rounded-xl border-2 text-center transition-colors ${paymentMethod === 'cartao' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                            <Icon name="credit-card" className="w-8 h-8 mx-auto text-indigo-600 mb-2"/>
                            <span className="font-semibold">Cartão</span>
                        </button>
                    </div>
                </div>

                {paymentMethod === 'dinheiro' && (
                     <div>
                        <label className="font-semibold text-sm text-gray-700">Precisa de troco? (Opcional)</label>
                        <input type="number" value={troco} onChange={e => setTroco(e.target.value)} placeholder="Troco para R$..." className="w-full mt-1 p-2 border rounded-lg" />
                    </div>
                )}
            </main>
            <footer className="p-6 border-t bg-gray-50 rounded-b-3xl">
                <button onClick={handleSubmit} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors">
                    Confirmar Pedido (R$ {total.toFixed(2)})
                </button>
            </footer>
        </>
    );

    const renderSuccess = () => (
        <div className="p-8 text-center flex flex-col justify-center items-center h-full">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Icon name="check-circle-2" className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Pedido Recebido!</h2>
            <p className="text-gray-600 mt-2">Seu pedido <span className="font-bold text-red-600">{newOrderId}</span> já está sendo preparado.</p>
            <p className="text-gray-500 text-sm mt-1">Acompanhe o status pela tela da cozinha!</p>
            <button onClick={handleCloseAndReset} className="mt-8 w-full max-w-xs bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors">
                Fechar
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={view === 'form' ? onClose : undefined}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
                {view === 'form' ? renderForm() : renderSuccess()}
            </div>
        </div>
    );
}