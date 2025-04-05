import { RequestHandler } from 'express';
import prisma from '../utils/prismaClient';

export const newEmailTemplate: RequestHandler = async (req, res) => {
  try {
    const { name, subject, body } = req.body;
    const payload = req.signedCookies;

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const newEmailTemplate = await prisma.emailTemplate.create({
      data: {
        name,
        subject,
        body,
        userId: payload.id,
      },
    });

    res.status(200).json(newEmailTemplate);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyEmailTemplates: RequestHandler = async (req, res) => {
  try {
    const payload = req.signedCookies;

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const emailTemplates = await prisma.emailTemplate.findMany({
      where: { userId: payload.id },
    });

    res.status(200).json(emailTemplates);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
