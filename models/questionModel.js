import { DataTypes } from 'sequelize';
const questionModel = (sequelize) =>
  sequelize.define('questions', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    correctOption: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

export default questionModel;
