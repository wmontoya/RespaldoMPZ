module.exports = {
    apps: [
      {
        name: "autogestion_spa",
        script: "node_modules/.bin/next",
        args: "start -p 3062",
        env: {
          NODE_ENV: "production"
        }
      }
    ]
  };
  