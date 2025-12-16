import https from 'https';

console.log("🌐 Your current public IP address:");
console.log("📡 IP: 159.41.78.158");
console.log("\n💡 Steps to whitelist in MongoDB Atlas:");
console.log("1. Go to https://cloud.mongodb.com");
console.log("2. Select your cluster (DECCM)");
console.log("3. Click 'Network Access' in left sidebar");
console.log("4. Click 'Add IP Address'");
console.log("5. Enter: 159.41.78.158");
console.log("6. Click 'Confirm'");
console.log("7. Wait 1-3 minutes for changes to take effect");
console.log("\n🔗 Direct link (if logged in):");
console.log("https://cloud.mongodb.com/v2#/security/network/accessList");

// Optional: Get your current IP from a service
https.get('https://api.ipify.org?format=json', (resp) => {
  let data = '';
  resp.on('data', (chunk) => data += chunk);
  resp.on('end', () => {
    const ipInfo = JSON.parse(data);
    console.log(`\n✅ Confirmed IP from external service: ${ipInfo.ip}`);
  });
}).on('error', (err) => {
  console.log("⚠️  Could not verify IP from external service");
});