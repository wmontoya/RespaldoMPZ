module.exports = {
  apps: [
    {
      name: "mpz-sci-client",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3070",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};

