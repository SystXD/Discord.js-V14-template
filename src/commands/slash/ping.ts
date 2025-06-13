import { Command } from "@utils/command";

export default new Command<"ChatInput">(
  {
    data: { name: "ping", description: "Fetch the latency of bot" },

    run(interaction, client) {
      interaction.reply({
        content: `**Pong**: ${client.ws.ping}ms 🏓`,
        flags: "Ephemeral",
      });
    },
  },
  { category: "misc" },
);
