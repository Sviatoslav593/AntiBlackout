// Script to install email service dependencies
const { execSync } = require("child_process");

console.log("📦 Installing email service dependencies...");

try {
  // Install dotenv for environment variables
  execSync("npm install dotenv", { stdio: "inherit" });
  console.log("✅ dotenv installed");

  // Install @types/node for TypeScript support
  execSync("npm install --save-dev @types/node", { stdio: "inherit" });
  console.log("✅ @types/node installed");

  console.log("🎉 All dependencies installed successfully!");
  console.log("");
  console.log("Next steps:");
  console.log("1. Add RESEND_API_KEY to your .env.local file");
  console.log("2. Get your API key from https://resend.com");
  console.log("3. Restart your development server");
  console.log("4. Test with: node test-email-service.js");
} catch (error) {
  console.error("❌ Error installing dependencies:", error.message);
}
