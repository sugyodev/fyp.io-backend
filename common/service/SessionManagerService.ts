import { Injectable } from "async-injection";
import { preHandlerAsyncHookHandler } from "fastify";
import crypto from "node:crypto";
import { Repository } from "typeorm";
import APIErrors, { sendError } from "../APIErrors";
import { User } from "../database/entities/User";
import { Signer } from "../itsdangerous";
import { RedisService } from "./RedisService";

interface SessionPayload {
	version: number;
	userId: string;
}

export class Session {
	#redis: RedisService;
	#signer: Signer;
	sessionId: string;
	userId: string;

	constructor(
		redis: RedisService,
		signer: Signer,
		sessionId: string,
		payload: SessionPayload
	) {
		this.#redis = redis;
		this.#signer = signer;
		payload = this.#upgradePayload(payload);

		this.sessionId = sessionId;
		this.userId = payload.userId;

		this.save();
	}

	#upgradePayload(payload: SessionPayload): SessionPayload {
		if (payload.version === 1) {
			return payload;
		}

		throw new Error("Invalid payload version");
	}

	save() {
		return this.#redis.set(
			`sessions:${this.sessionId}`,
			JSON.stringify({
				version: 1,
				userId: this.userId,
			}),
			"EX",
			SessionManagerService.MAX_AGE
		);
	}

	destroy() {
		return this.#redis.del(`sessions:${this.sessionId}`);
	}

	createToken(): string {
		return this.#signer.sign(this.sessionId);
	}

	async getUser(userRepo: Repository<User>): Promise<User> {
		const user = await userRepo.findOneBy({
			id: this.userId,
		});
		return user!;
	}
}

@Injectable()
export class SessionManagerService {
	#redis: RedisService;
	#signer: Signer;

	static MAX_AGE = 2592000;

	/**
	 * A request-pre handler that resolves the session token from the request and puts it in the request object.
	 */
	sessionPreHandler: preHandlerAsyncHookHandler;

	/**
	 * A request-pre handler that checks if the user is authenticated and if not, returns a 401.
	 */
	requireAuthHandler: preHandlerAsyncHookHandler;

	constructor(redis: RedisService) {
		if (!process.env.SECRET_KEY) {
			throw new Error("Missing SECRET_KEY");
		}

		this.#redis = redis;
		this.#signer = new Signer(process.env.SECRET_KEY, {
			digestMethod: "sha3-512",
		});

		this.#createHandlers();
	}

	#createHandlers() {
		this.sessionPreHandler = async (request, reply) => {
			const token = request.headers["authorization"];
			if (!token) {
				return;
			}

			request.session = await this.getSessionFromToken(token);
		};

		this.requireAuthHandler = async (request, reply) => {
			if (!request.session) {
				sendError(reply, APIErrors.UNAUTHORIZED);
			}
		};
	}

	/**
	 * @param token The authorization token
	 * @returns Session or undefined if session or token is invalid or has expired.
	 */
	async getSessionFromToken(token: string): Promise<Session | undefined> {
		const sessionId = this.#signer.unsign(token);

		if (!sessionId) return undefined;

		const session = await this.#redis.get(`sessions:${sessionId}`);
		if (!session) {
			console.log("no session");
			return undefined;
		}

		return new Session(
			this.#redis,
			this.#signer,
			sessionId,
			JSON.parse(session)
		);
	}

	/**
	 * Creates a session.
	 * @param id The user ID to create session for.
	 */
	async createSessionForUser(id: string): Promise<Session> {
		const sessionId = crypto.randomBytes(32).toString("base64url");

		const payload: SessionPayload = {
			version: 1,
			userId: id,
		};

		const session = new Session(
			this.#redis,
			this.#signer,
			sessionId,
			payload
		);

		return session;
	}
}
