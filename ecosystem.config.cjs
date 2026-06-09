const path = require("path");

module.exports = {
  apps: [
    {
      name: "talkto",
      script: path.join(__dirname, "scripts/pm2-start.sh"),
      interpreter: "/bin/bash",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
    },
  ],
};
