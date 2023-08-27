import fs from 'fs';
import { question_t } from '../database/db.js';
import { answer_t } from '../database/db.js';
const dataProcessingController = {
  getData: async (req, res) => {
    try {
      const path = 'quiz.json';
      const data = JSON.parse(fs.readFileSync(path));
      res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        statusCode: 500,
        message: 'Internal Server Error',
        error: error.message,
      });
      console.log(error);
    }
  },
  sendSoalToMysqlServer: async (req, res) => {
    try {
      const path = 'quiz.json';
      const data = JSON.parse(fs.readFileSync(path));
      const soal = data.soal;
      for (const s of soal) {
        try {
          await question_t.create({
            id: s.id,
            type: s.type,
            question: s.soal,
            correctOption: s.correctOption,
          });
        } catch (error) {
          res.status(500).json({
            status: 'error',
            statusCode: 500,
            message: 'Internal Server Error',
            error: error.message,
          });
          return;
        }
      }
      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Input data was successfully',
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        statusCode: 500,
        message: 'Internal Server Error',
        error: error.message,
      });
    }
  },
  sendJawabanToMysqlServer: async (req, res) => {
    try {
      const path = 'quiz.json';
      const data = JSON.parse(fs.readFileSync(path));
      const soal = data.soal;
      for (const s of soal) {
        for (const a of s.answer) {
          try {
            // const questionId = s.id;
            await answer_t.create({
              option: a.option,
              label: a.label,
              questionId: s.id,
            });
          } catch (error) {
            res.status(500).json({
              status: 'error',
              statusCode: 500,
              message: 'Internal Server Error',
              error: error.message,
            });
            return;
          }
        }
      }
      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Input data was successfully',
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        statusCode: 500,
        message: 'Internal Server Error',
        error: error.message,
      });
    }
  },
};

export default dataProcessingController;
