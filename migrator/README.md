# Mirror your github repositories to your gitea server

## Badges

[![image pulls](https://img.shields.io/docker/pulls/unfoldingword/dcs-migrate-org-repos.svg)](https://cloud.docker.com/repository/docker/unfoldingword/dcs-migrate-org-repos)
[![microbadger analysis](https://images.microbadger.com/badges/image/unfoldingword/dcs-migrate-org-repos.svg)](https://microbadger.com/images/unfoldingword/dcs-migrate-org-repos "Get your own image badge on microbadger.com")

## Description

This script migrates the public repositories from a user or organization from one gitea instance to another.
It will - once started - create a repository under a given token for a gitea user fully automatically.

Example:
A upstream Gitea user `gitea-user-orig` has public repositories `dotfiles` and `zsh-config`.
Starting the script with a gitea token for the new server for the account `gitea-user-new` will create the following mirror repositories:

- orig.gitea.url/github-user/dotfiles &larr; new.gitea.url/gitea-user/dotfiles
- orig.gitea.url/github-user/zsh-config &larr; new.gitea.url/zsh-config/dotfiles

The mirror settings are default by your gitea instance.

## Prerequisites

- Something to migrate (a github user or organization with public repos)
- Two Gitea instance (orig and new) up and running
- User for New Gitea instance with generated token
- Docker

## Run it

```sh
docker container run \
 -d \
 --restart always \
 -e ORIG_GITEA_USERNAME=orig-gitea-user \
 -e NEW_GITEA_URL=https://new.gitea.url \
 -e NEW_GITEA_TOKEN=please-exchange-with-token \
 unfoldingword/dcs-migrate-org-repos:latest
```

This will a spin up a docker container running infinite which will try to mirror all your repositories once every hour to your gitea server.

### Parameters

- `ORIG_GITEA_USERNAME` name of user or organization which public repos should be mirrored
- `ORIG_GITEA_TOKEN` [Personal access token of a orig Gitea user](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/creating-a-personal-access-token) (optional)
- `NEW_GITEA_URL` url of the new gitea server
- `NEW_GITEA_TOKEN` token for the new gitea user

## Things to do

- refactoring
- think about how to test
- configurable interval
- better logging
- use github token to solve problems with rate limits
- add gitlab support
- and so on..
