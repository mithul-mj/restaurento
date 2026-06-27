import { Queue, Worker } from 'bullmq'
import Redis from 'ioredis'
import { sendEmail } from '../services/email.service.js'
import { env } from '../config/env.config.js'

const connection = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
})

export const emailQueue = new Queue('email-queue', { connection });

const emailWorker = new Worker('email-queue', async (job) => {
    const { to, subject, text, html } = job.data;
    console.log(`[BullMQ] Sending email to ${to}...`);
    await sendEmail(to, subject, text, html);
    console.log(`[BullMQ] Email sent successfully to ${to}!`);
}, { connection, concurrency: 5 })

emailWorker.on('failed', (job, err) => {
    console.error(`[BullMQ] Email job failed for ${job.data.to}:`, err);
})