import express from 'express';
import jwt from 'jsonwebtoken';
import { findClienteByTelefone, addCliente } from '../models/mockData.js';

const router = express.Router();

// Generate JWT token
const generateToken = (cliente) => {
  return jwt.sign(
    { 
      id: cliente.id, 
      nome: cliente.nome, 
      telefone: cliente.telefone 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Login
router.post('/login', (req, res) => {
  try {
    const { telefone } = req.body;

    if (!telefone) {
      return res.status(400).json({ error: 'Telefone é obrigatório' });
    }

    const cliente = findClienteByTelefone(telefone);
    
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    const token = generateToken(cliente);

    res.json({
      success: true,
      token,
      cliente: {
        id: cliente.id,
        nome: cliente.nome,
        telefone: cliente.telefone,
        endereco: cliente.endereco
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Register
router.post('/register', (req, res) => {
  try {
    const { nome, telefone, endereco } = req.body;

    if (!nome || !telefone) {
      return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
    }

    // Check if cliente already exists
    const existingCliente = findClienteByTelefone(telefone);
    if (existingCliente) {
      return res.status(409).json({ error: 'Cliente já cadastrado com este telefone' });
    }

    const newCliente = addCliente({
      nome,
      telefone,
      endereco: endereco || ''
    });

    const token = generateToken(newCliente);

    res.status(201).json({
      success: true,
      token,
      cliente: {
        id: newCliente.id,
        nome: newCliente.nome,
        telefone: newCliente.telefone,
        endereco: newCliente.endereco
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Verify token
router.get('/verify', (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Token inválido' });
      }

      const cliente = findClienteByTelefone(decoded.telefone);
      if (!cliente) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

      res.json({
        success: true,
        cliente: {
          id: cliente.id,
          nome: cliente.nome,
          telefone: cliente.telefone,
          endereco: cliente.endereco
        }
      });
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;