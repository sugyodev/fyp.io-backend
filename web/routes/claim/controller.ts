import { Container } from "async-injection";
import {
  FastifyError,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";

import { ILike, Repository } from "typeorm";
import passwordStrength from "pwd-strength";

import { SessionManagerService } from "../../../common/service/SessionManagerService";
import { DataSourceService } from "../../../common/service/DataSourceService";
import SnowflakeService from "../../../common/service/SnowflakeService";

import { checkLinknameDto, loginDataDto, signupDataDto } from "./requestDto";

import { BlackWord } from "../../../common/database/entities/BlackWord";
import { Profile } from "../../../common/database/entities/Profile";
import { User } from "../../../common/database/entities/User";

import { isEmailValid, isUsernameValid } from "../../../common/Validation";
import {
  generatePasswordHashSalt,
  verifyPassword,
  VerifyPasswordResult,
} from "../../../common/auth/Hashing";

import APIErrors, { sendError } from '../../../common/APIErrors';
import { UserAccount } from '../../../common/database/entities/UserAccount';
import { UserTemplate } from '../../../common/database/entities/UserTemplate';

export class ClaimController {
  fastify: FastifyInstance;
  container: Container;
  sessionManager: SessionManagerService;
  snowflake: SnowflakeService;
  dataSource: DataSourceService;

  userRepo: Repository<User>;
  profileRepo: Repository<Profile>;
  accountRepo: Repository<UserAccount>;
  templateRepo: Repository<UserTemplate>;
  blackWordRepo: Repository<BlackWord>;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.container = fastify.container;
  }

  public initialize = async () => {
    this.sessionManager = await this.container.resolve(
      SessionManagerService
    );
    this.dataSource = await this.container.resolve(DataSourceService);
    this.snowflake = await this.container.resolve(SnowflakeService);

    this.userRepo = this.dataSource.getRepository(User);
    this.profileRepo = this.dataSource.getRepository(Profile);
    this.accountRepo = this.dataSource.getRepository(UserAccount);
    this.templateRepo = this.dataSource.getRepository(UserTemplate);
    this.blackWordRepo = this.dataSource.getRepository(BlackWord);
  }

  public checkLinkname = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const { linkname } = request.body as checkLinknameDto;

    if (!isUsernameValid(linkname)) {
      return sendError(
        reply,
        APIErrors.CLAIM_USERNAME_ERROR()
      );
    }

    const profile = await this.profileRepo.findOneBy({
      linkname: ILike(linkname),
    });

    if (profile) return reply.send({ available: false });

    const blackWord = await this.blackWordRepo.findOneBy({
      name: ILike(linkname),
    });

    if (blackWord)
      return sendError(
        reply,
        APIErrors.CLAIM_USERNAME_ERROR(
          `This name is blacklisted from being used on FYP.bio`
        )
      );

    return reply.send({
      available: true,
    });
  };

  public signup = async (request: FastifyRequest, reply: FastifyReply) => {
    if (request.session) {
      return sendError(reply, APIErrors.ALREADY_AUTHORIZED);
    }

    const { email, linkname, password } = request.body as signupDataDto;

    if (!isUsernameValid(linkname)) {
      return sendError(reply, APIErrors.REGISTER_INVALID_LINKNAME);
    }

    if (!isEmailValid(email)) {
      return sendError(reply, APIErrors.REGISTER_INVALID_EMAIL);
    }

    const strengthCheck = passwordStrength(password);

    if (!strengthCheck.success) {
      return sendError(
        reply,
        APIErrors.REGISTER_INVALID_PASSWORD(strengthCheck.message)
      );
    }

    const user = new User();
    user.id = this.snowflake.genStr();
    user.email = email;
    user.passwordHash = await generatePasswordHashSalt(password);
    await this.userRepo.save(user);

    const account = new UserAccount();
    account.id = this.snowflake.genStr();
    await this.accountRepo.save(account);

    const template = new UserTemplate();
    template.id = this.snowflake.genStr();
    await this.templateRepo.save(template);

    const profile = new Profile();
    profile.id = this.snowflake.genStr();
    profile.linkname = linkname;
    profile.owner = user;
    profile.account = account;
    profile.template = template;

    await this.profileRepo.save(profile);

    const session = await this.sessionManager.createSessionForUser(user.id);

    return reply.send({
      token: session.createToken(),
    });
  };

  public login = async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, password } = request.body as loginDataDto;

    const user = await this.userRepo.findOneBy({
      email,
    });

    if (!user || !user.passwordHash) {
      return sendError(reply, APIErrors.LOGIN_INVALID_CREDENTIALS);
    }

    const result = await verifyPassword(password, user.passwordHash);
    if (result === VerifyPasswordResult.OK) {
      const session = await this.sessionManager.createSessionForUser(
        user.id
      );

      return reply.send({
        token: session.createToken(),
      });
    } else {
      return sendError(reply, APIErrors.LOGIN_INVALID_CREDENTIALS);
    }
  };

  public logout = async (request: FastifyRequest, reply: FastifyReply) => {
    request.session?.destroy();
    return reply.send({});
  };
}
