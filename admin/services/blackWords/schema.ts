export const createBlackWordSchema = {
  body: {
    type: "object",
    properties: {
      type: {
        "type": "integer",
        "enum": [0, 1, 2]
      },
      name: { type: "string" },
      description: { type: "string" },
    },
    required: ["type", "name", "description"],
  }
}