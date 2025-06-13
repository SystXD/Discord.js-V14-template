import {
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from "discord.js";
import { Command } from "@utils/command";
import { logger } from "@utils/utils";
import { Xantrack } from "@utils/client";

export default async function registerCommands(client: Xantrack) {
  const rest = new REST().setToken(process.env.TOKEN!);

  const globalCommands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
  const guildCommandMap = new Map<
    string,
    RESTPostAPIChatInputApplicationCommandsJSONBody[]
  >();

  const allCommands = [
    ...client.slashCommands.values(),
  ] as Command<"ChatInput">[];

  for (const command of allCommands) {
    if (command.utils.guilds && Array.isArray(command.utils.guilds)) {
      for (const guildId of command.utils.guilds) {
        const list = guildCommandMap.get(guildId) ?? [];
        list.push(
          command.data as RESTPostAPIChatInputApplicationCommandsJSONBody,
        );
        guildCommandMap.set(guildId, list);
      }
    } else {
      globalCommands.push(
        command.data as RESTPostAPIChatInputApplicationCommandsJSONBody,
      );
    }
  }

  if (globalCommands.length > 0) {
    try {
      await rest.put(Routes.applicationCommands(client.user!.id), {
        body: globalCommands,
      });
      logger.success(`Registered ${globalCommands.length} global command(s).`);
    } catch (err) {
      logger.error("Unable to register global commands", err);
    }
  }

  for (const [guildId, commands] of guildCommandMap.entries()) {
    try {
      await rest.put(
        Routes.applicationGuildCommands(client.user!.id, guildId),
        { body: commands },
      );
      logger.success(
        `Registered ${commands.length} guild command(s) for ${guildId}.`,
      );
    } catch (err) {
      logger.error(`Failed to register commands for guild ${guildId}:`, err);
    }
  }
}
