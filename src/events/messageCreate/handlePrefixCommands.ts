import { ApplicationCommandOptionType, Message } from "discord.js";
import { Prefix } from "@core/models/prefix.model";
import { Xantrack } from "@core/utils/client";
import { Command } from "@core/utils/command";
import { loadLegacyValidators } from "@utils/middlewareHandlers";

export default async function handlePrefixCommands(message: Message) {
  if (!message.inGuild() || !message.member) return;

  const defaultPrefix = "x!";
  const prefixDocs = await Prefix.findOne({ guildId: message.guild.id });

  const prefixes = prefixDocs?.prefix ?? [defaultPrefix];
  if (!prefixes.includes(defaultPrefix)) prefixes.push(defaultPrefix);

  const matchedPrefix = prefixes.find((p) =>
    message.content.toLowerCase().startsWith(p),
  );
  if (!matchedPrefix) return;

  const args = message.content.slice(matchedPrefix.length).trim().split(/\s+/);
  const cmd = args.shift()?.toLowerCase();
  if (!cmd) return;

  const client = message.client as Xantrack;
  const command = client.legacyCommands.get(cmd) as Command<"Legacy">;

  if (!command) {
    if (client.slashCommands.has(cmd)) {
      message.reply({
        content: `Whoops! Use **/${cmd}** to continue.`,
      });
      return;
    }
    return;
  }

  if (command.data.permission?.length) {
    const hasPermission = message.member?.permissions.has(
      command.data.permission,
    );
    if (!hasPermission) {
      message
        .reply({
          content: `You need **${command.data.permission[0]}** permission to use this command.`,
        })
        .catch(() => null);
      return;
    }
  }
  const options = {
    parse: (name: string) => {
      const optionIndex = command.data.options?.findIndex(
        (o) => o.name === name,
      );
      if (
        !args.length ||
        !command.data.options?.length ||
        optionIndex === undefined ||
        optionIndex < 0
      )
        return;

      const option = command.data.options[optionIndex];
      const arg = args[optionIndex];
      if (!option || arg === undefined) return;

      switch (option.type) {
        case ApplicationCommandOptionType.User:
          return (
            message.mentions.members.at(optionIndex) ??
            message.guild.members.cache.get(arg)
          );

        case ApplicationCommandOptionType.Number: {
          const num = Number(arg);
          return isNaN(num) ? undefined : num;
        }

        case ApplicationCommandOptionType.String:
          return arg;

        case ApplicationCommandOptionType.Boolean:
          if (arg.toLowerCase() === "true") return true;
          if (arg.toLowerCase() === "false") return false;
          return undefined;

        default:
          return;
      }
    },
  };

  try {
    await loadLegacyValidators({ message, command, args, options });
  } catch (error) {
    client.logger.error(`Unable to execute ${cmd}`, error);
  }
}
