"use strict";

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Mesas', [
      { numero: 1, capacidade: 4, status: 'livre', createdAt: new Date(), updatedAt: new Date() },
      { numero: 2, capacidade: 4, status: 'livre', createdAt: new Date(), updatedAt: new Date() },
      { numero: 3, capacidade: 6, status: 'livre', createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Mesas', null, {});
  }
}; 