/**
 * Cloudflare Email Worker — educonnectchina.com
 *
 * Handles incoming emails to educonnectchina.com and forwards them
 * to the destination address. Also supports sending via SEND_EMAIL binding.
 *
 * To deploy: npx wrangler deploy --config wrangler-email.toml
 */

export default {
  async email(message, env, ctx) {
    console.log(`[educonnectchina.com] Received email from ${message.from} to ${message.to} | Subject: ${message.headers.get("subject") || "(no subject)"}`);

    try {
      // Forward the incoming email to a destination address
      const forwardTo = env.FORWARD_TO_EMAIL || "jamesedpares@gmail.com";
      await message.forward(forwardTo);
      console.log(`Forwarded email to ${forwardTo}`);

      // Send a notification using the send_email binding
      await env.SEND_EMAIL.send({
        from: message.to,
        to: forwardTo,
        subject: `New email received from ${message.from}`,
        text: `You received a new email from ${message.from} to ${message.to}. Subject: ${message.headers.get("subject") || "(no subject)"}`,
      });
      console.log(`Sent notification email to ${forwardTo}`);
    } catch (err) {
      console.error("Email handling failed:", err);
      throw err;
    }
  }
};
