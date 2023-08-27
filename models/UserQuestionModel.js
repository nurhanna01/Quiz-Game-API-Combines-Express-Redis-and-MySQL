import { DataTypes } from 'sequelize';
const UserQuestionModel = (sequelize) =>
  sequelize.define(
    'user_questions',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: DataTypes.INTEGER,
      questionId: DataTypes.INTEGER,
      score: {
        type: DataTypes.INTEGER,
      },
      round: {
        type: DataTypes.INTEGER,
      },
      bucket: {
        type: DataTypes.INTEGER,
      },
      isGameOver: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    }
    // { timestamps: false }
  );

export default UserQuestionModel;
