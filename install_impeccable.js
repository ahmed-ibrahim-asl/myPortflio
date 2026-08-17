const { spawn } = require('child_process');
const p = spawn('npx', ['-y', 'impeccable', 'install'], { shell: true });
let output = '';

p.stdout.on('data', (d) => {
  const text = d.toString();
  process.stdout.write(text);
  output += text;
  
  if (output.includes('Customize [1]:') && !output.includes('sent-2')) {
    output += 'sent-2';
    p.stdin.write('2\n');
  }
  if (output.includes('Select harnesses') && !output.includes('sent-gemini')) {
    output += 'sent-gemini';
    p.stdin.write('gemini\n');
  }
  if (output.includes('Install location') && !output.includes('sent-location')) {
    output += 'sent-location';
    p.stdin.write('\n');
  }
});
p.stderr.on('data', (d) => process.stderr.write(d.toString()));
p.on('close', (code) => console.log('Process exited with code', code));
