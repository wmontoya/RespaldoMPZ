#!/bin/bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/araya_git_key
ssh -T git@github.com

git pull

npm run build

pm2 delete mpz-sci-client
pm2 start npm --name "mpz-sci-client" -- start
