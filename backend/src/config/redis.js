import { env } from './env.config.js';
import { createClient } from 'redis';

const redisConfig = {
    socket: { host: env.REDIS_HOST, port: env.REDIS_PORT }
};

if (env.REDIS_PASSWORD) {
    redisConfig.password = env.REDIS_PASSWORD;
}

export const redisClient = createClient(redisConfig);
// Dedicated Subscriber for watching expirations
export const redisSubscriber = createClient(redisConfig);

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
