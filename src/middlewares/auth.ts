import * as jwt from 'jsonwebtoken';
import config from '../config/config';
import { RequestHandler } from 'express';

const auth: RequestHandler = (req, res, next) => {
  const token = req.headers['cookie']?.split('=')[1];

  if (!token) {
    res.status(403).send('A token is required for authentication');
    return;
  }
  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    req.signedCookies = decoded;
    next();
  } catch (err) {
    res.status(401).send('Invalid Token');
  }
};

export default auth;
