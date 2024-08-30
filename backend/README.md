## PandaETL

## Run

### Prerequisites

- Create an env file use .env.example [Optional]

### Install dependency

```shell
> poetry shell
> poetry install
```

### Apply database migration

```shell
> make migrate
```

### Create new database migration after schema changes

```shell
> make generate-migration
```

### Start Server

```shell
> make run
```
