#!/usr/bin/env sh

set -ex

docker image build -t unfoldingword/dcs-migrate-org-repos:development .
source env.sh

docker container run \
 -it \
 --rm \
 -e FROM_GITEA_USERNAME="$FROM_GITEA_USERNAME" \
 -e FROM_GITEA_URL="$FROM_GITEA_URL" \
 -e TO_GITEA_URL="$TO_GITEA_URL" \
 -e TO_GITEA_TOKEN="$TO_GITEA_TOKEN" \
 -e TO_GITEA_USERNAME="$TO_GITEA_USERNAME" \
 -e MIRROR_REPOS="$MIRROR_REPOS" \
 --net dcs-net \
 unfoldingword/dcs-migrate-org-repos:development
