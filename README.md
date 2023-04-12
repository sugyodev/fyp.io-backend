# backend

# Setup

1. Install PostgreSQL, Redis and nginx.

2. Copy .env.example to .env and populate the configuration.

3. First, build the models and other stuff:

```sh
yarn build
```

4. Run database migrations:
```sh
yarn migration:run
```

Now you can start the project in watch mode:
```sh
yarn dev
```

# Development notes

Those are mostly written here to ensure that our system is easily scalable and maintainable.

### Ensure IPv6 support
The infrastructure runs exclusively on IPv6, so make sure any APIs we use support v6 only networks.

### Do not store any state in services

The requests can be handled by different instances of the service, so you can't rely on any state in the service. 
If you need to store some data, use Redis.

For file uploads, use S3.

### Use dependency injection

### Use distributed IDs for all entities in system

Use `SnowflakeService` to generate IDs. Do not use `@PrimaryGeneratedColumn`.

The IDs have one useful property you can use - they internally encode a timestamp, so if you need to get creation date of an entity or time-sort things, you don't have to store the date separately.

# Cheat sheet

### Generating new migrations

```sh
yarn migration:generate ./common/database/migrations/{migration name here}
```

(the full path is needed due to migrationsDir option being not present in current versions of TypeORM: https://github.com/typeorm/typeorm/issues/8860)
