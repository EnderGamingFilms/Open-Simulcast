const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const services = require('../services/services.js');

function generatePushConfig(service) {
    return `push rtmp://127.0.0.1:${service.port}/app;`;
}

async function generateNginxConfig() {
    const templateFilePath = process.env.RTMP_CONFIG_PATH || path.join(__dirname, '../../../local/containers');
    const configFilePath = '/etc/nginx/nginx.conf';

    // Load the template NGINX config
    const templateConfig = fs.readFileSync(templateFilePath, 'utf-8');

    // Generate a push config line for each service
    const pushConfigs = services.data.map(generatePushConfig).join('\n            ');

    // Replace the placeholder with the generated config lines
    const newConfig = templateConfig.replace('#PUSH_HERE', pushConfigs);

    // Write the new config to the actual config file
    fs.writeFileSync(configFilePath, newConfig, 'utf-8');

    // Reload NGINX
    reloadNginx();
}

function reloadNginx() {
    // Use the appropriate command for your system to reload NGINX
    // This command may differ based on your OS
    exec("sudo nginx -s reload", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }

        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }

        if (stdout) {
            console.log(`stdout: ${stdout}`);
        }
    });
}

module.exports = {
    generateNginxConfig
};
