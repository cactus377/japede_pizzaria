'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Pedidos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      clienteId: {
        type: Sequelize.INTEGER
      },
      valor_total: {
        type: Sequelize.FLOAT
      },
      custo_total: {
        type: Sequelize.FLOAT
      },
      lucro: {
        type: Sequelize.FLOAT
      },
      created_date: {
        type: Sequelize.DATE
      },
      tempo_estimado: {
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.STRING
      },
      tipo: {
        type: Sequelize.STRING
      },
      mesaId: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Pedidos');
  }
};