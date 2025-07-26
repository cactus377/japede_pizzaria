import express from 'express';
import { getPizzeriaInfo, updatePizzeriaInfo } from '../services/databaseService.js';

const router = express.Router();

// Get pizzeria info
router.get('/info', (req, res) => {
  try {
    const info = getPizzeriaInfo();
    
    res.json({
      success: true,
      data: info
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