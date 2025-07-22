import { v4 as uuidv4 } from 'uuid';

// Mock data storage (in production, this would be a database)
let mockClientes = [
  { id: 'c1', nome: 'João Silva', telefone: '(11) 98765-4321', endereco: 'Rua das Flores, 123, São Paulo, SP' },
  { id: 'c2', nome: 'Maria Oliveira', telefone: '(21) 91234-5678', endereco: 'Avenida Copacabana, 456, Rio de Janeiro, RJ' },
  { id: 'c3', nome: 'Carlos Pereira', telefone: '(31) 99999-8888', endereco: 'Praça da Liberdade, 789, Belo Horizonte, MG' },
  { id: 'c4', nome: 'Ana Costa', telefone: '(51) 98888-7777', endereco: 'Rua da Praia, 101, Porto Alegre, RS' },
  { id: 'c5', nome: 'Pedro Martins', telefone: '(71) 97777-6666', endereco: 'Largo do Pelourinho, 202, Salvador, BA' },
  { id: 'c6', nome: 'Juliana Santos', telefone: '(81) 96666-5555', endereco: 'Avenida Boa Viagem, 303, Recife, PE' },
  { id: 'c7', nome: 'Rafael Souza', telefone: '(41) 95555-4444', endereco: 'Rua XV de Novembro, 404, Curitiba, PR' },
];

let mockItensCardapio = [
  { 
    id: 'p1', 
    nome: 'Pizza Margherita', 
    descricao: 'Molho de tomate fresco, mozzarella de búfala e manjericão.', 
    preco: 45.00, 
    custo: 15.50, 
    categoria: 'pizza', 
    disponivel: true, 
    imagemUrl: 'https://picsum.photos/seed/margherita/400/300', 
    tamanhos: [
      { nome: 'Média', precoAdicional: 0 }, 
      { nome: 'Grande', precoAdicional: 10 }
    ], 
    bordas: [
      { nome: 'Catupiry', precoAdicional: 5}, 
      { nome: 'Cheddar', precoAdicional: 5}
    ] 
  },
  { 
    id: 'p2', 
    nome: 'Pizza Pepperoni', 
    descricao: 'Pepperoni picante, queijo mozzarella e molho de tomate especial.', 
    preco: 50.00, 
    custo: 18.00, 
    categoria: 'pizza', 
    disponivel: true, 
    imagemUrl: 'https://picsum.photos/seed/pepperoni/400/300', 
    tamanhos: [
      { nome: 'Média', precoAdicional: 0 }, 
      { nome: 'Grande', precoAdicional: 12 }
    ], 
    bordas: [
      { nome: 'Catupiry', precoAdicional: 6}, 
      { nome: 'Cheddar', precoAdicional: 6}
    ] 
  },
  { 
    id: 'p3', 
    nome: 'Pizza Quatro Queijos', 
    descricao: 'Uma combinação cremosa de mozzarella, provolone, parmesão e gorgonzola.', 
    preco: 55.00, 
    custo: 20.50, 
    categoria: 'pizza', 
    disponivel: true, 
    imagemUrl: 'https://picsum.photos/seed/4queijos/400/300', 
    tamanhos: [
      { nome: 'Média', precoAdicional: 0 }, 
      { nome: 'Grande', precoAdicional: 15 }
    ] 
  },
  { 
    id: 'p4', 
    nome: 'Pizza Frango com Catupiry', 
    descricao: 'Frango desfiado, catupiry cremoso, milho e azeitonas.', 
    preco: 52.00, 
    custo: 19.00, 
    categoria: 'pizza', 
    disponivel: true, 
    imagemUrl: 'https://picsum.photos/seed/frango/400/300', 
    tamanhos: [
      { nome: 'Média', precoAdicional: 0 }, 
      { nome: 'Grande', precoAdicional: 13 }
    ] 
  },
  { 
    id: 'p5', 
    nome: 'Pizza Portuguesa', 
    descricao: 'Presunto, queijo, ovo, cebola, azeitona e pimentão.', 
    preco: 48.00, 
    custo: 17.00, 
    categoria: 'pizza', 
    disponivel: true, 
    imagemUrl: 'https://picsum.photos/seed/portuguesa/400/300', 
    tamanhos: [
      { nome: 'Média', precoAdicional: 0 }, 
      { nome: 'Grande', precoAdicional: 11 }
    ] 
  },
  { 
    id: 'b1', 
    nome: 'Coca-Cola', 
    descricao: 'Lata 350ml', 
    preco: 6.00, 
    custo: 2.50, 
    categoria: 'bebida', 
    disponivel: true, 
    imagemUrl: 'https://picsum.photos/seed/cocacola/400/300' 
  },
  { 
    id: 'b2', 
    nome: 'Suco de Laranja', 
    descricao: 'Natural, 500ml', 
    preco: 9.00, 
    custo: 3.00, 
    categoria: 'bebida', 
    disponivel: true, 
    imagemUrl: 'https://picsum.photos/seed/laranja/400/300' 
  },
  { 
    id: 's1', 
    nome: 'Tiramisu', 
    descricao: 'Clássica sobremesa italiana com café e cacau.', 
    preco: 22.00, 
    custo: 8.00, 
    categoria: 'sobremesa', 
    disponivel: true, 
    imagemUrl: 'https://picsum.photos/seed/tiramisu/400/300' 
  },
  { 
    id: 's2', 
    nome: 'Brownie com Sorvete', 
    descricao: 'Brownie quente de chocolate com uma bola de sorvete de creme.', 
    preco: 25.00, 
    custo: 9.50, 
    categoria: 'sobremesa', 
    disponivel: true, 
    imagemUrl: 'https://picsum.photos/seed/brownie/400/300' 
  },
  { 
    id: 'e1', 
    nome: 'Bruschetta de Tomate', 
    descricao: 'Pão italiano tostado com tomates frescos, alho e manjericão.', 
    preco: 18.00, 
    custo: 6.00, 
    categoria: 'entrada', 
    disponivel: true, 
    imagemUrl: 'https://picsum.photos/seed/bruschetta/400/300' 
  },
  { 
    id: 'a1', 
    nome: 'Batata Frita', 
    descricao: 'Porção generosa de batatas fritas crocantes.', 
    preco: 20.00, 
    custo: 7.00, 
    categoria: 'acompanhamento', 
    disponivel: true, 
    imagemUrl: 'https://picsum.photos/seed/batata/400/300' 
  },
];

