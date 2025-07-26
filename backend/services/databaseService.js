const { Cliente, Mesa, ItemCardapio, Pedido, PedidoItem } = require('../models');

// Helper functions for data manipulation
const generateId = () => require('uuid').v4();

// Cliente functions
const findClienteById = async (id) => {
  try {
    return await Cliente.findByPk(id);
  } catch (error) {
    console.error('Error finding cliente by ID:', error);
    return null;
  }
};

const findClienteByTelefone = async (telefone) => {
  try {
    return await Cliente.findOne({ where: { telefone } });
  } catch (error) {
    console.error('Error finding cliente by telefone:', error);
    return null;
  }
};

const addCliente = async (cliente) => {
  try {
    return await Cliente.create(cliente);
  } catch (error) {
    console.error('Error adding cliente:', error);
    throw error;
  }
};

const updateCliente = async (id, updates) => {
  try {
    const cliente = await Cliente.findByPk(id);
    if (cliente) {
      return await cliente.update(updates);
    }
    return null;
  } catch (error) {
    console.error('Error updating cliente:', error);
    throw error;
  }
};

const deleteCliente = async (id) => {
  try {
    const cliente = await Cliente.findByPk(id);
    if (cliente) {
      await cliente.destroy();
      return cliente;
    }
    return null;
  } catch (error) {
    console.error('Error deleting cliente:', error);
    throw error;
  }
};

const getAllClientes = async () => {
  try {
    return await Cliente.findAll();
  } catch (error) {
    console.error('Error getting all clientes:', error);
    return [];
  }
};

// ItemCardapio functions
const findItemById = async (id) => {
  try {
    return await ItemCardapio.findByPk(id);
  } catch (error) {
    console.error('Error finding item by ID:', error);
    return null;
  }
};

const addItem = async (item) => {
  try {
    return await ItemCardapio.create(item);
  } catch (error) {
    console.error('Error adding item:', error);
    throw error;
  }
};

const updateItem = async (id, updates) => {
  try {
    const item = await ItemCardapio.findByPk(id);
    if (item) {
      return await item.update(updates);
    }
    return null;
  } catch (error) {
    console.error('Error updating item:', error);
    throw error;
  }
};

const deleteItem = async (id) => {
  try {
    const item = await ItemCardapio.findByPk(id);
    if (item) {
      await item.destroy();
      return item;
    }
    return null;
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
};

const getAllItens = async () => {
  try {
    return await ItemCardapio.findAll();
  } catch (error) {
    console.error('Error getting all itens:', error);
    return [];
  }
};

// Mesa functions
const findMesaById = async (id) => {
  try {
    return await Mesa.findByPk(id);
  } catch (error) {
    console.error('Error finding mesa by ID:', error);
    return null;
  }
};

const updateMesaStatus = async (id, status) => {
  try {
    const mesa = await Mesa.findByPk(id);
    if (mesa) {
      return await mesa.update({ status });
    }
    return null;
  } catch (error) {
    console.error('Error updating mesa status:', error);
    throw error;
  }
};

const getAllMesas = async () => {
  try {
    return await Mesa.findAll();
  } catch (error) {
    console.error('Error getting all mesas:', error);
    return [];
  }
};

// Pedido functions
const findPedidoById = async (id) => {
  try {
    return await Pedido.findByPk(id, {
      include: [
        { model: Cliente },
        { model: Mesa },
        { model: PedidoItem, include: [{ model: ItemCardapio }] }
      ]
    });
  } catch (error) {
    console.error('Error finding pedido by ID:', error);
    return null;
  }
};

const addPedido = async (pedido) => {
  try {
    return await Pedido.create(pedido);
  } catch (error) {
    console.error('Error adding pedido:', error);
    throw error;
  }
};

const updatePedidoStatus = async (id, status) => {
  try {
    const pedido = await Pedido.findByPk(id);
    if (pedido) {
      return await pedido.update({ 
        status,
        statusChangeTime: new Date()
      });
    }
    return null;
  } catch (error) {
    console.error('Error updating pedido status:', error);
    throw error;
  }
};

const getAllPedidos = async () => {
  try {
    return await Pedido.findAll({
      include: [
        { model: Cliente },
        { model: Mesa },
        { model: PedidoItem, include: [{ model: ItemCardapio }] }
      ],
      order: [['createdAt', 'DESC']]
    });
  } catch (error) {
    console.error('Error getting all pedidos:', error);
    return [];
  }
};

// Pizzeria info (for now, we'll keep this in memory or create a separate table later)
let pizzeriaInfo = {
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

const updatePizzeriaInfo = (info) => {
  pizzeriaInfo = { ...pizzeriaInfo, ...info };
  return pizzeriaInfo;
};

const getPizzeriaInfo = () => pizzeriaInfo;

module.exports = {
  // Helper functions
  generateId,
  
  // Cliente functions
  findClienteById,
  findClienteByTelefone,
  addCliente,
  updateCliente,
  deleteCliente,
  getAllClientes,
  
  // ItemCardapio functions
  findItemById,
  addItem,
  updateItem,
  deleteItem,
  getAllItens,
  
  // Mesa functions
  findMesaById,
  updateMesaStatus,
  getAllMesas,
  
  // Pedido functions
  findPedidoById,
  addPedido,
  updatePedidoStatus,
  getAllPedidos,
  
  // Pizzeria info
  updatePizzeriaInfo,
  getPizzeriaInfo
}; 