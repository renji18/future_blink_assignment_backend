import { Router } from 'express';
import auth from '../middlewares/auth';
import {
  getUserData,
  loginUser,
  logoutUser,
  registerUser,
} from '../controllers/userController';
import { createFlow, getFlows } from '../controllers/flowController';

const router = Router();

// User Routes
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/profile').get(auth, getUserData);
router.route('/logout').get(auth, logoutUser);

// Flow Routes
router.route('/flow').post(auth, createFlow).get(auth, getFlows);

export default router;
