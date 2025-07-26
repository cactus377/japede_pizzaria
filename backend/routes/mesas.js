import express from 'express';
import { getAllMesas, updateMesaStatus, findMesaById } from '../services/databaseService.js';

const router = express.Router();

// Get all mesas
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    
    let mesas = await getAllMesas();

    // Filter by status
    if (status) {
      mesas = mesas.filter(m => m.status === status);
    }

    res.json({
      success: true,
      data: mesas.map(mesa => mesa.toJSON())
    });
  } catch (error) {
    console.error('Get mesas error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get mesa by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mesa = await findMesaById(id);

    if (!mesa) {
      return res.status(404).json({ error: 'Mesa não encontrada' });
    }

    res.json({
      success: true,
      data: mesa.toJSON()
    });
  } catch (error) {
    console.error('Get mesa error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Update mesa status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validation
    if (!status) {
      return res.status(400).json({ error: 'Status é obrigatório' });
    }

    const validStatuses = ['livre', 'ocupada', 'reservada'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const updatedMesa = await updateMesaStatus(id, status);

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

// Get mesa statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const mesas = await getAllMesas();
    
    const totalMesas = mesas.length;
    const ocupadas = mesas.filter(m => m.status === 'ocupada').length;
    const livres = mesas.filter(m => m.status === 'livre').length;
    const reservadas = mesas.filter(m => m.status === 'reservada').length;

    res.json({
      success: true,
      data: {
        totalMesas,
        ocupadas,
        livres,
        reservadas,
        ocupacaoPercentual: totalMesas > 0 ? Math.round((ocupadas / totalMesas) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Get mesa stats error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;