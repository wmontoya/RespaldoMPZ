module.exports = {
    apps: [
      {
        name: "trash_pwa",
        script: "node_modules/.bin/next",
        args: "start -p 3061",
        env: {
          NODE_ENV: "production"
        }
      }
    ]
  };
  