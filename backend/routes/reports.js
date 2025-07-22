import express from 'express';
import { mockPedidos, mockItensCardapio } from '../models/mockData.js';

const router = express.Router();

// Get sales report
router.get('/sales', (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Data de início e fim são obrigatórias' });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Filter pedidos by date range and delivered status
    const filteredPedidos = mockPedidos.filter(p => {
      const pDate = new Date(p.created_date);
      return p.status === 'entregue' && pDate >= start && pDate <= end;
    });

    // Calculate totals
    const totalRevenue = filteredPedidos.reduce((acc, p) => acc + p.valor_total, 0);
    const totalCost = filteredPedidos.reduce((acc, p) => acc + p.custo_total, 0);
    const totalProfit = filteredPedidos.reduce((acc, p) => acc + p.lucro, 0);
    const totalOrders = filteredPedidos.length;
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate daily revenue
    const dailyRevenue = {};
    filteredPedidos.forEach(p => {
      const day = new Date(p.created_date).toLocaleDateString('pt-BR');
      if (!dailyRevenue[day]) {
        dailyRevenue[day] = { faturamento: 0, custo: 0, lucro: 0 };
      }
      dailyRevenue[day].faturamento += p.valor_total;
      dailyRevenue[day].custo += p.custo_total;
      dailyRevenue[day].lucro += p.lucro;
    });

    const dailyData = Object.entries(dailyRevenue).map(([name, values]) => ({
      name,
      ...values
    }));

    // Calculate best selling items
    const itemSales = {};
    filteredPedidos.forEach(p => {
      p.itens.forEach(i => {
        if (!itemSales[i.item.id]) {
          itemSales[i.item.id] = {
            name: i.item.nome,
            quantity: 0,
            revenue: 0
          };
        }
        itemSales[i.item.id].quantity += i.quantidade;
        itemSales[i.item.id].revenue += (i.item.preco * i.quantidade);
      });
    });

    const bestSellers = Object.values(itemSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Payment method breakdown
    const paymentMethods = {};
    filteredPedidos.forEach(p => {
      const method = p.pagamento?.metodo || 'indefinido';
      if (!paymentMethods[method]) {
        paymentMethods[method] = 0;
      }
      paymentMethods[method] += p.valor_total;
    });

    const paymentData = Object.entries(paymentMethods).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalCost,
          totalProfit,
          totalOrders,
          averageTicket
        },
        dailyRevenue: dailyData,
        bestSellers,
        paymentMethods: paymentData,
        period: {
          startDate,
          endDate
        }
      }
    });
  } catch (error) {
    console.error('Get sales report error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get financial summary
router.get('/financial', (req, res) => {
  try {
    const deliveredOrders = mockPedidos.filter(p => p.status === 'entregue');
    
    const totalRevenue = deliveredOrders.reduce((sum, p) => sum + p.valor_total, 0);
    const totalCost = deliveredOrders.reduce((sum, p) => sum + p.custo_total, 0);
    const totalProfit = deliveredOrders.reduce((sum, p) => sum + p.lucro, 0);
    const averageTicket = deliveredOrders.length > 0 ? totalRevenue / deliveredOrders.length : 0;

    // Monthly data for the last 12 months
    const monthlyData = {};
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });
      monthlyData[monthKey] = { faturamento: 0, custo: 0, lucro: 0, pedidos: 0 };
    }

    deliveredOrders.forEach(p => {
      const pDate = new Date(p.created_date);
      const monthKey = pDate.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });
      
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].faturamento += p.valor_total;
        monthlyData[monthKey].custo += p.custo_total;
        monthlyData[monthKey].lucro += p.lucro;
        monthlyData[monthKey].pedidos += 1;
      }
    });

    const monthlyChartData = Object.entries(monthlyData).map(([name, values]) => ({
      name,
      ...values
    }));

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalCost,
          totalProfit,
          averageTicket,
          totalOrders: deliveredOrders.length
        },
        monthlyData: monthlyChartData
      }
    });
  } catch (error) {
    console.error('Get financial report error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get dashboard stats
router.get('/dashboard', (req, res) => {
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

    // Weekly sales data
    const weeklyData = {};
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weekPedidos = mockPedidos.filter(p => {
      const pDate = new Date(p.created_date);
      return p.status === 'entregue' && pDate >= oneWeekAgo;
    });

    weekPedidos.forEach(p => {
      const day = new Date(p.created_date).toLocaleDateString('pt-BR', { weekday: 'short' });
      if (!weeklyData[day]) weeklyData[day] = 0;
      weeklyData[day] += p.valor_total;
    });

    const weeklyChartData = Object.entries(weeklyData).map(([name, Vendas]) => ({
      name: name.slice(0, 3),
      Vendas
    }));

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
        readyOrders: mockPedidos.filter(p => p.status === 'pronto').length,
        weeklyData: weeklyChartData
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;