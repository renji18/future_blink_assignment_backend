import { Request, RequestHandler, Response } from 'express';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import prisma from '../utils/prismaClient';
import config from '../config/config';

// register
export const registerUser: RequestHandler = async (req, res) => {
  try {
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
      res.status(400).json({ error: 'User registration failed' });
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
      .json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// login
export const loginUser: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { auth: true },
    });

    if (
      !user ||
      !user.auth ||
      !(await bcrypt.compare(password, user.auth.password))
    ) {
      res.status(401).json({ error: 'Invalid credentials' });
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
      .json({ message: 'User logged in successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// logout
export const logoutUser: RequestHandler = async (req, res) => {
  try {
    const payload = req.signedCookies;

    await prisma.auth.update({
      where: { userId: payload.id },
      data: { isLoggedIn: false, token: null },
    });

    res.clearCookie(config.TOKEN_KEY);
    res.status(200).json({ message: 'User logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
