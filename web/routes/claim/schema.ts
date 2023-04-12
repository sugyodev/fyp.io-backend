export const checkLinknameSchema = {
	body: {
		type: "object",
		properties: {
			linkname: { type: "string" },
		},
		required: ["linkname"],
	},
	response: {
		200: {
			type: "object",
			properties: {
				available: { type: "boolean" },
			},
		},
	},
};

export const signupSchema = {
	body: {
		type: "object",
		properties: {
			email: { type: "string" },
			password: { type: "string" },
			linkname: { type: "string" },
		},
		required: ["email", "password", "linkname"],
	},
};

export const loginSchema = {
	body: {
		type: "object",
		properties: {
			email: { type: "string" },
			password: { type: "string" },
		},
		required: ["email", "password"],
	},
};
