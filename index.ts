import { Container } from "async-injection";
import dotenv from "dotenv";
import pino from "pino";
import "reflect-metadata";
import {
  dataSourceFactory,
  DataSourceService,
} from "./common/service/DataSourceService";
import { EmailerService } from "./common/service/EmailerService";
import { redisFactory, RedisService } from "./common/service/RedisService";
import { sendInBlueEmailerFactory } from "./common/service/SendInBlueEmailerService";
import { SessionManagerService } from "./common/service/SessionManagerService";
import SnowflakeService, {
  snowflakeFactory,
} from "./common/service/SnowflakeService";
import {
	StripeService,
	stripeServiceFactory,
} from "./common/service/StripeService";
import {
	PayPalService,
	paypalServiceFactory,
} from "./common/service/PayPalService";
import {
	referralServiceFactory,
	ReferralService,
} from "./common/service/ReferralService";

dotenv.config();

(global as any).__inapp = true;

let services = process.env.SERVICES?.split(",") ?? [];

if (!services.length) {
  throw new Error("Missing SERVICES environment variable");
}

const validServices = ["web", "admin"];

services = services.filter((service) => validServices.includes(service));

if (!services.length) {
  throw new Error("No valid services found in SERVICES environment variable");
}

const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
});

const container = new Container();

container.bindConstant("logger", logger);
container.bindAsyncFactory(RedisService, redisFactory).asSingleton();
container.bindAsyncFactory(DataSourceService, dataSourceFactory).asSingleton();
container.bindAsyncFactory(SnowflakeService, snowflakeFactory).asSingleton();
container
  .bindAsyncFactory(EmailerService, sendInBlueEmailerFactory)
  .asSingleton();
container.bindAsyncFactory(StripeService, stripeServiceFactory).asSingleton();
container.bindAsyncFactory(PayPalService, paypalServiceFactory).asSingleton();
container.bindAsyncFactory(ReferralService, referralServiceFactory).asSingleton();
container.bindClass(SessionManagerService).asSingleton();

for (const service of services) {
  logger.info(`Starting service: ${service}`);

  // TODO: TypeScript is broken

	const m = require(`./${service}`);
	m.default(container).catch((error: any) => {
		logger.error(
			error,
			`An error occurred while starting service ${service}`,
		);
		process.exit(1);
	});
}
