import { RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import prisma from '../utils/prismaClient';
import config from '../config/config';
import tryCatchHandler from '../middlewares/tryCatch';

// register
export const registerUser: RequestHandler = tryCatchHandler(
  async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        auth: {
          create: {
            password: hashedPassword,
            isLoggedIn: true,
          },
        },
      },
    });

    if (!newUser) {
      res.status(400).json({ msg: 'User registration failed', data: null });
      return;
    }

    const payload = { id: newUser.id, email: newUser.email };
    const accessToken = jwt.sign(payload, config.TOKEN_KEY, {
      expiresIn: '2h',
    });

    await prisma.auth.update({
      where: { userId: newUser.id },
      data: { token: accessToken },
    });

    res
      .cookie(config.TOKEN_KEY, accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 2 * 60 * 60 * 1000, // 2 hours
      })
      .status(200)
      .json({ msg: 'User registered successfully', data: newUser });
  },
  'Error Registering User',
);

// login
export const loginUser: RequestHandler = tryCatchHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      auth: true,
      leadSource: true,
      emailTemplate: true,
      sequence: true,
    },
  });

  if (
    !user ||
    !user.auth ||
    !(await bcrypt.compare(password, user.auth.password))
  ) {
    res.status(401).json({ msg: 'Invalid credentials', data: null });
    return;
  }

  const payload = { id: user.id, email: user.email };
  const accessToken = jwt.sign(payload, config.TOKEN_KEY, {
    expiresIn: '2h',
  });

  await prisma.auth.update({
    where: { userId: user.id },
    data: { token: accessToken, isLoggedIn: true },
  });

  res
    .cookie(config.TOKEN_KEY, accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
    })
    .json({ msg: 'User logged in successfully', data: user });
}, 'Error Logging In User');

// logout
export const logoutUser: RequestHandler = tryCatchHandler(async (req, res) => {
  const payload = req.signedCookies;

  await prisma.auth.update({
    where: { userId: payload.id },
    data: { isLoggedIn: false, token: null },
  });

  res.clearCookie(config.TOKEN_KEY);
  res.status(200).json({ msg: 'User logged out successfully', data: null });
}, 'Error Logging Out User');

// get user data
export const getUserData: RequestHandler = tryCatchHandler(async (req, res) => {
  const payload = req.signedCookies;

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    include: { emailTemplate: true, leadSource: true, sequence: true },
  });

  if (!user) {
    res.status(401).json({ msg: 'User not found', data: null });
    return;
  }

  res.status(200).json({ msg: 'User Fetched Successfully', data: user });
}, 'Error Fetching User Data');
