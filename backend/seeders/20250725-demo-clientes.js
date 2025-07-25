"use strict";

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Clientes', [
      { nome: 'João Silva', telefone: '(11) 98765-4321', endereco: 'Rua das Flores, 123, São Paulo, SP', createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Maria Oliveira', telefone: '(21) 91234-5678', endereco: 'Avenida Copacabana, 456, Rio de Janeiro, RJ', createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Carlos Pereira', telefone: '(31) 99999-8888', endereco: 'Praça da Liberdade, 789, Belo Horizonte, MG', createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Ana Costa', telefone: '(51) 98888-7777', endereco: 'Rua da Praia, 101, Porto Alegre, RS', createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Clientes', null, {});
  }
}; 