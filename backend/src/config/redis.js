import { env } from './env.config.js';
import { createClient } from 'redis';

const redisConfig = env.REDIS_URL
    ? {
        url: env.REDIS_URL,
    }
    : {
        socket: {
            host: env.REDIS_HOST,
            port: env.REDIS_PORT,
        },
        password: env.REDIS_PASSWORD || undefined
    };

export const redisClient = createClient(redisConfig);
// Dedicated Subscriber for watching expirations
export const redisSubscriber = createClient(redisConfig);

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisSubscriber.on('error', (err) => console.error('Redis Subscriber Error:', err));

const connectRedis = async () => {
    try {
        await Promise.all([redisClient.connect(), redisSubscriber.connect()]);
        console.log("Redis Connected Successfully");

        await redisClient.configSet('notify-keyspace-events', 'Ex');
    } catch (error) {
        console.error('Redis connection failed:', error.message);
    }
};
connectRedis();
export default redisClient;
