import { RequestHandler } from 'express';
import prisma from '../utils/prismaClient';

export const newSequence: RequestHandler = async (req, res) => {
  try {
    const { emailTemplateId, leadSourceId, delayInterval, delayUnit } =
      req.body;
    const payload = req.signedCookies;

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const newSequence = await prisma.sequence.create({
      data: {
        emailTemplateId,
        leadSourceId,
        delayInterval,
        delayUnit,
        userId: payload.id,
      },
      include: {
        emailTemplate: true,
        leadSource: true,
      },
    });

    res.status(200).json(newSequence);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMySequences: RequestHandler = async (req, res) => {
  try {
    const payload = req.signedCookies;

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const sequences = await prisma.sequence.findMany({
      where: { userId: payload.id },
      include: {
        emailTemplate: true,
        leadSource: true,
      },
    });

    res.status(200).json(sequences);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
