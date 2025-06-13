import { ChatInputCommandInteraction } from "discord.js";
import { Xantrack } from "@utils/client";
import { loadSlashValidators } from "@utils/middlewareHandlers";

export default async function handleCommandInteraction(
  interaction: ChatInputCommandInteraction,
) {
  const client = interaction.client as Xantrack;
  if (!interaction.inCachedGuild() || !interaction.isChatInputCommand()) return;

  const command = client.slashCommands.get(interaction.commandName);
  if (!command) {
    interaction.reply({
      content:
        "Command could not be resolved. This might be a temporary issue.",
      flags: "Ephemeral",
    });
    return client.logger.error(`Command not found: ${interaction.commandName}`);
  }

  try {
    loadSlashValidators({ interaction, command });
  } catch (error) {
    client.logger.error(
      `Unable to execute command ${interaction.commandName}`,
      error,
    );
  }
}
