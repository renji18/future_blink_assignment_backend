import { RequestHandler } from 'express';
import tryCatchHandler from '../middlewares/tryCatch';
import prisma from '../utils/prismaClient';
import agenda from '../utils/agendaInstance';
import { replacePlaceholders } from '../utils/templateEngine';
import { convertToMilliseconds } from '../utils/convertToMilliseconds';

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

  const flow = await prisma.flow.create({
    data: {
      name,
      userId: payload.id,
      data,
    },
  });

  if (!leads || !Array.isArray(leads) || leads.length === 0) {
    res.status(400).json({ msg: 'No leads provided', data: null });
    return;
  }

  const firstLead = leads[0];
  let emailKey: string | undefined;

  for (const key of Object.keys(firstLead)) {
    const value = firstLead[key];
    if (typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      emailKey = key;
      break;
    }
  }

  if (!emailKey) {
    res
      .status(400)
      .json({ msg: 'Email column not found in leads', data: null });
    return;
  }

  await prisma.lead.createMany({
    data: leads.map((lead: any) => ({
      data: lead,
      flowId: flow.id,
      email: lead[emailKey!],
    })),
  });

  for (const lead of leads) {
    const leadEmail = lead[emailKey];
    let totalDelayMs = 0;

    // const leadSourceNode = data.find((node: any) => node.type === 'leadSource');
    const coldEmailNode = data.find((node: any) => node.type === 'coldEmail');
    const waitNode = data.find((node: any) => node.type === 'waitDelay');

    if (coldEmailNode) {
      const { subject, body } = coldEmailNode.data;

      if (waitNode && waitNode.data?.delay && waitNode.data?.timeUnit) {
        const { delay, timeUnit } = waitNode.data;
        totalDelayMs += convertToMilliseconds(delay, timeUnit);
      }

      console.log(body, 'body before update');

      console.log(lead, 'lead  .');

      const personalizedBody = replacePlaceholders(body, lead);

      console.log(personalizedBody, 'perbody');

      const sendTime = new Date(Date.now() + totalDelayMs);

      try {
        await agenda.schedule(sendTime, 'send-email', {
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
