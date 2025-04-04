import { Router } from 'express';
import auth from '../middlewares/auth';
import upload from '../middlewares/upload';
import {
  loginUser,
  logoutUser,
  registerUser,
} from '../controllers/userController';
import { getMyLeads, newLeadSource } from '../controllers/leadSourceController';
import {
  getMyEmailTemplates,
  newEmailTemplate,
} from '../controllers/emailTemplateController';
import { getMySequences, newSequence } from '../controllers/sequenceController';

const router = Router();

// User Routes
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').get(auth, logoutUser);

// LeadSource Routes
router
  .route('/lead-source/new')
  .post(auth, upload.single('file'), newLeadSource);
router.route('/lead-source/my-leads').get(auth, getMyLeads);

// Email Template Routes
router.route('/email-template/new').post(auth, newEmailTemplate);
router.route('/email-template/my-templates').get(auth, getMyEmailTemplates);

// Sequence Routes
router.route('/sequence/new').post(auth, newSequence);
router.route('/sequence/my-sequences').get(auth, getMySequences);

export default router;
