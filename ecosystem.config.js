module.exports = {
    apps: [
        {
            name: 'app',
            script: './index.js',
            watche: true,
            env: {
                NODE_ENV: 'development',
            },
            env_production: {
                NODE_ENV: 'production',
            },
            env_preprod: {
                NODE_ENV: 'preprod',
            },
            env_stage: {
                NODE_ENV: 'stage',
            },

        },
    ],
};
