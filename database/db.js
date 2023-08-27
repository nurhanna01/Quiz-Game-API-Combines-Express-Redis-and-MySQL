import { Sequelize } from 'sequelize';
import database from '../config/database.js';
import userModel from '../models/userModel.js';
import questionModel from '../models/questionModel.js';
import answerModel from '../models/answerModel.js';
import UserQuestionModel from '../models/UserQuestionModel.js';

const db = new Sequelize(database.database, database.user, database.password, {
  host: database.host,
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export const user_t = userModel(db);
export const question_t = questionModel(db);
export const answer_t = answerModel(db);
export const user_questions = UserQuestionModel(db);
question_t.hasMany(answer_t, { as: 'answers' });

// Hubungan many-to-many antara User dan Soal melalui Answer
user_t.belongsToMany(question_t, { through: 'user_questions' });
question_t.belongsToMany(user_t, { through: 'user_questions' });

export default db;
