import { DataTypes } from 'sequelize';
const answerModel = (sequelize) =>
  sequelize.define('answers', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    option: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

export default answerModel;
