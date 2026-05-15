const fs = require('fs');

fetch('http://localhost:5000/api/v1/products', {
  method: 'POST',
  headers: {
    'Cookie': 'accessToken=DUMMY_TOKEN', // Might fail auth, let's see what happens
  }
}).then(async res => {
  const text = await res.text();
  fs.writeFileSync('scratch_result.txt', text);
  console.log(text);
}).catch(console.error);
