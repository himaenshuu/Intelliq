const { spawn } = require('child_process');
const path = require('path');

// Get the path to npm
const npmPath = process.platform === 'win32' ? 'npm.cmd' : 'npm';

// Start backend server
const backend = spawn('node', ['server.js'], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' }
});

// Start frontend server
const frontend = spawn(npmPath, ['start'], {
    stdio: 'inherit',
    cwd: path.join(__dirname, 'client'),
    shell: true
});

// Handle process termination
process.on('SIGINT', () => {
    backend.kill();
    frontend.kill();
    process.exit();
});

// Handle errors
backend.on('error', (err) => {
    console.error('Backend server error:', err);
});

frontend.on('error', (err) => {
    console.error('Frontend server error:', err);
    console.error('Make sure you have run "npm install" in the client directory');
}); 