import redis from 'ioredis';
import { question_t, user_t, user_questions, answer_t } from '../database/db.js';
import { Sequelize } from 'sequelize';

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
}

const nextRound = async (lastRound, lastBucket, lastTotalScore, user_id) => {
  const clientRedis = new redis();
  console.log(lastRound, lastBucket, lastTotalScore);
  // rule for next bucket
  if (lastBucket < 9) {
    await clientRedis.set('bucket', JSON.stringify(lastBucket + 1));
  } else {
    await clientRedis.set('bucket', JSON.stringify(0));
  }
  await clientRedis.set('number', JSON.stringify(1));

  // rule for next round
  if (lastRound == 1 && lastTotalScore > 105) {
    await clientRedis.set('round', JSON.stringify(lastRound + 1));
  } else if (lastRound == 2 && lastTotalScore > 110) {
    await clientRedis.set('round', JSON.stringify(lastRound + 1));
  } else if (lastRound == 3 && lastTotalScore > 115) {
    await clientRedis.set('round', JSON.stringify(lastRound + 1));
  } else if (lastRound == 4 && lastTotalScore > 120) {
    await clientRedis.set('round', JSON.stringify(lastRound + 1));
  } else if (lastRound == 5 && lastTotalScore > 125) {
    await clientRedis.set('round', JSON.stringify(lastRound + 1));
  } else if (lastRound == 6 && lastTotalScore > 130) {
    await clientRedis.set('round', JSON.stringify(lastRound + 1));
  } else if (lastRound == 7 && lastTotalScore > 135) {
    await clientRedis.set('round', JSON.stringify(lastRound + 1));
  } else if (lastRound == 8 && lastTotalScore > 140) {
    await clientRedis.set('round', JSON.stringify(lastRound + 1));
  } else if (lastRound == 9 && lastTotalScore > 145) {
    await clientRedis.set('round', JSON.stringify(lastRound + 1));
  } else if (lastRound == 10 && lastTotalScore > 150) {
    await clientRedis.set('gameOver', JSON.stringify(1));
  } else {
    await clientRedis.del('round');
    await clientRedis.del('number');
    await clientRedis.del('bucket');
    await clientRedis.set('gameOver', JSON.stringify(1));
    await user_questions.update({ isGameOver: true }, { where: { userId: user_id, isGameOver: false } });
  }
};
const quizController = {
  // get data questions and set to redis
  getSoal: async (req, res) => {
    try {
      const clientRedis = new redis();
      const questionRedis = await clientRedis.get('questions');
      if (questionRedis) {
        res.status(200).json({
          status: 'success',
          statusCode: 200,
          message: 'Retrive Question Data from Redis Successfully',
          data: JSON.parse(questionRedis),
        });
      } else {
        const soal = await question_t.findAll();
        const a = await clientRedis.set('questions', JSON.stringify(soal));
        res.status(200).json({
          status: 'success',
          statusCode: 200,
          message: 'Retrive Question Data from Mysql server Successfully',
          data: soal,
        });
      }
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        status: 'error',
        message: 'Internal server error',
        error: error.message,
      });
    }
  },
  // get data bucket and set to redis
  generateBucketQuiz: async (req, res) => {
    try {
      const clientRedis = new redis();
      const bucketRedis = JSON.parse(await clientRedis.get('bucketList'));
      if (bucketRedis) {
        res.status(201).json({
          status: 'success',
          statusCode: 200,
          message: 'Buckets created successfully',
          data: bucketRedis,
        });
      } else {
        const buckets = [
          [1, 20, 21, 40, 41, 60, 61, 80, 81, 100, 101, 120, 121, 140, 141],
          [2, 19, 22, 39, 42, 59, 62, 79, 82, 99, 102, 119, 122, 139, 142],
          [3, 18, 23, 38, 43, 58, 63, 78, 83, 98, 103, 118, 123, 138, 143],
          [4, 17, 24, 37, 44, 57, 64, 77, 84, 97, 104, 117, 124, 137, 144],
          [5, 16, 25, 36, 45, 56, 65, 76, 85, 96, 105, 116, 125, 136, 145],
          [6, 15, 26, 35, 46, 55, 66, 75, 86, 95, 106, 115, 126, 135, 146],
          [7, 14, 27, 34, 47, 54, 67, 74, 87, 94, 107, 114, 127, 134, 147],
          [8, 13, 28, 33, 48, 53, 68, 73, 88, 93, 108, 113, 128, 133, 148],
          [9, 12, 29, 32, 49, 52, 69, 72, 89, 92, 109, 112, 129, 132, 149],
          [10, 11, 30, 31, 50, 51, 70, 71, 90, 91, 110, 111, 130, 131, 150],
        ];
        await clientRedis.set('bucketList', JSON.stringify(buckets));
        res.status(200).json({
          status: 'success',
          statusCode: 200,
          message: 'Buckets created successfully',
          data: buckets,
        });
      }
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        status: 'error',
        message: 'Internal server error',
        error: error.message,
      });
    }
  },

  getBucketQuestion: async (req, res) => {
    try {
      let round;
      let bucket;
      const clientRedis = new redis();

      const gameOverFromRedis = JSON.parse(await clientRedis.get('gameOver'));
      if (gameOverFromRedis) {
        res.json({
          status: 'Not Found',
          statusCode: 404,
          message: 'Game Over! Try Again',
        });
        await clientRedis.del('gameOver');
        return;
      }

      const bucketFromRedis = JSON.parse(await clientRedis.get('bucket'));
      if (bucketFromRedis) {
        bucket = bucketFromRedis;
      } else {
        const myProfile = await user_t.findByPk(req.user.id);
        const phone = myProfile.phone;
        let firstBucket = phone[phone.length - 1];
        bucket = firstBucket;

        await clientRedis.set('bucket', JSON.stringify(bucket));
      }

      const roundFromRedis = JSON.parse(await clientRedis.get('round'));
      if (roundFromRedis) {
        round = roundFromRedis;
      } else {
        round = 1;
        await clientRedis.set('round', JSON.stringify(round));
      }
      // list of all question inredis
      const questionRedis = JSON.parse(await clientRedis.get('questions'));

      // get buckets (buckets of questions number)
      let bucketRedis = JSON.parse(await clientRedis.get('bucketList'));

      // check if bucket question is already present
      const checkUdahAdaBucket = JSON.parse(await clientRedis.get('roundQuestions'));
      const thisRound = bucketRedis[bucket];
      if (!checkUdahAdaBucket) {
        // get all question

        const randomBucketQuestion = shuffle(thisRound);

        const questions = randomBucketQuestion.map((q) => {
          const { id, type, question } = questionRedis.find((item) => item.id === q);
          return {
            id,
            type,
            question,
          };
        });

        if (questions.length > 0) {
          const inputData = questions.map((a) => ({
            userId: req.user.id,
            questionId: a.id,
            round: round,
            bucket: bucket,
          }));
          try {
            await user_questions.bulkCreate(inputData);
            await clientRedis.set('roundQuestions', JSON.stringify(inputData));
            console.log('User-question associations created successfully');
          } catch (error) {
            console.error('Error creating user-question associations:', error.message);
          }

          res.status(200).json({
            status: 'success',
            statusCode: 200,
            message: 'Buckets created successfully',
            questions,
            index: randomBucketQuestion,
          });
        }
      } else {
        console.log(checkUdahAdaBucket);
        const idnya = [];
        checkUdahAdaBucket.map((b) => {
          idnya.push(b.questionId);
        });
        const questions = idnya.map((q) => {
          const { id, type, question } = questionRedis.find((item) => item.id === q);
          return {
            id,
            type,
            question,
          };
        });
        res.status(200).json({
          status: 'success',
          statusCode: 200,
          message: 'complete this section first',
          questions,
          index: idnya,
        });
      }
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        status: 'error',
        message: 'Internal server error',
        error: error.message,
      });
    }
  },

  giveOneOfQuestion: async (req, res) => {
    try {
      const clientRedis = new redis();
      const questionStartAt = JSON.parse(await clientRedis.get('questionStartAt'));
      let number;
      const roundQuestionRedis = JSON.parse(await clientRedis.get('roundQuestions'));
      if (!roundQuestionRedis) {
        res.json({
          status: 'Not Found',
          stattusCode: '404',
          message: 'Nothing question to answer, get bucket question first',
        });
        return;
      }
      const numberRedis = JSON.parse(await clientRedis.get('number'));
      const bucketRedis = JSON.parse(await clientRedis.get('bucket'));
      if (numberRedis) {
        number = numberRedis;
      } else {
        number = 1;
        await clientRedis.set('number', JSON.stringify(number));
      }
      const round = JSON.parse(await clientRedis.get('round'));
      const currentQuestion = roundQuestionRedis[number - 1];
      const finalQuestion = await question_t.findAll({
        where: {
          id: currentQuestion.questionId,
        },
        attributes: ['id', 'type', 'question'],
        include: [
          {
            model: answer_t,
            as: 'answers',
            attributes: ['option', 'label'],
          },
        ],
      });
      let datetime = new Date();
      let datetimeUpdate = datetime.getTime() / 1000;
      await clientRedis.set('currentQuestion', JSON.stringify(finalQuestion));
      if (questionStartAt == null) {
        await clientRedis.set('questionStartAt', datetimeUpdate);
      } else {
        await clientRedis.set('questionStartAt', questionStartAt);
      }
      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Buckets created successfully',
        round: round,
        bucket: bucketRedis,
        number: number,
        question: finalQuestion,
        questionStartAt: questionStartAt || datetime,
        // all: roundQuestionRedis,
      });
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        status: 'error',
        message: 'Internal server error',
        error: error.message,
      });
    }
  },

  answerOfQuestion: async (req, res) => {
    try {
      const clientRedis = new redis();

      const currentQuestion = JSON.parse(await clientRedis.get('currentQuestion'));
      if (!currentQuestion) {
        res.status(404).json({
          status: 'Not Found',
          statusCode: 404,
          message: 'No Question Available',
        });
        return;
      }
      const userAnswer = req.body.answer;

      let score = 0;

      let nowTime = new Date();
      let akhir = nowTime.getTime() / 1000;

      const awal = JSON.parse(await clientRedis.get('questionStartAt'));

      const totalTime = akhir - awal;

      if (userAnswer.toLowerCase() == currentQuestion[0].correctOption.toLowerCase()) {
        if (totalTime <= 10) {
          score += 10;
        } else if (totalTime <= 20) {
          score += 9;
        } else if (totalTime <= 30) {
          score += 8;
        } else if (totalTime <= 40) {
          score += 7;
        } else if (totalTime <= 50) {
          score += 6;
        } else if (totalTime <= 60) {
          score += 5;
        } else {
          score += 0;
        }
      } else {
        score += -5;
      }
      const number = JSON.parse(await clientRedis.get('number'));
      const round = JSON.parse(await clientRedis.get('round'));
      const bucket = JSON.parse(await clientRedis.get('bucket'));
      console.log(typeof round, typeof bucket);
      const update = await user_questions.update(
        { score: score },
        {
          where: {
            userId: req.user.id,
            questionId: currentQuestion[0].id,
          },
        }
      );
      if (update) {
        await clientRedis.del('currentQuestion');
        await clientRedis.del('questionStartAt');
        if (number < 15) {
          await clientRedis.set('number', JSON.stringify(number + 1));
        } else {
          const myScore = await user_questions.findAll({
            where: {
              userId: req.user.id,
              round: round,
              bucket: bucket,
              isGameOver: false,
            },
          });
          let total = 0;
          myScore.map((s) => {
            total += s.score;
          });
          nextRound(round, bucket, total, req.user.id);
          await clientRedis.del('roundQuestions');
          res.status(200).json({
            status: 'success',
            statusCode: 200,
            message: 'This round already completed!, hit the bucket question again.',
          });
          return;
        }
      }
      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Answer Question successfully',
        nilai: score,
      });
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        status: 'error',
        message: 'Internal server error',
        error: error.message,
      });
    }
  },
  totalScore: async (req, res) => {
    try {
      const round = req.body.round;
      const mytest = await user_questions.findAll({
        where: {
          userId: req.user.id,
          round: round,
        },
        order: [['updatedAt', 'DESC']],
        limit: 15,
      });
      if (mytest.length > 0) {
        let total = 0;
        mytest.map((t) => {
          total += t.score;
        });
        res.status(200).json({
          status: 'success',
          statusCode: 200,
          message: 'Your score in this round',
          totalScore: total,
        });
      } else {
        res.json({
          status: 'Not Found',
          statusCode: 404,
          message: 'you havent played yet.',
        });
      }
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        status: 'error',
        message: 'Internal server error',
        error: error.message,
      });
    }
  },

  // Leaderboard for users currently playing the game.
  leaderBoard: async (req, res) => {
    try {
      const leaderboard = await user_questions.findAll({
        attributes: ['userId', [Sequelize.fn('sum', Sequelize.col('score')), 'totalScore']],
        where: {
          isGameOver: false,
        },
        group: ['userId'],

        order: [[Sequelize.col('totalScore'), 'DESC']],
      });
      const userIds = leaderboard.map((item) => item.userId);
      const users = await user_t.findAll({
        where: {
          id: userIds,
        },
        attributes: ['id', 'name', 'username'],
      });
      const combinedData = leaderboard.map((item, index) => {
        const user = users.find((user) => user.id === item.userId);
        return {
          rank: index + 1,
          username: user.username,
          name: user.name,
          total_Score: item.dataValues.totalScore,
        };
      });
      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Leaderboard for active game',
        LeaderBoard: combinedData,
      });
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        status: 'error',
        message: 'Internal server error',
        error: error.message,
      });
    }
  },
};
export default quizController;
