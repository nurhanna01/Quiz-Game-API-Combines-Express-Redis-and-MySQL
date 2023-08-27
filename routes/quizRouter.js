import express from 'express';
import quizController from '../controllers/quizController.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null)
      return res.json({
        statusCode: 403,
        status: 'failed',
        message: 'unauthorized',
      });

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
      // console.log(err);

      if (err)
        return res.status(403).json({
          statusCode: 403,
          status: 'failed',
          message: 'unauthorized',
        });

      req.user = user;

      next();
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      status: 'failed',
      message: 'Internal server error',
    });
  }
}

const quizRouter = express.Router();
quizRouter.get('/', quizController.getSoal);
quizRouter.get('/buckets', authenticateToken, quizController.generateBucketQuiz);
quizRouter.get('/rounds', authenticateToken, quizController.getBucketQuestion);
quizRouter.get('/question', authenticateToken, quizController.giveOneOfQuestion);
quizRouter.post('/answer', authenticateToken, quizController.answerOfQuestion);
quizRouter.post('/score', authenticateToken, quizController.totalScore);
quizRouter.get('/leaderboard', authenticateToken, quizController.leaderBoard);

export default quizRouter;
