import { Injectable } from "async-injection";
import { Redis as IORedis } from "ioredis";

@Injectable()
export class RedisService extends IORedis {
	constructor() {
		const redisDsn = process.env.REDIS_DSN;
		if (!redisDsn) {
			throw new Error("Missing REDIS_DSN environment variable");
		}

		super(redisDsn, {
			lazyConnect: true,
		});
	}
}

export async function redisFactory(): Promise<RedisService> {
	const redis = new RedisService();
	await redis.connect();
	return redis;
}
