import express from 'express';
import { 
  mockClientes, 
  addCliente, 
  updateCliente, 
  deleteCliente, 
  findClienteById,
  mockPedidos 
} from '../models/mockData.js';

const router = express.Router();

// Get all clientes
router.get('/', (req, res) => {
  try {
    const { search, limit, offset } = req.query;
    
    let filteredClientes = [...mockClientes];

    // Search by name or phone
    if (search) {
      const searchLower = search.toLowerCase();
      filteredClientes = filteredClientes.filter(c => 
        c.nome.toLowerCase().includes(searchLower) ||
        c.telefone.includes(search)
      );
    }

    // Add statistics for each cliente
    const clientesWithStats = filteredClientes.map(cliente => {
      const clientePedidos = mockPedidos.filter(p => p.cliente.id === cliente.id && p.status === 'entregue');
      const totalGasto = clientePedidos.reduce((acc, p) => acc + p.valor_total, 0);
      
      return {
        ...cliente,
        totalPedidos: clientePedidos.length,
        totalGasto
      };
    });

    // Sort by total spent (descending)
    clientesWithStats.sort((a, b) => b.totalGasto - a.totalGasto);

    // Pagination
    const limitNum = parseInt(limit) || clientesWithStats.length;
    const offsetNum = parseInt(offset) || 0;
    const paginatedClientes = clientesWithStats.slice(offsetNum, offsetNum + limitNum);

    res.json({
      success: true,
      data: paginatedClientes,
      total: clientesWithStats.length,
      limit: limitNum,
      offset: offsetNum
    });
  } catch (error) {
    console.error('Get clientes error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get cliente by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const cliente = findClienteById(id);

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    // Add statistics
    const clientePedidos = mockPedidos.filter(p => p.cliente.id === cliente.id);
    const pedidosEntregues = clientePedidos.filter(p => p.status === 'entregue');
    const totalGasto = pedidosEntregues.reduce((acc, p) => acc + p.valor_total, 0);

    res.json({
      success: true,
      data: {
        ...cliente,
        totalPedidos: pedidosEntregues.length,
        totalGasto,
        pedidosRecentes: clientePedidos.slice(0, 5)
      }
    });
  } catch (error) {
    console.error('Get cliente error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Create new cliente
router.post('/', (req, res) => {
  try {
    const { nome, telefone, endereco } = req.body;

    // Validation
    if (!nome || !telefone) {
      return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
    }

    // Check if telefone already exists
    const existingCliente = mockClientes.find(c => c.telefone === telefone);
    if (existingCliente) {
      return res.status(409).json({ error: 'Já existe um cliente com este telefone' });
    }

    const newCliente = addCliente({
      nome,
      telefone,
      endereco: endereco || ''
    });

    res.status(201).json({
      success: true,
      data: newCliente
    });
  } catch (error) {
    console.error('Create cliente error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Update cliente
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { nome, telefone, endereco } = req.body;

    // Validation
    if (!nome || !telefone) {
      return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
    }

    // Check if telefone already exists for another cliente
    const existingCliente = mockClientes.find(c => c.telefone === telefone && c.id !== id);
    if (existingCliente) {
      return res.status(409).json({ error: 'Já existe outro cliente com este telefone' });
    }

    const updatedCliente = updateCliente(id, {
      nome,
      telefone,
      endereco: endereco || ''
    });

    if (!updatedCliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json({
      success: true,
      data: updatedCliente
    });
  } catch (error) {
    console.error('Update cliente error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Delete cliente
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if cliente has any pedidos
    const clientePedidos = mockPedidos.filter(p => p.cliente.id === id);
    if (clientePedidos.length > 0) {
      return res.status(400).json({ 
        error: 'Não é possível excluir cliente que possui pedidos' 
      });
    }

    const deletedCliente = deleteCliente(id);

    if (!deletedCliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json({
      success: true,
      message: 'Cliente excluído com sucesso',
      data: deletedCliente
    });
  } catch (error) {
    console.error('Delete cliente error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;