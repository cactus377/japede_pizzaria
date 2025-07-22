import express from 'express';
import { 
  mockItensCardapio, 
  addItem, 
  updateItem, 
  deleteItem, 
  findItemById 
} from '../models/mockData.js';

const router = express.Router();

// Get all itens
router.get('/', (req, res) => {
  try {
    const { categoria, disponivel, search } = req.query;
    
    let filteredItens = [...mockItensCardapio];

    // Filter by categoria
    if (categoria && categoria !== 'todos') {
      filteredItens = filteredItens.filter(i => i.categoria === categoria);
    }

    // Filter by disponibilidade
    if (disponivel !== undefined) {
      const isDisponivel = disponivel === 'true';
      filteredItens = filteredItens.filter(i => i.disponivel === isDisponivel);
    }

    // Search by name or description
    if (search) {
      const searchLower = search.toLowerCase();
      filteredItens = filteredItens.filter(i => 
        i.nome.toLowerCase().includes(searchLower) ||
        i.descricao.toLowerCase().includes(searchLower)
      );
    }

    // Sort by name
    filteredItens.sort((a, b) => a.nome.localeCompare(b.nome));

    res.json({
      success: true,
      data: filteredItens
    });
  } catch (error) {
    console.error('Get itens error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get item by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const item = findItemById(id);

    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Create new item
router.post('/', (req, res) => {
  try {
    const {
      nome,
      descricao,
      preco,
      custo,
      categoria,
      disponivel,
      imagemUrl,
      tamanhos,
      bordas
    } = req.body;

    // Validation
    if (!nome || !categoria || preco === undefined) {
      return res.status(400).json({ error: 'Nome, categoria e preço são obrigatórios' });
    }

    if (preco < 0) {
      return res.status(400).json({ error: 'Preço deve ser maior ou igual a zero' });
    }

    const newItem = addItem({
      nome,
      descricao: descricao || '',
      preco: parseFloat(preco),
      custo: custo ? parseFloat(custo) : 0,
      categoria,
      disponivel: disponivel !== false,
      imagemUrl: imagemUrl || '',
      tamanhos: tamanhos || [],
      bordas: bordas || []
    });

    res.status(201).json({
      success: true,
      data: newItem
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Update item
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validation
    if (updates.preco !== undefined && updates.preco < 0) {
      return res.status(400).json({ error: 'Preço deve ser maior ou igual a zero' });
    }

    if (updates.custo !== undefined && updates.custo < 0) {
      return res.status(400).json({ error: 'Custo deve ser maior ou igual a zero' });
    }

    // Convert numeric fields
    if (updates.preco !== undefined) {
      updates.preco = parseFloat(updates.preco);
    }
    if (updates.custo !== undefined) {
      updates.custo = parseFloat(updates.custo);
    }

    const updatedItem = updateItem(id, updates);

    if (!updatedItem) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    res.json({
      success: true,
      data: updatedItem
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Delete item
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = deleteItem(id);

    if (!deletedItem) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    res.json({
      success: true,
      message: 'Item excluído com sucesso',
      data: deletedItem
    });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get categorias
router.get('/meta/categorias', (req, res) => {
  try {
    const categorias = [...new Set(mockItensCardapio.map(i => i.categoria))].sort();
    
    res.json({
      success: true,
      data: categorias
    });
  } catch (error) {
    console.error('Get categorias error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;