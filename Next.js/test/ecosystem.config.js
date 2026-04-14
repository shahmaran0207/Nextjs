module.exports = {
  apps: [
    {
      name: 'app-blue',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      env: {
        PORT: 3000,
        NODE_ENV: 'production',
      },
    },
    {
      name: 'app-green',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      env: {
        PORT: 3001,
        NODE_ENV: 'production',
      },
    },
  ],
}