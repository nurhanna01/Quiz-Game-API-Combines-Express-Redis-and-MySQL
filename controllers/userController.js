import { user_t } from '../database/db.js';
// const jwt = require('jsonwebtoken');
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt, { hash } from 'bcrypt';

dotenv.config();
const hashPassword = async (plaintextPassword) => {
  const hash = await bcrypt.hash(plaintextPassword, 10);
  return hash;
};

const comparePassword = async (plaintextPassword, hash) => {
  const result = await bcrypt.compare(plaintextPassword, hash);
  return result;
};

function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: '10000s' });
}

const userController = {
  getUser: async function (req, res) {
    try {
      const findUser = await user_t.findOne({ where: { id: req.user.id } });
      if (findUser) {
        res.json({
          statusCode: 200,
          status: 'success',
          data: findUser,
        });
      } else {
        res.json({
          statusCode: 404,
          status: 'error',
          message: 'User not found',
        });
      }
    } catch (err) {
      res.json({
        statusCode: 500,
        status: 'error',
        message: 'Internal server error',
        error: err.message,
      });
    }
  },

  registerUser: async (req, res) => {
    try {
      if (!req.body.username) {
        return res.status(400).json({
          statusCode: 400,
          status: 'error',
          message: 'Username cannot be empty',
        });
      }

      const findUsername = await user_t.findOne({ where: { username: req.body.username } });
      if (findUsername) {
        res.json({
          statusCode: 400,
          status: 'error',
          message: 'Username already exists',
        });
        return;
      }
      const phoneRegex = /^(?:\+62|0)(?:\d{8,15})$/;
      if (!phoneRegex.test(req.body.phone)) {
        return res.status(400).json({
          statusCode: 400,
          status: 'error',
          message: 'Invalid phone number format',
        });
      }
      const newUser = {
        username: req.body.username,
        password: await hashPassword(req.body.password),
        name: req.body.name,
        phone: req.body.phone,
      };
      const createdUser = await user_t.create(newUser);

      if (createdUser) {
        const postUserToReturn = {
          name: createdUser.name,
          username: createdUser.username,
          phone: createdUser.phone,
        };
        res.json({
          statusCode: 201,
          status: 'success',
          message: 'User created successfully',
          data: postUserToReturn,
        });
      } else {
        res.json({
          statusCode: 404,
          status: 'error',
          message: 'Bad Request',
        });
        return;
      }
    } catch (err) {
      res.json({
        statusCode: 500,
        status: 'error',
        message: 'Internal server error',
        error: err.message,
      });
    }
  },

  loginUser: async function (req, res) {
    try {
      const findUser = await user_t.findOne({ where: { username: req.body.username } });
      if (findUser) {
        const checkPassword = await comparePassword(req.body.password, findUser.password);
        const selectedUser = {
          name: findUser.name,
          username: findUser.username,
          status_active: findUser.active,
        };
        if (checkPassword) {
          const token = generateAccessToken({ id: findUser.id });
          res.json({
            status: 'success',
            statusCode: 200,
            message: 'User logged in successfully',
            data: selectedUser,
            token: token,
          });
        } else {
          res.json({
            status: 'error',
            statusCode: 404,
            message: 'Wrong Password',
          });
        }
      } else {
        res.json({
          statusCode: 404,
          status: 'error',
          message: 'Username incorrect',
        });
      }
    } catch (err) {
      res.json({
        statusCode: 500,
        status: 'error',
        message: 'Internal server error',
        error: err.message,
      });
    }
  },

  changePassword: async function (req, res) {
    try {
      const findUser = await user_t.findOne({ where: { id: req.user.id } });
      if (findUser) {
        const checkPassword = await comparePassword(req.body.oldPassword, findUser.password);
        if (!checkPassword) {
          res.json({
            statusCode: 404,
            status: 'error',
            message: 'Invalid Old Password',
          });
        }

        if (checkPassword) {
          const updateUser = await user.update(
            {
              password: await hashPassword(req.body.newPassword),
            },
            {
              where: { id: req.user.id },
            }
          );
          if (updateUser == 1) {
            res.json({
              statusCode: 200,
              status: 'success',
              message: 'Password changed successfully',
            });
          }
          if (updateUser == 0) {
            res.json({
              statusCode: 200,
              status: 'success',
              message: 'Password changed failed',
            });
          }
        }
      } else {
        res.json({
          status: 'error',
          statusCode: 404,
          message: 'User not found',
        });
      }
    } catch (err) {
      res.json({
        statusCode: 500,
        status: 'error',
        message: 'Internal server error',
        error: err.message,
      });
    }
  },
};

export default userController;
