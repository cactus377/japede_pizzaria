import express from 'express';
import { findClienteByTelefone, addCliente } from '../services/databaseService.js';

const router = express.Router();

// Login/Register cliente
router.post('/login', async (req, res) => {
  try {
    const { telefone, nome, endereco } = req.body;

    if (!telefone) {
      return res.status(400).json({ error: 'Telefone é obrigatório' });
    }

    // Try to find existing cliente
    let cliente = await findClienteByTelefone(telefone);

    if (!cliente) {
      // Create new cliente if not found
      if (!nome) {
        return res.status(400).json({ error: 'Nome é obrigatório para novos clientes' });
      }

      cliente = await addCliente({
        nome,
        telefone,
        endereco: endereco || ''
      });
    }

    res.json({
      success: true,
      data: {
        cliente,
        message: cliente.createdAt === cliente.updatedAt ? 'Cliente registrado com sucesso' : 'Login realizado com sucesso'
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;