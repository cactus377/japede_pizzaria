

export interface Borda {
    nome: string;
    precoAdicional: number;
}

export interface Pedido {
    id: string;
    cliente: Cliente;
    itens: { item: ItemCardapio; quantidade: number; tamanho?: string; borda?: Borda }[];
    status: 'pendente' | 'preparando' | 'pronto' | 'em rota de entrega' | 'entregue' | 'cancelado';
    valor_total: number;
    custo_total: number;
    lucro: number;
    created_date: Date;
    tempo_estimado: number; 
    statusChangeTime: Date;
    tipo: 'delivery' | 'mesa' | 'balcao';
    mesaId?: number;
    pagamento?: {
        metodo: 'dinheiro' | 'cartao';
        trocoPara?: number;
    }
}

export interface Mesa {
    id: number;
    numero: number;
    capacidade: number;
    status: 'livre' | 'ocupada' | 'reservada';
}

export interface ItemCardapio {
    id: string;
    nome: string;
    descricao: string;
    preco: number;
    custo?: number;
    categoria: string;
    disponivel: boolean;
    imagemUrl: string;
    tamanhos?: { nome: string; precoAdicional: number }[];
    bordas?: Borda[];
}

export interface Cliente {
    id: string;
    nome: string;
    telefone: string;
    endereco: string;
}

export interface CartItem extends ItemCardapio {
    quantidade: number;
    tamanho: string;
    precoFinal: number;
    borda?: Borda;
}

export interface PizzeriaInfo {
    nome: string;
    endereco: string;
    telefone: string;
    logoUrl: string;
    prepTimes: Record<string, number>; // Maintained for other potential uses
    autoStartOrders: boolean;
    // statusTimings now handles timings for each status, broken down by category.
    // e.g., { 'preparando': { 'pizza': 10, 'bebida': 1, 'default': 5 } }
    statusTimings: Partial<Record<Pedido['status'], Record<string, number>>>;
}

export interface DataContextType {
    pedidos: Pedido[];
    mesas: Mesa[];
    itens: ItemCardapio[];
    categorias: string[];
    clientes: Cliente[];
    isLoading: boolean;
    updatePedidoStatus: (pedidoId: string, status: Pedido['status']) => void;
    updateMesaStatus: (mesaId: number, status: Mesa['status']) => void;
    addPedido: (pedido: Pedido) => void;
    addCliente: (cliente: Omit<Cliente, 'id'>) => Cliente;
    updateCliente: (cliente: Cliente) => void;
    deleteCliente: (clienteId: string) => void;
    saveItem: (item: ItemCardapio) => void;
    deleteItem: (itemId: string) => void;
    addCategoria: (categoria: string) => void;
    pizzeriaInfo: PizzeriaInfo;
    updatePizzeriaInfo: (info: PizzeriaInfo) => void;
    // Auth
    currentUser: Cliente | null;
    login: (telefone: string) => boolean;
    logout: () => void;
    register: (clienteData: Omit<Cliente, 'id'>) => Cliente | null;
}