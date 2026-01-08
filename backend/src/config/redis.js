import { env } from './env.config.js';
import { createClient } from 'redis';

const redisClient = createClient({
    username: 'default',
    password: env.REDIS_PASSWORD,
    socket: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT
    }
});

redisClient.on('error', err => console.log('Redis Client Error', err));
try {
    await redisClient.connect();
    console.log("redis connected")
} catch (error) {
    console.error('could not connect to redis', error.message)
    process.exit(1)
}


export default redisClient

