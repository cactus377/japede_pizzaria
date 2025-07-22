import express from 'express';
import { mockMesas, updateMesaStatus, findMesaById } from '../models/mockData.js';

const router = express.Router();

// Get all mesas
router.get('/', (req, res) => {
  try {
    const { status } = req.query;
    
    let filteredMesas = [...mockMesas];

    // Filter by status
    if (status && status !== 'todos') {
      filteredMesas = filteredMesas.filter(m => m.status === status);
    }

    // Sort by mesa number
    filteredMesas.sort((a, b) => a.numero - b.numero);

    res.json({
      success: true,
      data: filteredMesas
    });
  } catch (error) {
    console.error('Get mesas error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get mesa by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const mesa = findMesaById(parseInt(id));

    if (!mesa) {
      return res.status(404).json({ error: 'Mesa não encontrada' });
    }

    res.json({
      success: true,
      data: mesa
    });
  } catch (error) {
    console.error('Get mesa error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Update mesa status
router.patch('/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['livre', 'ocupada', 'reservada'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const updatedMesa = updateMesaStatus(parseInt(id), status);

    if (!updatedMesa) {
      return res.status(404).json({ error: 'Mesa não encontrada' });
    }

    res.json({
      success: true,
      data: updatedMesa
    });
  } catch (error) {
    console.error('Update mesa status error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get mesas statistics
router.get('/stats/summary', (req, res) => {
  try {
    const totalMesas = mockMesas.length;
    const ocupadas = mockMesas.filter(m => m.status === 'ocupada').length;
    const livres = mockMesas.filter(m => m.status === 'livre').length;
    const reservadas = mockMesas.filter(m => m.status === 'reservada').length;
    const ocupacaoPercentual = totalMesas > 0 ? Math.round((ocupadas / totalMesas) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalMesas,
        ocupadas,
        livres,
        reservadas,
        ocupacaoPercentual
      }
    });
  } catch (error) {
    console.error('Get mesas stats error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;