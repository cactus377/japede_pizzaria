'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PedidoItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PedidoItem.belongsTo(models.Pedido, { foreignKey: 'pedidoId' });
      PedidoItem.belongsTo(models.ItemCardapio, { foreignKey: 'itemCardapioId' });
    }
  }
  PedidoItem.init({
    pedidoId: DataTypes.INTEGER,
    itemCardapioId: DataTypes.INTEGER,
    quantidade: DataTypes.INTEGER,
    tamanho: DataTypes.STRING,
    borda: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'PedidoItem',
  });
  return PedidoItem;
};