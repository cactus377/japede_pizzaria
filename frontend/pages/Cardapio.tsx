
import React, { useState, useMemo, useEffect } from 'react';
import { ItemCardapio, CartItem, Borda, Cliente } from '../types';
import { useData } from '../context/DataContext';
import Icon from '../components/Icon';
import LoginModal from '../components/LoginModal';
import CheckoutModal from '../components/CheckoutModal';

// --- SUB-COMPONENTS ---

const CategoryFilter: React.FC<{
    categories: string[];
    selected: string;
    onSelect: (category: string) => void;
}> = ({ categories, selected, onSelect }) => {
    const allCategories = ['todos', ...categories];
    const emojiMap: Record<string, string> = {
        todos: '🍽️',
        pizza: '🍕',
        bebida: '🥤',
        sobremesa: '🍰',
        entrada: '🥗',
        acompanhamento: '🍟'
    };
    return (
        <div className="flex justify-center flex-wrap gap-3">
            {allCategories.map((key) => (
                <button key={key} onClick={() => onSelect(key)} className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${selected === key ? 'bg-red-600 text-white shadow-lg' : 'bg-white hover:bg-red-100'}`}>
                    {emojiMap[key] && <span className="text-lg">{emojiMap[key]}</span>}
                    <span className="capitalize">{key}</span>
                </button>
            ))}
        </div>
    );
};


const MenuCard: React.FC<{ item: ItemCardapio; onAddToCart: (item: ItemCardapio, tamanho: string, precoFinal: number, borda?: Borda) => void }> = ({ item, onAddToCart }) => {
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
    }

    return (
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 group flex flex-col">
            <img src={item.imagemUrl} alt={item.nome} className="w-full h-48 object-cover"/>
            <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-gray-800">{item.nome}</h3>
                <p className="text-gray-500 text-sm mt-1 h-10 flex-grow">{item.descricao}</p>
                
                <div className="mt-4 space-y-3">
                    {item.tamanhos && (
                        <div className="flex gap-2 flex-wrap">
                            {item.tamanhos.map(t => (
                                <button key={t.nome} onClick={() => setSelectedTamanho(t.nome)} className={`px-3 py-1 text-xs rounded-full font-semibold ${selectedTamanho === t.nome ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                    {t.nome}
                                </button>
                            ))}
                        </div>
                    )}
                    {item.bordas && item.bordas.length > 0 && (
                        <div>
                            <select onChange={(e) => setSelectedBorda(e.target.value ? item.bordas?.find(b => b.nome === e.target.value) : undefined)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm">
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

                <div className="mt-4 flex justify-between items-center pt-4 border-t">
                    <span className="text-2xl font-extrabold text-gray-900">R$ {precoFinal.toFixed(2)}</span>
                    <button onClick={handleAddToCart} className="bg-red-600 text-white rounded-full p-3 transform group-hover:scale-110 transition-transform duration-300">
                        <Icon name="plus" className="w-5 h-5"/>
                    </button>
                </div>
            </div>
        </div>
    );
};

const CartSidebar: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    cart: CartItem[];
    onUpdateQuantity: (itemId: string, tamanho: string, bordaNome: string | undefined, newQuantity: number) => void;
    total: number;
    onCheckout: () => void;
}> = ({ isOpen, onClose, cart, onUpdateQuantity, total, onCheckout }) => (
    <>
        <div onClick={onClose} className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />
        <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex flex-col h-full">
                <header className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Seu Pedido</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><Icon name="x" className="w-6 h-6"/></button>
                </header>
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                    {cart.length === 0 ? <p className="text-gray-500">Seu carrinho está vazio.</p> : cart.map(item => (
                        <div key={`${item.id}-${item.tamanho}-${item.borda?.nome}`} className="flex items-center gap-4">
                            <img src={item.imagemUrl} alt={item.nome} className="w-20 h-20 rounded-lg object-cover" />
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-800">{item.nome}</h4>
                                <p className="text-sm text-gray-500">{item.tamanho}</p>
                                {item.borda && <p className="text-xs text-orange-600 font-medium">+ Borda: {item.borda.nome}</p>}
                                <p className="font-bold text-red-600">R$ {item.precoFinal.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-100 rounded-full">
                                <button onClick={() => onUpdateQuantity(item.id, item.tamanho, item.borda?.nome, item.quantidade - 1)} className="p-2"><Icon name="minus" className="w-4 h-4"/></button>
                                <span className="font-bold w-6 text-center">{item.quantidade}</span>
                                <button onClick={() => onUpdateQuantity(item.id, item.tamanho, item.borda?.nome, item.quantidade + 1)} className="p-2"><Icon name="plus" className="w-4 h-4"/></button>
                            </div>
                        </div>
                    ))}
                </div>
                <footer className="p-6 border-t bg-gray-50 space-y-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total</span>
                        <span>R$ {total.toFixed(2)}</span>
                    </div>
                    <button onClick={onCheckout} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors disabled:opacity-50" disabled={cart.length === 0}>Finalizar Pedido</button>
                </footer>
            </div>
        </div>
    </>
);

// --- MAIN CARDAPIO COMPONENT ---

export default function Cardapio() {
  const { itens, categorias, isLoading, currentUser, logout } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const filteredItems = useMemo(() => {
    return itens.filter(item =>
        item.disponivel &&
        (selectedCategory === 'todos' || item.categoria === selectedCategory) &&
        (item.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
         item.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [itens, searchTerm, selectedCategory]);

  const addToCart = (item: ItemCardapio, tamanho: string, precoFinal: number, borda?: Borda) => {
    setCart(prev => {
        const cartKey = `${item.id}-${tamanho}-${borda?.nome || 'none'}`;
        const existing = prev.find(ci => `${ci.id}-${ci.tamanho}-${ci.borda?.nome || 'none'}` === cartKey);

        if (existing) {
            return prev.map(ci => (`${ci.id}-${ci.tamanho}-${ci.borda?.nome || 'none'}` === cartKey) ? { ...ci, quantidade: ci.quantidade + 1 } : ci);
        }
        return [...prev, { ...item, quantidade: 1, tamanho, precoFinal, borda }];
    });
  };

  const updateCartQuantity = (itemId: string, tamanho: string, bordaNome: string | undefined, newQuantity: number) => {
    const cartKey = `${itemId}-${tamanho}-${bordaNome || 'none'}`;
    if (newQuantity <= 0) {
        setCart(prev => prev.filter(ci => `${ci.id}-${ci.tamanho}-${ci.borda?.nome || 'none'}` !== cartKey));
    } else {
        setCart(prev => prev.map(ci => (`${ci.id}-${ci.tamanho}-${ci.borda?.nome || 'none'}` === cartKey) ? { ...ci, quantidade: newQuantity } : ci));
    }
  };

  const handleCheckout = () => {
      if (currentUser) {
          setShowCheckoutModal(true);
      } else {
          setShowLoginModal(true);
      }
      setShowCart(false);
  };
  
  const handleLoginSuccess = () => {
      setShowLoginModal(false);
      setShowCheckoutModal(true);
  };
  
  const handleOrderSuccess = () => {
    setShowCheckoutModal(false);
    setCart([]);
  }

  const isPublic = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('public') === '1';

  const handleShare = async () => {
    // Compartilhar link público do cardápio
    const url = `${window.location.origin}${window.location.pathname}?public=1${window.location.hash || ''}`;
    
    const shareData = {
        title: 'Confira nosso Cardápio!',
        text: 'Peça as melhores pizzas da cidade pelo nosso cardápio online!',
        url: url,
    };
    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            await navigator.clipboard.writeText(url);
            alert('Link do cardápio copiado para a área de transferência!');
        }
    } catch (error) {
        console.error('Erro ao compartilhar:', error);
        // Fallback for when sharing fails, e.g., on desktop browsers or due to user cancellation.
        try {
            await navigator.clipboard.writeText(url);
            alert('Não foi possível compartilhar. O link foi copiado para a área de transferência!');
        } catch (copyError) {
             console.error('Erro ao copiar link:', copyError);
             alert('Não foi possível compartilhar ou copiar o link.');
        }
    }
  };


  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.precoFinal * item.quantidade, 0), [cart]);
  const cartItemCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantidade, 0), [cart]);

  return (
    <div className="relative bg-gradient-to-br from-orange-50/30 to-red-50/30 min-h-full">
      <div className="sticky top-0 z-20 glass-effect border-b border-orange-100">
        <div className="p-6 space-y-6 container mx-auto">
          <div className="flex justify-between items-center">
             <h1 className="text-2xl md:text-4xl font-bold text-gray-900">Nosso Cardápio <span className="ml-2 text-xl md:text-3xl">🍕</span></h1>
             {currentUser ? (
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium hidden sm:inline">Olá, {currentUser.nome.split(' ')[0]}</span>
                    <button onClick={logout} className="p-2 rounded-full hover:bg-gray-100" title="Sair">
                        <Icon name="log-out" className="w-5 h-5 text-red-600"/>
                    </button>
                </div>
             ) : (
                <button onClick={() => setShowLoginModal(true)} className="flex items-center gap-2 font-semibold text-sm px-4 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors">
                    <Icon name="log-in" className="w-5 h-5"/>
                    <span>Entrar / Cadastrar</span>
                </button>
             )}
          </div>
          <p className="text-gray-600 text-lg max-w-2xl text-center mx-auto">Descubra sabores únicos preparados com ingredientes frescos e muito amor.</p>
          <div className="max-w-md mx-auto relative">
            <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
            <input type="text" placeholder="Buscar por pizza, ingrediente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-base rounded-2xl border-2 border-orange-100 focus:border-red-300 focus:ring-0 outline-none transition-colors" />
          </div>
          <CategoryFilter categories={categorias} selected={selectedCategory} onSelect={setSelectedCategory} />
        </div>
      </div>

      <div className="p-6 pb-32 container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {isLoading ? [...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-3xl h-48" />
              <div className="mt-4 space-y-3">
                <div className="bg-gray-200 h-6 rounded" />
                <div className="bg-gray-200 h-4 rounded w-3/4" />
                <div className="bg-gray-200 h-8 rounded w-1/2 ml-auto" />
              </div>
            </div>
          )) : filteredItems.map(item => <MenuCard key={item.id} item={item} onAddToCart={addToCart} />)}
        </div>
        {filteredItems.length === 0 && !isLoading && (
            <div className="text-center col-span-full py-20">
                <p className="text-2xl font-semibold text-gray-600">Nenhum item encontrado!</p>
                <p className="text-gray-400 mt-2">Tente ajustar seus filtros ou busca.</p>
            </div>
        )}
      </div>

      {!isPublic && (
        <div className="fixed bottom-6 right-6 z-30 flex flex-col gap-4">
            <button onClick={handleShare} className="flex items-center justify-center w-14 h-14 bg-blue-500 text-white font-bold rounded-full shadow-2xl pizza-shadow transform hover:scale-105 transition-transform" title="Compartilhar Cardápio">
                <Icon name="share-2" className="w-6 h-6"/>
            </button>
             {cartItemCount > 0 && (
                <button onClick={() => setShowCart(true)} className="flex items-center justify-center w-14 h-14 bg-red-600 text-white font-bold rounded-full shadow-2xl pizza-shadow transform hover:scale-105 transition-transform" title={`Ver Pedido (${cartItemCount} itens)`}>
                    <Icon name="shopping-cart" className="w-6 h-6"/>
                    <span className="absolute -top-1 -right-1 bg-white text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">{cartItemCount}</span>
                </button>
            )}
        </div>
      )}

      {!isPublic && <CartSidebar isOpen={showCart} onClose={() => setShowCart(false)} cart={cart} onUpdateQuantity={updateCartQuantity} total={cartTotal} onCheckout={handleCheckout} />}
      {!isPublic && showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} onSuccess={handleLoginSuccess} />}
      {!isPublic && showCheckoutModal && <CheckoutModal onClose={() => setShowCheckoutModal(false)} cart={cart} total={cartTotal} onOrderSuccess={handleOrderSuccess}/>}
    </div>
  );
}
