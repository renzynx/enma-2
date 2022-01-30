#!/bin/bash
apt update
apt install curl 

rm -rf ~/.nvm

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

source ~/.nvm/nvm.sh

nvm install --lts

npm install -g yarn

yarn set version berry

yarn install 

yarn build

yarn start