import { Injectable, Injector } from "async-injection";
import { Logger } from "pino";
import { DataSource } from "typeorm";
import { BlackWord } from '../database/entities/BlackWord';
import { DataInterestCategory } from '../database/entities/DataInterestCategory';
import { DataInterestItem } from '../database/entities/DataInterestItem';
import { Profile } from '../database/entities/Profile';
import { Subscription } from "../database/entities/Subscription";
import { ReferralPremium } from "../database/entities/ReferralPremium";

import { User } from "../database/entities/User";
import { UserLinkCustom } from '../database/entities/UserLinkCustom';
import { UserLinkEmbed } from '../database/entities/UserLinkEmbed';
import { UserLinkSocial } from '../database/entities/UserLinkSocial';
import { UserAccount } from '../database/entities/UserAccount';
import { UserTemplate } from '../database/entities/UserTemplate';


@Injectable()
export class DataSourceService extends DataSource { }

export const entities = [
  User,
  Profile,
  UserAccount,
  UserTemplate,
  Subscription,
  ReferralPremium,
  DataInterestCategory,
  DataInterestItem,
  UserLinkCustom,
  UserLinkSocial,
  UserLinkEmbed,
  BlackWord,
  // Profile, 
  // InterestCategory, 
  // EmbedLinks,
  // CustomLinks,
];

export async function dataSourceFactory(injector: Injector) {
  const logger = await injector.resolve<Logger>("logger");
  const url = process.env.DATABASE_URL;

  const dataSource = new DataSource({
    type: "postgres",
    synchronize: false,
    poolSize: 100,
    url,
    entities,
    migrationsRun: true
  });

  logger.info("Connecting to database...");

  return await dataSource.initialize()
}
