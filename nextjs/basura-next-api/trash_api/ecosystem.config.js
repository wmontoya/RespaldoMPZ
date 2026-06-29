module.exports = {
    apps: [
      {
        name: "trash_api",
        script: "node_modules/.bin/next",
        args: "start -p 3061",
        env: {
          NODE_ENV: "production"
        }
      }
    ]
  };
  