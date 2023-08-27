import express from 'express';
import cors from 'cors';
import db from './database/db.js';
import userRouter from './routes/userRouter.js';
import dataRouter from './routes/dataProcessingRouter.js';
import quizRouter from './routes/quizRouter.js';

const port = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

db.sync({ force: false })
  .then(() => {
    // console.log('Database connected!');
  })
  .catch((err) => {
    // console.log('Failed to sync database', err);
  });

app.use('/api/user', userRouter);
app.use('/api/data', dataRouter);
app.use('/api/quiz', quizRouter);

app.use(express.static('public/images'));

app.listen(port, () => {
  console.log(`Listening quiz on port ${port}`);
});

export default app;
