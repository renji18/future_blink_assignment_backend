import { Agenda } from 'agenda';
import nodemailer from 'nodemailer';
import config from '../config/config';
import prisma from './prismaClient';

const agenda = new Agenda({
  db: {
    address: config.DATABASE_URL,
    collection: 'jobs',
  },
});

agenda.define('send-email', async (job: any) => {
  const { to, subject, body } = job.attrs.data as {
    to: string;
    subject: string;
    body: string;
  };

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: config.EMAIL_USER,
      to,
      subject,
      html: body,
    });

    await prisma.lead.updateMany({
      where: { email: to },
      data: { status: 'success' },
    });
  } catch (err) {
    await prisma.lead.updateMany({
      where: { email: to },
      data: { status: 'error' },
    });
  }
});

agenda.on('ready', () => {
  console.log('Agenda is ready');
});

agenda.on('error', (err) => {
  console.error('Agenda error:', err);
});

(async function startAgenda() {
  await agenda.start();
})();

export default agenda;
