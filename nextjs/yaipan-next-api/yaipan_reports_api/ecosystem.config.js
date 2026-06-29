module.exports = {
    apps: [
      {
        name: "yaipan_reports_api",
        script: "node_modules/.bin/next",
        args: "start -p 3051",
        env: {
          NODE_ENV: "production"
        }
      }
    ]
  };
  