let mockMesas = Array.from({ length: 16 }, (_, i) => ({
  id: i + 1,
  numero: i + 1,
  capacidade: (i % 3 + 1) * 2,
  status: Math.random() > 0.4 ? 'ocupada' : 'livre',
}));

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomStatus = () => {
  const statuses = ['pendente', 'preparando', 'pronto', 'entregue', 'cancelado', 'em rota de entrega'];
  return getRandomItem(statuses);
};

let mockPedidos = Array.from({ length: 50 }, (_, i) => {
  const itensCount = Math.floor(Math.random() * 3) + 1;
  let valor_total = 0;
  let custo_total = 0;
  const itens = Array.from({ length: itensCount }, () => {
    const item = getRandomItem(mockItensCardapio.filter(i => i.disponivel));
    const tamanho = item.tamanhos ? getRandomItem(item.tamanhos) : undefined;
    const borda = item.bordas && Math.random() > 0.5 ? getRandomItem(item.bordas) : undefined;
    
    let precoItem = item.preco;
    if(tamanho) precoItem += tamanho.precoAdicional;
    if(borda) precoItem += borda.precoAdicional;

    valor_total += precoItem;
    custo_total += (item.custo || 0) * 1;

    return { 
      item, 
      quantidade: 1, 
      tamanho: tamanho?.nome, 
      borda: borda 
    };
  });
  
  const lucro = valor_total - custo_total;
  const created_date = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000 * 7);
  const statusChangeTime = new Date(created_date.getTime() + Math.random() * (Date.now() - created_date.getTime()));

  const tipos = ['delivery', 'mesa', 'balcao'];
  const tipo = getRandomItem(tipos);
  const mesaId = tipo === 'mesa' ? getRandomItem(mockMesas).id : undefined;

  const pagamentoMetodo = Math.random() > 0.5 ? 'dinheiro' : 'cartao';
  const pagamento = {
    metodo: pagamentoMetodo,
    trocoPara: pagamentoMetodo === 'dinheiro' && Math.random() > 0.7 ? Math.ceil(valor_total / 10) * 10 + 10 : undefined
  };

  return {
    id: `ped${i + 1}`,
    cliente: getRandomItem(mockClientes),
    itens,
    status: getRandomStatus(),
    valor_total,
    custo_total,
    lucro,
    created_date: created_date.toISOString(),
    tempo_estimado: Math.floor(Math.random() * 20) + 20,
    statusChangeTime: statusChangeTime.toISOString(),
    tipo,
    mesaId,
    pagamento
  };
});

