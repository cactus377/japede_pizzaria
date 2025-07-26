import express from 'express';
import { 
  getAllItens,
  addItem, 
  updateItem, 
  deleteItem, 
  findItemById
} from '../services/databaseService.js';

const router = express.Router();

// Get all itens
router.get('/', async (req, res) => {
  try {
    const { search, categoria, limit, offset } = req.query;
    
    let itens = await getAllItens();

    // Search by name
    if (search) {
      const searchLower = search.toLowerCase();
      itens = itens.filter(i => 
        i.nome.toLowerCase().includes(searchLower) ||
        i.descricao.toLowerCase().includes(searchLower)
      );
    }

    // Filter by categoria
    if (categoria) {
      itens = itens.filter(i => i.categoria === categoria);
    }

    // Pagination
    const limitNum = parseInt(limit) || itens.length;
    const offsetNum = parseInt(offset) || 0;
    const paginatedItens = itens.slice(offsetNum, offsetNum + limitNum);

    res.json({
      success: true,
      data: paginatedItens.map(item => item.toJSON()),
      total: itens.length,
      limit: limitNum,
      offset: offsetNum
    });
  } catch (error) {
    console.error('Get itens error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get item by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const item = await findItemById(id);

    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    res.json({
      success: true,
      data: item.toJSON()
    });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Create new item
router.post('/', async (req, res) => {
  try {
    const { nome, descricao, preco, custo, categoria, disponivel, imagemUrl } = req.body;

    // Validation
    if (!nome || !preco || !categoria) {
      return res.status(400).json({ error: 'Nome, preço e categoria são obrigatórios' });
    }

    if (preco < 0) {
      return res.status(400).json({ error: 'Preço deve ser maior ou igual a zero' });
    }

    const newItem = await addItem({
      nome,
      descricao: descricao || '',
      preco: parseFloat(preco),
      custo: custo ? parseFloat(custo) : 0,
      categoria,
      disponivel: disponivel !== false,
      imagemUrl: imagemUrl || ''
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
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, preco, custo, categoria, disponivel, imagemUrl } = req.body;

    // Validation
    if (!nome || !preco || !categoria) {
      return res.status(400).json({ error: 'Nome, preço e categoria são obrigatórios' });
    }

    if (preco < 0) {
      return res.status(400).json({ error: 'Preço deve ser maior ou igual a zero' });
    }

    const updatedItem = await updateItem(id, {
      nome,
      descricao: descricao || '',
      preco: parseFloat(preco),
      custo: custo ? parseFloat(custo) : 0,
      categoria,
      disponivel: disponivel !== false,
      imagemUrl: imagemUrl || ''
    });

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
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await deleteItem(id);

    if (!deletedItem) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    res.json({
      success: true,
      message: 'Item excluído com sucesso'
    });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get categorias
router.get('/categorias/list', async (req, res) => {
  try {
    const itens = await getAllItens();
    const categorias = [...new Set(itens.map(i => i.categoria))].sort();

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