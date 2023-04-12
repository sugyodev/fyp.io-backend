import { Injectable, Injector } from "async-injection";
import { Redis } from "ioredis";
import { Logger } from "pino";
import { RedisService } from "./RedisService";

/**
 * A distributed ID generator implementing Twitter snowflake specification.
 */
@Injectable()
class SnowflakeService {
	// 1st January 2023 00:00 UTC
	static epoch = 1672531200000n;

	#redis: Redis;
	#logger: Logger;
	#nodeId = 0n;
	#lastMs = 0n;
	#increment = 0n;

	constructor(logger: Logger, redis: Redis) {
		this.#redis = redis;
		this.#logger = logger;
	}

	/**
	 * Assigns a node id and runs a periodic task that updates the node id reservation.
	 */
	async assignNodeId() {
		const redis = this.#redis;
		const logger = this.#logger;

		for (;;) {
			const nodeId = (Math.random() * 1024) | 0;
			logger.debug("Trying to reserve node ID " + nodeId);

			const result = await redis.set(
				`sys:nodeIdReservation:${nodeId}`,
				1,
				"EX",
				30,
				"NX"
			);
			if (result === "OK") {
				this.#nodeId = BigInt(nodeId);
				logger.info("Assigned node ID " + nodeId);
				break;
			}
		}

		const nodeReservationKeeper = setInterval(async () => {
			redis.set(`sys:nodeIdReservation`, 1, "EX", 60);
		}, 30000);

		// no need to keep it running in case the app finishes
		nodeReservationKeeper.unref();
	}

	/**
	 * Generates a new ID.
	 * @returns {bigint} Snowflake ID as a bigint
	 */
	gen(): bigint {
		const now = BigInt(Date.now());

		if (this.#lastMs !== now) {
			this.#lastMs = now;
			this.#increment = 0n;
		}

		return (
			((now - SnowflakeService.epoch) << 22n) |
			(this.#nodeId << 12n) |
			(this.#increment++ & 0xfffn)
		);
	}

	/**
	 * Generates a new ID returned as string.
	 * Identical to .gen().toString().
	 * @returns {bigint} Snowflake ID as a string.
	 */
	genStr(): string {
		return this.gen().toString();
	}

	static extractDate(id: string | bigint): Date {
		id = BigInt(id);
		const timestamp = Number((id >> 22n) + SnowflakeService.epoch);
		return new Date(timestamp);
	}
}

export async function snowflakeFactory(
	injector: Injector
): Promise<SnowflakeService> {
	const logger = await injector.resolve<Logger>("logger");
	const redis = await injector.resolve(RedisService);

	const service = new SnowflakeService(logger, redis);
	await service.assignNodeId();
	return service;
}

export default SnowflakeService;
