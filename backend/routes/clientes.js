import express from 'express';
import { 
  getAllClientes,
  addCliente, 
  updateCliente, 
  deleteCliente, 
  findClienteById,
  getAllPedidos
} from '../services/databaseService.js';

const router = express.Router();

// Get all clientes
router.get('/', async (req, res) => {
  try {
    const { search, limit, offset } = req.query;
    
    let clientes = await getAllClientes();

    // Search by name or phone
    if (search) {
      const searchLower = search.toLowerCase();
      clientes = clientes.filter(c => 
        c.nome.toLowerCase().includes(searchLower) ||
        c.telefone.includes(search)
      );
    }

    // Add statistics for each cliente
    const pedidos = await getAllPedidos();
    const clientesWithStats = clientes.map(cliente => {
      const clientePedidos = pedidos.filter(p => p.clienteId === cliente.id && p.status === 'entregue');
      const totalGasto = clientePedidos.reduce((acc, p) => acc + p.valor_total, 0);
      
      return {
        ...cliente.toJSON(),
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
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await findClienteById(id);

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    // Add statistics
    const pedidos = await getAllPedidos();
    const clientePedidos = pedidos.filter(p => p.clienteId === cliente.id);
    const pedidosEntregues = clientePedidos.filter(p => p.status === 'entregue');
    const totalGasto = pedidosEntregues.reduce((acc, p) => acc + p.valor_total, 0);

    res.json({
      success: true,
      data: {
        ...cliente.toJSON(),
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
router.post('/', async (req, res) => {
  try {
    const { nome, telefone, endereco } = req.body;

    // Validation
    if (!nome || !telefone) {
      return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
    }

    // Check if telefone already exists
    const existingCliente = await findClienteByTelefone(telefone);
    if (existingCliente) {
      return res.status(400).json({ error: 'Telefone já cadastrado' });
    }

    const newCliente = await addCliente({ nome, telefone, endereco });

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
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, telefone, endereco } = req.body;

    // Validation
    if (!nome || !telefone) {
      return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
    }

    // Check if telefone already exists for another cliente
    const existingCliente = await findClienteByTelefone(telefone);
    if (existingCliente && existingCliente.id !== parseInt(id)) {
      return res.status(400).json({ error: 'Telefone já cadastrado para outro cliente' });
    }

    const updatedCliente = await updateCliente(id, { nome, telefone, endereco });

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
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if cliente has active pedidos
    const pedidos = await getAllPedidos();
    const clientePedidos = pedidos.filter(p => p.clienteId === parseInt(id) && p.status !== 'entregue' && p.status !== 'cancelado');
    
    if (clientePedidos.length > 0) {
      return res.status(400).json({ 
        error: 'Não é possível excluir cliente com pedidos ativos',
        activeOrders: clientePedidos.length
      });
    }

    const deletedCliente = await deleteCliente(id);

    if (!deletedCliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json({
      success: true,
      message: 'Cliente excluído com sucesso'
    });
  } catch (error) {
    console.error('Delete cliente error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;