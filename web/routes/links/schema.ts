
import { LinkClockType, LinkImageType, LinkLockType, LinkPrioritize, LinkStyle, LinkType } from '../../../common/Define'

export const createSocialLinkSchema = {
  body: {
    type: "object",
    properties: {
      socialLinkId: { type: "number" }
    },
    required: ["socialLinkId"]
  },
}


export const updateSocialLinkSchema = {
  body: {
    type: "object",
    properties: {
      url: { type: "string" }
    },
    required: ["url"]
  },
}

export const createCustomLinkSchema = {
  body: {
    properties: {
      type: { type: "enum", enum: LinkType },
      title: { type: "string" }
    },
    required: ["title", "url"]
  },
}

export const updateCustomLinkSchema = {
  body: {
    type: "object",
    properties: {
      type: { type: "enum", enum: LinkType },
      title: { type: "string" },
      url: { type: "string" },
      enabled: { type: "boolean" },
      clickCnt: { type: "number" },

      linkStyle: { type: "enum", enum: LinkStyle },

      imageType: { type: "enum", enum: LinkImageType },
      imageUrl: { type: "string" },

      prioritizeType: { type: "enum", enum: LinkPrioritize },
      prioritizeId: { type: "number" },

      lockType: { type: "enum", enum: LinkLockType },
      lockEnabled: { type: "boolean" },
      lockCode: { type: "string" },
      lockAge: { type: "number" },
      lockDescription: {
        type: "string"
      },

      clockType: { type: "enum", enum: LinkClockType },
      clockStamp1: { type: "string" },
      clockStamp2: { type: "string" },
      clockZone1: { type: "string" },
      clockZone2: { type: "string" },
      linkname: { type: "string" }
    },
    required: [],
  }
}
