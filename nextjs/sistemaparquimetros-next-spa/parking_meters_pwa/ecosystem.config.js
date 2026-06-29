module.exports = {
    apps: [
      {
        name: "parking_meters_api",
        script: "node_modules/.bin/next",
        args: "start -p 3050",
        env: {
          NODE_ENV: "production"
        }
      }
    ]
  };
  