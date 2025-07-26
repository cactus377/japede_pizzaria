'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pedido extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Pedido.belongsTo(models.Cliente, { foreignKey: 'clienteId' });
      Pedido.belongsTo(models.Mesa, { foreignKey: 'mesaId' });
      Pedido.hasMany(models.PedidoItem, { foreignKey: 'pedidoId' });
    }
  }
  Pedido.init({
    clienteId: DataTypes.INTEGER,
    valor_total: DataTypes.FLOAT,
    custo_total: DataTypes.FLOAT,
    lucro: DataTypes.FLOAT,
    created_date: DataTypes.DATE,
    tempo_estimado: DataTypes.INTEGER,
    status: DataTypes.STRING,
    tipo: DataTypes.STRING,
    mesaId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Pedido',
  });
  return Pedido;
};