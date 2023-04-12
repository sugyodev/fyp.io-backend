import { Timestamp } from 'typeorm';
import {
  LinkClockType,
  LinkImageType,
  LinkLockType,
  LinkPrioritize,
  LinkType,
  LinkStyle,
} from "../../../common/Define";

export interface saveSocialLinksDto { 
  socialLinks: updateSocialLinkDto[];
}

export interface saveCustomLinksDto { 
  customLinks: updateCustomLinkDto[];
}

export interface createSocialLinkDto {
  socialLinkId: number;
  url: string;
}

export interface createCustomLinkDto {
  type: LinkType;
  title: string;
}

export interface readByParamDto {
  id: number;
}

export interface updateSocialLinkDto {
  title: string;
  url: string;
}

export interface updateCustomLinkDto {
  type: LinkType;
  title: string;
  url: string;
  enabled: boolean;
  clickCnt: number;

  linkStyle: LinkStyle;

  imageType: LinkImageType;
  imageUrl: string | null;

  prioritizeType: LinkPrioritize;
  prioritizeId: number;

  lockType: LinkLockType;
  lockEnabled: boolean;
  lockCode: string | null;
  lockAge: number | null;
  lockDescription: string | null;

  clockType: LinkClockType;
  clockStamp1: Timestamp | null;
  clockStamp2: Timestamp | null;
  clockZone1: string | null;
  clockZone2: string | null;
}

