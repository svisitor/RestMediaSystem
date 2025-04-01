/* 
  This script runs the test data insertion script with tsx
*/

const { spawn } = require('child_process');
const path = require('path');

// Path to the seed script
const scriptPath = path.join(__dirname, 'insert-test-data.ts');

// Run the seed script with tsx
const child = spawn('npx', ['tsx', scriptPath], {
  stdio: 'inherit',
  shell: true
});

child.on('close', (code) => {
  console.log(`Script exited with code ${code}`);
  process.exit(code);
});