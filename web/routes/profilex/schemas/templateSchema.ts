import { TemplateTypes } from '../../../../helper/template/templateEnum';

export const setCategoriesSchema = {
  body: {
    type: "object",
    properties: {
      categories: { type: "simple-array" },
    },
    required: ["categories"],
  },
};

export const getLinkInfoSchema = {
  body: {
    type: "object",
    properties: {
      linkname: { type: "string" },
    },
    required: ["linkname"],
  },
};

export const setAccountSchema = {
  body: {
    type: "object",
    properties: {
      id: { type: "number" },
      username: { type: "string" },
      description: { type: "string" },
      avatarUrl: { type: "string" },
      phoneNumber: { type: "string" },
    },
    required: [],
  },
};

export const setTemplateSchema = {
  body: {
    type: "object",
    properties: {
      id: { type: "number" },
      templateType: { type: "enum", enum: TemplateTypes },
      coverState: { type: "boolean" },
      carouselImageUrls: { type: "simple-array" },

    },
    required: [],
  },
};