let mockPizzeriaInfo = {
  nome: 'Pizzaria Bella',
  endereco: 'Rua das Pizzas, 123, Saborlândia',
  telefone: '(11) 98765-4321',
  logoUrl: '',
  prepTimes: {
    pizza: 15,
    bebida: 1,
    sobremesa: 5,
    entrada: 7,
    acompanhamento: 10,
  },
  autoStartOrders: false,
  statusTimings: {
    pendente: { 'pizza': 1, 'bebida': 1, 'sobremesa': 1, 'entrada': 1, 'acompanhamento': 1, 'default': 1 },
    preparando: { 'pizza': 8, 'bebida': 1, 'sobremesa': 4, 'entrada': 5, 'acompanhamento': 5, 'default': 5 },
    pronto: { 'pizza': 2, 'bebida': 1, 'sobremesa': 1, 'entrada': 1, 'acompanhamento': 1, 'default': 2 },
    'em rota de entrega': { 'pizza': 15, 'bebida': 15, 'sobremesa': 15, 'entrada': 15, 'acompanhamento': 15, 'default': 15 },
  }
};

// Export data and helper functions
export {
  mockClientes,
  mockItensCardapio,
  mockMesas,
  mockPedidos,
  mockPizzeriaInfo
};

// Helper functions for data manipulation
export const generateId = () => uuidv4();

export const findClienteById = (id) => mockClientes.find(c => c.id === id);
export const findClienteByTelefone = (telefone) => mockClientes.find(c => c.telefone === telefone);
export const addCliente = (cliente) => {
  const newCliente = { ...cliente, id: generateId() };
  mockClientes.push(newCliente);
  return newCliente;
};
export const updateCliente = (id, updates) => {
  const index = mockClientes.findIndex(c => c.id === id);
  if (index !== -1) {
    mockClientes[index] = { ...mockClientes[index], ...updates };
    return mockClientes[index];
  }
  return null;
};
export const deleteCliente = (id) => {
  const index = mockClientes.findIndex(c => c.id === id);
  if (index !== -1) {
    return mockClientes.splice(index, 1)[0];
  }
  return null;
};

export const findItemById = (id) => mockItensCardapio.find(i => i.id === id);
export const addItem = (item) => {
  const newItem = { ...item, id: generateId() };
  mockItensCardapio.push(newItem);
  return newItem;
};
export const updateItem = (id, updates) => {
  const index = mockItensCardapio.findIndex(i => i.id === id);
  if (index !== -1) {
    mockItensCardapio[index] = { ...mockItensCardapio[index], ...updates };
    return mockItensCardapio[index];
  }
  return null;
};
export const deleteItem = (id) => {
  const index = mockItensCardapio.findIndex(i => i.id === id);
  if (index !== -1) {
    return mockItensCardapio.splice(index, 1)[0];
  }
  return null;
};

export const findMesaById = (id) => mockMesas.find(m => m.id === id);
export const updateMesaStatus = (id, status) => {
  const mesa = findMesaById(id);
  if (mesa) {
    mesa.status = status;
    return mesa;
  }
  return null;
};

export const findPedidoById = (id) => mockPedidos.find(p => p.id === id);
export const addPedido = (pedido) => {
  const newPedido = { 
    ...pedido, 
    id: generateId(),
    created_date: new Date().toISOString(),
    statusChangeTime: new Date().toISOString()
  };
  mockPedidos.unshift(newPedido);
  return newPedido;
};
export const updatePedidoStatus = (id, status) => {
  const pedido = findPedidoById(id);
  if (pedido) {
    pedido.status = status;
    pedido.statusChangeTime = new Date().toISOString();
    return pedido;
  }
  return null;
};

export const updatePizzeriaInfo = (info) => {
  mockPizzeriaInfo = { ...mockPizzeriaInfo, ...info };
  return mockPizzeriaInfo;
};