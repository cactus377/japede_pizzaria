'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ItemCardapio extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ItemCardapio.hasMany(models.PedidoItem, { foreignKey: 'itemCardapioId' });
    }
  }
  ItemCardapio.init({
    nome: DataTypes.STRING,
    descricao: DataTypes.STRING,
    preco: DataTypes.FLOAT,
    custo: DataTypes.FLOAT,
    categoria: DataTypes.STRING,
    disponivel: DataTypes.BOOLEAN,
    imagemUrl: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ItemCardapio',
  });
  return ItemCardapio;
};