/**
 * Cloudflare Email Worker — educonnectchina.com
 *
 * Handles incoming emails to educonnectchina.com and forwards them
 * to the destination address. Also supports sending via SEND_EMAIL binding.
 *
 * To deploy: npx wrangler deploy src/email-worker.js
 */

export default {
  async email(message, env, ctx) {
    console.log(`[educonnectchina.com] Received email from ${message.from} to ${message.to} | Subject: ${message.headers.get("subject") || "(no subject)"}`);

    try {
      const forwardTo = env.FORWARD_TO_EMAIL || "jamesedpares@gmail.com";
      await message.forward(forwardTo);
      console.log(`Forwarded email to ${forwardTo}`);
    } catch (err) {
      console.error("Email forwarding failed:", err);
      throw err;
    }
  }
};
