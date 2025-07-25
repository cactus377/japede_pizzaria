"use strict";

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('ItemCardapios', [
      { nome: 'Pizza Margherita', descricao: 'Molho de tomate fresco, mozzarella de búfala e manjericão.', preco: 45.00, custo: 15.50, categoria: 'pizza', disponivel: true, imagemUrl: 'https://picsum.photos/seed/margherita/400/300', createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Pizza Pepperoni', descricao: 'Pepperoni picante, queijo mozzarella e molho de tomate especial.', preco: 50.00, custo: 18.00, categoria: 'pizza', disponivel: true, imagemUrl: 'https://picsum.photos/seed/pepperoni/400/300', createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Pizza Quatro Queijos', descricao: 'Uma combinação cremosa de mozzarella, provolone, parmesão e gorgonzola.', preco: 55.00, custo: 20.50, categoria: 'pizza', disponivel: true, imagemUrl: 'https://picsum.photos/seed/4queijos/400/300', createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Coca-Cola', descricao: 'Lata 350ml', preco: 6.00, custo: 2.50, categoria: 'bebida', disponivel: true, imagemUrl: 'https://picsum.photos/seed/cocacola/400/300', createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ItemCardapios', null, {});
  }
}; 