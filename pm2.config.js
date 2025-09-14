module.exports = {
  apps: [
    {
      name: "chef-web",
      script: "./node_modules/.bin/next",
      args: "start --port 3000",
      max_memory_restart: '4000M',
      env: {
        NODE_ENV: 'production',
        NEXTAUTH_SECRET: '682A.,m3$Jz%pcxHjt2|N4DY@if',
      },
      watch: false,
      autorestart: true,
    },
  ]
}