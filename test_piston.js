const fetch = require('node-fetch'); // or use built in fetch if node >= 18

async function testPiston() {
    try {
        const response = await fetch('https://emacs.piston.rs/api/v2/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                language: 'python',
                version: '3.10.0',
                files: [{ content: 'print("hello piston")' }]
            })
        });
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("ERROR", err);
    }
}
testPiston();
