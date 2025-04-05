import { RequestHandler } from 'express';
import prisma from '../utils/prismaClient';
import { parse } from 'csv-parse';

export const newLeadSource: RequestHandler = async (req, res) => {
  try {
    const fileBuffer = req.file?.buffer;
    if (!fileBuffer) {
      res.status(400).json({ error: 'CSV File not found' });
      return;
    }

    const payload = req.signedCookies;

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const csvData = fileBuffer.toString('utf-8');
    const records: any[] = await new Promise((resolve, reject) => {
      parse(
        csvData,
        {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        },
        (err, data) => {
          if (err) reject(err);
          else resolve(data);
        },
      );
    });

    const newLeadSource = await prisma.leadSource.create({
      data: {
        userId: payload.id,
        data: records,
      },
    });
    res.status(200).json(newLeadSource);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyLeads: RequestHandler = async (req, res) => {
  try {
    const payload = req.signedCookies;

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const leads = await prisma.leadSource.findMany({
      where: { userId: payload.id },
    });

    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
