async function testWandbox() {
    try {
        const response = await fetch('https://wandbox.org/api/compile.json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                compiler: 'python-head',
                code: 'print("hello from wandbox")'
            })
        });
        console.log("STATUS:", response.status);
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("ERROR", err.message);
    }
}
testWandbox();
