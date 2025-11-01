const { spawn } = require('child_process');
const net = require('net');

// Function to check if port is available
function isPortAvailable(port) {
    return new Promise((resolve) => {
        const server = net.createServer();
        
        server.listen(port, (err) => {
            if (err) {
                resolve(false);
            } else {
                server.once('close', () => resolve(true));
                server.close();
            }
        });
        
        server.on('error', () => resolve(false));
    });
}

// Function to find available port starting from 3000
async function findAvailablePort(startPort = 3000) {
    for (let port = startPort; port <= startPort + 100; port++) {
        if (await isPortAvailable(port)) {
            return port;
        }
    }
    throw new Error('No available ports found in range');
}

// Main function
async function startServer() {
    try {
        console.log('🔍 Finding available port...');
        const availablePort = await findAvailablePort(3000);
        
        console.log(`✅ Found available port: ${availablePort}`);
        console.log('🚀 Starting server...\n');
        
        // Set environment variables and start server
        const env = { ...process.env, PORT: availablePort.toString() };
        const serverProcess = spawn('node', ['server.js'], { 
            stdio: 'inherit', 
            env: env,
            shell: true 
        });
        
        // Handle process termination
        process.on('SIGINT', () => {
            console.log('\n🛑 Stopping server...');
            serverProcess.kill('SIGTERM');
            process.exit(0);
        });
        
        serverProcess.on('close', (code) => {
            console.log(`\n📝 Server process exited with code ${code}`);
            process.exit(code);
        });
        
    } catch (error) {
        console.error('❌ Error starting server:', error.message);
        process.exit(1);
    }
}

startServer();