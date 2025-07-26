import express from 'express';
import { 
  getAllPedidos,
  addPedido, 
  updatePedidoStatus, 
  findPedidoById
} from '../services/databaseService.js';

const router = express.Router();

// Get all pedidos
router.get('/', async (req, res) => {
  try {
    const { status, tipo, limit, offset } = req.query;
    
    let pedidos = await getAllPedidos();

    // Filter by status
    if (status) {
      pedidos = pedidos.filter(p => p.status === status);
    }

    // Filter by tipo
    if (tipo) {
      pedidos = pedidos.filter(p => p.tipo === tipo);
    }

    // Pagination
    const limitNum = parseInt(limit) || pedidos.length;
    const offsetNum = parseInt(offset) || 0;
    const paginatedPedidos = pedidos.slice(offsetNum, offsetNum + limitNum);

    res.json({
      success: true,
      data: paginatedPedidos.map(pedido => pedido.toJSON()),
      total: pedidos.length,
      limit: limitNum,
      offset: offsetNum
    });
  } catch (error) {
    console.error('Get pedidos error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get pedido by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pedido = await findPedidoById(id);

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    res.json({
      success: true,
      data: pedido.toJSON()
    });
  } catch (error) {
    console.error('Get pedido error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Create new pedido
router.post('/', async (req, res) => {
  try {
    const { clienteId, itens, tipo, mesaId, valor_total, custo_total } = req.body;

    // Validation
    if (!clienteId || !itens || !tipo) {
      return res.status(400).json({ error: 'Cliente, itens e tipo são obrigatórios' });
    }

    if (!Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ error: 'Pedido deve ter pelo menos um item' });
    }

    const validTipos = ['delivery', 'mesa', 'balcao'];
    if (!validTipos.includes(tipo)) {
      return res.status(400).json({ error: 'Tipo inválido' });
    }

    const lucro = valor_total - custo_total;
    const tempo_estimado = 30; // Default time

    const newPedido = await addPedido({
      clienteId,
      valor_total,
      custo_total,
      lucro,
      tempo_estimado,
      status: 'pendente',
      tipo,
      mesaId: tipo === 'mesa' ? mesaId : null
    });

    res.status(201).json({
      success: true,
      data: newPedido
    });
  } catch (error) {
    console.error('Create pedido error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Update pedido status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validation
    if (!status) {
      return res.status(400).json({ error: 'Status é obrigatório' });
    }

    const validStatuses = ['pendente', 'preparando', 'pronto', 'entregue', 'cancelado', 'em rota de entrega'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const updatedPedido = await updatePedidoStatus(id, status);

    if (!updatedPedido) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    res.json({
      success: true,
      data: updatedPedido
    });
  } catch (error) {
    console.error('Update pedido status error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get pedidos statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const pedidos = await getAllPedidos();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayPedidos = pedidos.filter(p => {
      const pedidoDate = new Date(p.createdAt);
      return pedidoDate >= today;
    });

    const activePedidos = pedidos.filter(p =>
      ['pendente', 'preparando', 'pronto', 'em rota de entrega'].includes(p.status)
    );

    const totalRevenue = todayPedidos
      .filter(p => p.status === 'entregue')
      .reduce((acc, p) => acc + p.valor_total, 0);

    const totalProfit = todayPedidos
      .filter(p => p.status === 'entregue')
      .reduce((acc, p) => acc + p.lucro, 0);

    res.json({
      success: true,
      data: {
        todayOrders: todayPedidos.length,
        activeOrders: activePedidos.length,
        totalRevenue,
        totalProfit,
        pendingOrders: pedidos.filter(p => p.status === 'pendente').length,
        preparingOrders: pedidos.filter(p => p.status === 'preparando').length,
        readyOrders: pedidos.filter(p => p.status === 'pronto').length
      }
    });
  } catch (error) {
    console.error('Get pedidos stats error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;