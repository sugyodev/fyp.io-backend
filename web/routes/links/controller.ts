import { Container } from "async-injection";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { Repository } from "typeorm";

import { SessionManagerService } from "../../../common/service/SessionManagerService";
import { DataSourceService } from "../../../common/service/DataSourceService";
import SnowflakeService from "../../../common/service/SnowflakeService";

import {
  readByParamDto,
  createCustomLinkDto,
  createSocialLinkDto,
  updateCustomLinkDto,
  updateSocialLinkDto,
  saveSocialLinksDto,
  saveCustomLinksDto
} from "./requestDto";

import { User } from "../../../common/database/entities/User";
import { Profile } from '../../../common/database/entities/Profile';
import { UserLinkCustom } from "../../../common/database/entities/UserLinkCustom";
import { UserLinkSocial } from "../../../common/database/entities/UserLinkSocial";

import APIErrors, { sendError } from "../../../common/APIErrors";

export class LinksController {
  fastify: FastifyInstance;
  container: Container;
  sessionManager: SessionManagerService;
  snowflake: SnowflakeService;
  dataSource: DataSourceService;

  userRepo: Repository<User>;
  profileRepo: Repository<Profile>;
  socialLinksRepo: Repository<UserLinkSocial>;
  customLinksRepo: Repository<UserLinkCustom>;

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
    this.socialLinksRepo = this.dataSource.getRepository(UserLinkSocial);
    this.customLinksRepo = this.dataSource.getRepository(UserLinkCustom);
  };

  public createSocialLink = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = request.session!;
    const data = request.body as createSocialLinkDto;
    const user = await session.getUser(this.userRepo);
    const profile = await this.profileRepo.findOne({
      where: {
        owner: user,
      }
    });
    try {
      if (profile) {
        const socialPinnedLink = new UserLinkSocial();
        socialPinnedLink.id = this.snowflake.genStr();
        socialPinnedLink.profile = profile;
        await this.socialLinksRepo.save({ ...socialPinnedLink, ...data });

        reply.send({
          message: "Success",
          socialPinnedLink: socialPinnedLink
        })
      } else {
        reply.send({
          message: "error",
        })
      }
    } catch (err) {
      reply.send({
        message: "error",
        error: err
      })
    }
  }

  public createCustomLink = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = request.session!;
    const { type, title } = request.body as createCustomLinkDto;

    const user = await session.getUser(this.userRepo);
    const profile = await this.profileRepo.findOne({
      where: {
        owner: user,
      },
    });
    try {
      if (profile) {
        const customLink = new UserLinkCustom();
        customLink.id = this.snowflake.genStr();
        customLink.type = type;
        customLink.title = title;
        customLink.profile = profile;
        await this.customLinksRepo.save(customLink);

        reply.send({
          message: "Success",
          customLink: customLink
        })
      } else {
        reply.send({
          message: "error",
        })
      }
    } catch (err) {
      reply.send({
        message: "error",
        error: err
      })
    }
  }

  public readSocialLink = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = request.session!;
    const { id } = request.params as readByParamDto;

    const user = await session.getUser(this.userRepo);
    const profile = await this.profileRepo.findOne({
      where: {
        owner: user,
      },
      relations: {
        socialPinnedLinks: true
      }
    });

    try {
      if (profile) {
        reply.send({
          message: "Success",
          socialPinnedLink: profile.socialPinnedLinks[id]
        })
      } else {
        reply.send({
          message: "error",
        })
      }
    } catch (err) {
      reply.send({
        message: "error",
        error: err
      })
    }
  }

  public readCustomLink = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = request.session!;
    const { id } = request.params as readByParamDto;

    const user = await session.getUser(this.userRepo);
    const profile = await this.profileRepo.findOne({
      where: {
        owner: user,
      },
      relations: {
        customLinks: true
      }
    });

    try {
      if (profile) {
        reply.send({
          message: "Success",
          socialPinnedLink: profile.customLinks[id]
        })
      } else {
        reply.send({
          message: "error",
        })
      }
    } catch (err) {
      reply.send({
        message: "error",
        error: err
      })
    }
  }

  public updateSocialLink = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = request.session!;
    const { id } = request.params as readByParamDto;
    const { url } = request.body as updateSocialLinkDto;

    const user = await session.getUser(this.userRepo);
    const profile = await this.profileRepo.findOne({
      where: {
        owner: user,
      },
      relations: {
        socialPinnedLinks: true
      }
    });

    try {
      if (profile) {
        const socialPinnedLink = profile.socialPinnedLinks[id];
        socialPinnedLink.url = url;
        await this.socialLinksRepo.update({ id: socialPinnedLink.id }, socialPinnedLink);
      } else {
        reply.send({
          message: "error",
        })
      }
    } catch (err) {
      reply.send({
        message: "error",
        error: err
      })
    }
  }


  public updateCustomLink = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = request.session!;
    const { id } = request.params as readByParamDto;
    const data = request.body as updateCustomLinkDto;

    const user = await session.getUser(this.userRepo);
    const profile = await this.profileRepo.findOne({
      where: {
        owner: user,
      },
      relations: {
        customLinks: true
      }
    });

    try {
      if (profile) {
        const customLink = profile.customLinks[id];
        // customLink = {...customLink, data};
        // customLink.type = data.type;
        // customLink.title = data.title;
        // customLink.url = data.url;
        // customLink.enabled = data.enabled;
        // customLink.clickCnt = data.clickCnt;

        // customLink.linkStyle = data.linkStyle;

        // customLink.imageType = data.imageType;
        // customLink.imageUrl = data.imageUrl;

        // customLink.prioritizeType = data.prioritizeType;
        // customLink.prioritizeId = data.prioritizeId;

        // customLink.lockType = data.lockType;
        // customLink.lockEnabled = data.lockEnabled;
        // customLink.lockCode = data.lockCode;
        // customLink.lockAge = data.lockAge;
        // customLink.lockDescription = data.lockDescription;

        // customLink.clockType = data.clockType;
        // customLink.clockStamp1 = data.clockStamp1;
        // customLink.clockStamp2 = data.clockStamp2;
        // customLink.clockZone1 = data.clockZone1;
        // customLink.clockZone2 = data.clockZone2;
        await this.customLinksRepo.update({ id: customLink.id }, { ...customLink, ...data });
      } else {
        reply.send({
          message: "error",
        })
      }
    } catch (err) {
      reply.send({
        message: "error",
        error: err
      })
    }
  }

  public deleteSocialLink = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = request.session!;
    const { id } = request.params as readByParamDto;

    const user = await session.getUser(this.userRepo);
    const profile = await this.profileRepo.findOne({
      where: {
        owner: user,
      },
      relations: {
        socialPinnedLinks: true
      }
    });

    try {
      if (profile) {
        const socialPinnedLink = profile.socialPinnedLinks[id];
        await this.socialLinksRepo.remove(socialPinnedLink);
        reply.send({
          message: "success",
        })
      } else {
        reply.send({
          message: "error",
        })
      }
    } catch (err) {
      reply.send({
        message: "error",
        error: err
      })
    }
  }

  public deleteCustomLink = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = request.session!;
    const { id } = request.params as readByParamDto;

    const user = await session.getUser(this.userRepo);
    const profile = await this.profileRepo.findOne({
      where: {
        owner: user,
      },
      relations: {
        customLinks: true
      }
    });

    try {
      if (profile) {
        const customLink = profile.customLinks[id];
        await this.customLinksRepo.remove(customLink);
      } else {
        reply.send({
          message: "error",
        })
      }
    } catch (err) {
      reply.send({
        message: "error",
        error: err
      })
    }
  }

  public saveSocialLinks = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = request.session!;
    const { socialLinks } = request.body as saveSocialLinksDto;

    const user = await session.getUser(this.userRepo);
    const profile = await this.profileRepo.findOne({
      where: {
        owner: user,
      },
      relations: {
        socialPinnedLinks: true
      }
    });

    try {
      if (profile) {
        for (let i = 0; i < socialLinks.length; i++) {
          const socialPinnedLink = profile.socialPinnedLinks[i];
          const id = socialPinnedLink.id;
          await this.socialLinksRepo.update({ id: id }, { ...socialPinnedLink, ...socialLinks[i] })
        }
        reply.send({
          message: "Success",
        })
      } else {
        reply.send({
          message: "error",
        })
      }
    } catch (err) {
      reply.send({
        message: "error",
        error: err
      })
    }
  }

  public saveCustomLinks = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = request.session!;
    const { customLinks } = request.body as saveCustomLinksDto;

    const user = await session.getUser(this.userRepo);
    const profile = await this.profileRepo.findOne({
      where: {
        owner: user,
      },
      relations: {
        customLinks: true
      }
    });

    try {
      if (profile) {
        for (let i = 0; i < customLinks.length; i++) {
          const customLink = profile.customLinks[i];
          const id = customLink.id;
          await this.customLinksRepo.update({ id: id }, { ...customLink, ...customLinks[i] })
        }
      } else {
        reply.send({
          message: "error",
        })
      }
    } catch (err) {
      reply.send({
        message: "error",
        error: err
      })
    }
  }

  public getSocialLinks = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = request.session!;

    const user = await session.getUser(this.userRepo);
    const profile = await this.profileRepo.findOne({
      where: {
        owner: user,
      },
      relations: {
        socialPinnedLinks: true
      }
    });

    try {
      if (profile) {
        reply.send({
          message: "success",
          socialPinnedLinks: profile.socialPinnedLinks
        })
      } else {
        reply.send({
          message: "error",
        })
      }
    } catch (err) {
      reply.send({
        message: "error",
        error: err
      })
    }
  }

  public getCustomLinks = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const session = request.session!;

    const user = await session.getUser(this.userRepo);
    const profile = await this.profileRepo.findOne({
      where: {
        owner: user,
      },
      relations: {
        customLinks: true
      }
    });

    try {
      if (profile) {
        reply.send({
          message: "success",
          customLinks: profile.customLinks
        })
      } else {
        reply.send({
          message: "error",
        })
      }
    } catch (err) {
      reply.send({
        message: "error",
        error: err
      })
    }
  }
}
