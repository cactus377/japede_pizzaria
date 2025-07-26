import express from 'express';
import { getAllPedidos, getAllItens } from '../services/databaseService.js';

const router = express.Router();

// Get sales report
router.get('/sales', async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    
    let pedidos = await getAllPedidos();

    // Filter by date range
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();
      
      pedidos = pedidos.filter(p => {
        const pedidoDate = new Date(p.createdAt);
        return pedidoDate >= start && pedidoDate <= end;
      });
    }

    // Filter by status
    if (status) {
      pedidos = pedidos.filter(p => p.status === status);
    }

    // Calculate totals
    const totalRevenue = pedidos
      .filter(p => p.status === 'entregue')
      .reduce((acc, p) => acc + p.valor_total, 0);

    const totalProfit = pedidos
      .filter(p => p.status === 'entregue')
      .reduce((acc, p) => acc + p.lucro, 0);

    const totalOrders = pedidos.length;
    const deliveredOrders = pedidos.filter(p => p.status === 'entregue').length;

    // Group by date
    const salesByDate = {};
    pedidos.forEach(pedido => {
      const date = new Date(pedido.createdAt).toISOString().split('T')[0];
      if (!salesByDate[date]) {
        salesByDate[date] = {
          date,
          orders: 0,
          revenue: 0,
          profit: 0
        };
      }
      salesByDate[date].orders++;
      if (pedido.status === 'entregue') {
        salesByDate[date].revenue += pedido.valor_total;
        salesByDate[date].profit += pedido.lucro;
      }
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalOrders,
          deliveredOrders,
          totalRevenue,
          totalProfit,
          averageOrderValue: deliveredOrders > 0 ? totalRevenue / deliveredOrders : 0
        },
        salesByDate: Object.values(salesByDate).sort((a, b) => a.date.localeCompare(b.date))
      }
    });
  } catch (error) {
    console.error('Get sales report error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get items report
router.get('/items', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const pedidos = await getAllPedidos();
    const itens = await getAllItens();

    // Filter by date range
    let filteredPedidos = pedidos;
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();
      
      filteredPedidos = pedidos.filter(p => {
        const pedidoDate = new Date(p.createdAt);
        return pedidoDate >= start && pedidoDate <= end;
      });
    }

    // Count item sales
    const itemSales = {};
    filteredPedidos.forEach(pedido => {
      if (pedido.PedidoItems) {
        pedido.PedidoItems.forEach(item => {
          const itemId = item.itemCardapioId;
          if (!itemSales[itemId]) {
            itemSales[itemId] = {
              id: itemId,
              quantidade: 0,
              revenue: 0
            };
          }
          itemSales[itemId].quantidade += item.quantidade;
          itemSales[itemId].revenue += item.quantidade * (item.ItemCardapio?.preco || 0);
        });
      }
    });

    // Combine with item info
    const itemsReport = itens.map(item => ({
      ...item.toJSON(),
      vendas: itemSales[item.id]?.quantidade || 0,
      receita: itemSales[item.id]?.revenue || 0
    }));

    // Sort by sales
    itemsReport.sort((a, b) => b.vendas - a.vendas);

    res.json({
      success: true,
      data: itemsReport
    });
  } catch (error) {
    console.error('Get items report error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get dashboard stats
router.get('/dashboard', async (req, res) => {
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

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 7);
    
    const weekPedidos = pedidos.filter(p => {
      const pedidoDate = new Date(p.createdAt);
      return pedidoDate >= weekStart;
    });

    const totalRevenue = todayPedidos
      .filter(p => p.status === 'entregue')
      .reduce((acc, p) => acc + p.valor_total, 0);

    const totalProfit = todayPedidos
      .filter(p => p.status === 'entregue')
      .reduce((acc, p) => acc + p.lucro, 0);

    const weekRevenue = weekPedidos
      .filter(p => p.status === 'entregue')
      .reduce((acc, p) => acc + p.valor_total, 0);

    res.json({
      success: true,
      data: {
        today: {
          orders: todayPedidos.length,
          revenue: totalRevenue,
          profit: totalProfit
        },
        week: {
          orders: weekPedidos.length,
          revenue: weekRevenue
        },
        active: {
          orders: activePedidos.length,
          pending: pedidos.filter(p => p.status === 'pendente').length,
          preparing: pedidos.filter(p => p.status === 'preparando').length,
          ready: pedidos.filter(p => p.status === 'pronto').length
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;