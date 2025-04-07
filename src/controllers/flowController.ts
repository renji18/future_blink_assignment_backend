import { RequestHandler } from 'express';
import tryCatchHandler from '../middlewares/tryCatch';
import prisma from '../utils/prismaClient';
import agenda from '../utils/agendaInstance';
import { replacePlaceholders } from '../utils/templateEngine';
import { convertToMilliseconds } from '../utils/convertToMilliseconds';

// Controller to create a new flow and schedule emails
export const createFlow: RequestHandler = tryCatchHandler(async (req, res) => {
  const payload = req.signedCookies;
  const { name, data, leads } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
  });

  if (!user) {
    res.status(401).json({ msg: 'User not found', data: null });
    return;
  }

  if (!leads || !Array.isArray(leads) || leads.length === 0) {
    res.status(400).json({ msg: 'No leads provided', data: null });
    return;
  }

  const emailKey = Object.keys(leads[0]).find((key) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leads[0][key]),
  );

  if (!emailKey) {
    res
      .status(400)
      .json({ msg: 'Email column not found in leads', data: null });
    return;
  }

  const coldEmailNode = data.find((n: any) => n.type === 'coldEmail');
  const waitNode = data.find((n: any) => n.type === 'waitDelay');

  let totalDelayMs = 0;
  if (waitNode?.data?.delay && waitNode?.data?.timeUnit) {
    const delay = parseInt(waitNode.data.delay) || 1;
    totalDelayMs += convertToMilliseconds(delay, waitNode.data.timeUnit);
  }

  const scheduledAt = new Date(Date.now() + totalDelayMs);

  // Create flow in database
  const flow = await prisma.flow.create({
    data: {
      name,
      userId: payload.id,
      data,
      scheduledAt,
    },
  });

  // Save each lead to the database
  await prisma.lead.createMany({
    data: leads.map((lead: any) => ({
      data: lead,
      flowId: flow.id,
      email: lead[emailKey],
    })),
  });

  // Schedule an email job for each lead
  for (const lead of leads) {
    const leadEmail = lead[emailKey];

    if (coldEmailNode?.data?.subject && coldEmailNode?.data?.body) {
      const personalizedBody = replacePlaceholders(
        coldEmailNode?.data?.body,
        lead,
      );

      const subject = coldEmailNode?.data?.subject;

      try {
        await agenda.schedule(scheduledAt, 'send-email', {
          to: leadEmail,
          subject,
          body: personalizedBody,
        });
        console.log('Job scheduled for:', leadEmail);
      } catch (err) {
        console.error(`Error scheduling email to ${leadEmail}:`, err);
      }
    }
  }

  res
    .status(200)
    .json({ msg: 'Flow created and leads saved successfully.', data: flow });
}, 'Error Creating Flow');

// Controller to fetch all flows for a logged-in user
export const getFlows: RequestHandler = tryCatchHandler(async (req, res) => {
  const payload = req.signedCookies;

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
  });

  if (!user) {
    res.status(401).json({ msg: 'User not found', data: null });
    return;
  }

  const flows = await prisma.flow.findMany({
    where: { userId: payload.id },
    include: { _count: true, leads: true },
  });

  res.status(200).json({ msg: 'Flows Fetched Successfully', data: flows });
}, 'Error Fetching Flows');
