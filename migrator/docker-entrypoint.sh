#!/usr/bin/env sh

set -e

ONE_HOUR_DELAY=3600

while true
do
  echo 'Starting to migrate repos...'
  node /app/index.js

  echo 'Waiting 60 minutes to migrate again...'
  sleep "${ONE_HOUR_DELAY}"
done
