import express from 'express';
import { 
  mockPedidos, 
  addPedido, 
  updatePedidoStatus, 
  findPedidoById,
  updateMesaStatus 
} from '../models/mockData.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all pedidos
router.get('/', optionalAuth, (req, res) => {
  try {
    const { status, cliente, limit, offset } = req.query;
    
    let filteredPedidos = [...mockPedidos];

    // Filter by status
    if (status && status !== 'todos') {
      filteredPedidos = filteredPedidos.filter(p => p.status === status);
    }

    // Filter by cliente
    if (cliente) {
      filteredPedidos = filteredPedidos.filter(p => 
        p.cliente.nome.toLowerCase().includes(cliente.toLowerCase()) ||
        p.cliente.telefone.includes(cliente)
      );
    }

    // Sort by creation date (newest first)
    filteredPedidos.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

    // Pagination
    const limitNum = parseInt(limit) || filteredPedidos.length;
    const offsetNum = parseInt(offset) || 0;
    const paginatedPedidos = filteredPedidos.slice(offsetNum, offsetNum + limitNum);

    res.json({
      success: true,
      data: paginatedPedidos,
      total: filteredPedidos.length,
      limit: limitNum,
      offset: offsetNum
    });
  } catch (error) {
    console.error('Get pedidos error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get pedido by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const pedido = findPedidoById(id);

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    res.json({
      success: true,
      data: pedido
    });
  } catch (error) {
    console.error('Get pedido error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Create new pedido
router.post('/', (req, res) => {
  try {
    const {
      cliente,
      itens,
      valor_total,
      custo_total,
      lucro,
      tempo_estimado,
      tipo,
      mesaId,
      pagamento
    } = req.body;

    // Validation
    if (!cliente || !itens || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ error: 'Cliente e itens são obrigatórios' });
    }

    if (!valor_total || valor_total <= 0) {
      return res.status(400).json({ error: 'Valor total deve ser maior que zero' });
    }

    const newPedido = addPedido({
      cliente,
      itens,
      status: 'pendente',
      valor_total: parseFloat(valor_total),
      custo_total: parseFloat(custo_total) || 0,
      lucro: parseFloat(lucro) || (parseFloat(valor_total) - parseFloat(custo_total || 0)),
      tempo_estimado: parseInt(tempo_estimado) || 30,
      tipo: tipo || 'balcao',
      mesaId: mesaId ? parseInt(mesaId) : undefined,
      pagamento
    });

    // Update mesa status if it's a mesa order
    if (tipo === 'mesa' && mesaId) {
      updateMesaStatus(parseInt(mesaId), 'ocupada');
    }

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
router.patch('/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pendente', 'preparando', 'pronto', 'em rota de entrega', 'entregue', 'cancelado'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const updatedPedido = updatePedidoStatus(id, status);

    if (!updatedPedido) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    // Free mesa if order is completed and was a mesa order
    if ((status === 'entregue' || status === 'cancelado') && updatedPedido.tipo === 'mesa' && updatedPedido.mesaId) {
      updateMesaStatus(updatedPedido.mesaId, 'livre');
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
router.get('/stats/summary', (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayPedidos = mockPedidos.filter(p => {
      const pedidoDate = new Date(p.created_date);
      pedidoDate.setHours(0, 0, 0, 0);
      return pedidoDate.getTime() === today.getTime();
    });

    const activePedidos = mockPedidos.filter(p => 
      ['pendente', 'preparando', 'pronto', 'em rota de entrega'].includes(p.status)
    );

    const deliveredToday = todayPedidos.filter(p => p.status === 'entregue');
    const revenueToday = deliveredToday.reduce((sum, p) => sum + p.valor_total, 0);
    const profitToday = deliveredToday.reduce((sum, p) => sum + p.lucro, 0);

    res.json({
      success: true,
      data: {
        activePedidos: activePedidos.length,
        todayOrders: todayPedidos.length,
        deliveredToday: deliveredToday.length,
        revenueToday,
        profitToday,
        pendingOrders: mockPedidos.filter(p => p.status === 'pendente').length,
        preparingOrders: mockPedidos.filter(p => p.status === 'preparando').length,
        readyOrders: mockPedidos.filter(p => p.status === 'pronto').length
      }
    });
  } catch (error) {
    console.error('Get pedidos stats error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;