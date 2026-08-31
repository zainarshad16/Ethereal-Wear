const https = require('https');

https.get('https://storebyhamama.com/', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => {
    const regex = /\/\/[a-zA-Z0-9\-\.\/]+\.(?:jpg|jpeg|png|webp)/gi;
    const matches = data.match(regex) || [];
    const unique = [...new Set(matches)];
    console.log(unique.slice(0, 15).join('\n'));
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
