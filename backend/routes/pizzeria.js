import express from 'express';
import { mockPizzeriaInfo, updatePizzeriaInfo } from '../models/mockData.js';

const router = express.Router();

// Get pizzeria info
router.get('/info', (req, res) => {
  try {
    res.json({
      success: true,
      data: mockPizzeriaInfo
    });
  } catch (error) {
    console.error('Get pizzeria info error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Update pizzeria info
router.put('/info', (req, res) => {
  try {
    const updates = req.body;

    // Validation
    if (updates.nome && updates.nome.trim().length === 0) {
      return res.status(400).json({ error: 'Nome da pizzaria não pode estar vazio' });
    }

    if (updates.telefone && updates.telefone.trim().length === 0) {
      return res.status(400).json({ error: 'Telefone não pode estar vazio' });
    }

    // Convert numeric fields in prepTimes
    if (updates.prepTimes) {
      Object.keys(updates.prepTimes).forEach(key => {
        updates.prepTimes[key] = parseInt(updates.prepTimes[key]) || 0;
      });
    }

    // Convert numeric fields in statusTimings
    if (updates.statusTimings) {
      Object.keys(updates.statusTimings).forEach(status => {
        if (updates.statusTimings[status]) {
          Object.keys(updates.statusTimings[status]).forEach(category => {
            updates.statusTimings[status][category] = parseInt(updates.statusTimings[status][category]) || 0;
          });
        }
      });
    }

    const updatedInfo = updatePizzeriaInfo(updates);

    res.json({
      success: true,
      data: updatedInfo
    });
  } catch (error) {
    console.error('Update pizzeria info error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;