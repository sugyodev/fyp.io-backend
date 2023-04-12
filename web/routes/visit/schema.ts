export const visitSchema = {
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
