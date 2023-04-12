import { FastifyReply } from "fastify";

type HTTPStatusCode = 200 | 201 | 202 | 204 | 400 | 401 | 403 | 404 | 409 | 500;

interface APIError {
	status: number;
	data: {
		code: number;
		message: string;
	};
}

const enum ErrorSource {
	Generic = 1,
	Auth = 2,
	Billing = 3,
	Claim = 4,
}

function errorCode(source: ErrorSource, code: number): number {
	return source * 1000 + code;
}

const APIErrors = {
	GENERIC_ERROR: {
		status: 500,
		data: {
			code: errorCode(ErrorSource.Generic, 1),
			message: "An unknown error has occurred, please try again later",
		},
	},
	FILL_ALL_FIELDS: {
		status: 400,
		data: {
			code: errorCode(ErrorSource.Generic, 2),
			message: "Please fill out all fields",
		},
	},
	INVALID_REQUEST: (message: string = "Invalid request") => ({
		status: 400,
		data: {
			code: errorCode(ErrorSource.Generic, 3),
			message,
		},
	}),
	UNAUTHORIZED: {
		status: 401,
		data: { code: errorCode(ErrorSource.Auth, 1), message: "Unauthorized" },
	},
	ALREADY_AUTHORIZED: {
		status: 400,
		data: {
			code: errorCode(ErrorSource.Auth, 2),
			message: "Cannot perform this action while logged in",
		},
	},
	CAPTCHA_REQUIRED: {
		status: 401,
		data: {
			code: errorCode(ErrorSource.Auth, 3),
			message: "Captcha required",
		},
	},
	INVALID_CAPTCHA: {
		status: 401,
		data: {
			code: errorCode(ErrorSource.Auth, 4),
			message: "Invalid captcha answer",
		},
	},

	LOGIN_INVALID_CREDENTIALS: {
		status: 400,
		data: {
			code: errorCode(ErrorSource.Auth, 5),
			message: "Invalid credentials",
		},
	},

	REGISTER_INVALID_LINKNAME: {
		status: 400,
		data: {
			code: errorCode(ErrorSource.Auth, 6),
			message: "Invalid username",
		},
	},
	REGISTER_INVALID_EMAIL: {
		status: 400,
		data: {
			code: errorCode(ErrorSource.Auth, 7),
			message: "Invalid email",
		},
	},
	REGISTER_INVALID_PASSWORD: (
		message: string = "Your password must be at least 8 characters long"
	) => ({
		status: 400,
		data: {
			code: errorCode(ErrorSource.Auth, 8),
			message,
		},
	}),
	REGISTER_PASSWORD_TOO_LONG: {
		status: 400,
		data: {
			code: errorCode(ErrorSource.Auth, 9),
			message: "Your password is too long",
		},
	},
	REGISTER_EMAIL_IN_USE: {
		status: 409,
		data: {
			code: errorCode(ErrorSource.Auth, 10),
			message: "This email is already in use",
		},
	},
	CLAIM_USERNAME_ERROR: (
		message: string = "Invalid username specified."
	) => ({
		status: 400,
		data: {
			code: errorCode(ErrorSource.Claim, 0),
			message,
		},
	}),
	CLAIM_CATEGORY_ERROR: (
		message: string = "Invalid category specified."
	) => ({
		status: 400,
		data: {
			code: errorCode(ErrorSource.Claim, 1),
			message,
		},
	}),
	CLAIM_TEMPLATE_ERROR: (message: string = "Invalid template specified") => ({
		status: 400,
		data: {
			code: errorCode(ErrorSource.Claim, 2),
			message,
		},
	}),
	USER_NOT_FOUND: {
		status: 404,
		data: {
			code: errorCode(ErrorSource.Billing, 1),
			message: "User not found",
		},
	},
	SUBSCRIPTION_NOT_FOUND: {
		status: 404,
		data: {
			code: errorCode(ErrorSource.Billing, 1),
			message: "Subscription not found",
		},
	},
	PAYMENT_FAILED: (message: string = "Payment failed") => ({
		status: 400,
		data: {
			code: errorCode(ErrorSource.Billing, 2),
			message,
		},
	}),
};

export function sendError(reply: FastifyReply, error: APIError) {
	reply.code(error.status).send(error.data);
}

export default APIErrors;
