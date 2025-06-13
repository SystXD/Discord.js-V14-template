import {
  Message,
  ApplicationCommandOptionType,
  RESTPostAPIApplicationCommandsJSONBody,
  ChatInputCommandInteraction,
  GuildMember,
  PermissionFlagsBits,
} from "discord.js";
import { Xantrack } from "@utils/client";

interface Utils {
  category: string;
  cooldown?: number;
  guilds?: string[];
}

interface LegacyJSONBody {
  name: string;
  description: string;
  permission?: keyof typeof PermissionFlagsBits;
  category: string;
  cooldown?: number;
  options?: LegacyOptions[];
}

interface LegacyOptions {
  name: string;
  type: ApplicationCommandOptionType;
}

type CommandType = "ChatInput" | "Legacy";

type CommandDataType<T extends CommandType> = T extends "ChatInput"
  ? RESTPostAPIApplicationCommandsJSONBody
  : LegacyJSONBody;

type CommandExecutorType<T extends CommandType> = T extends "ChatInput"
  ? (
      interaction: ChatInputCommandInteraction<"cached">,
      client: Xantrack,
    ) => unknown | Promise<unknown>
  : (
      message: Message<true>,
      args: string[],
      options: {
        parse: (
          name: string,
        ) => string | number | boolean | GuildMember | undefined;
      },
    ) => unknown | Promise<unknown>;

export class Command<T extends CommandType> {
  public readonly data: CommandDataType<T>;
  public readonly utils: Utils;
  public readonly run: CommandExecutorType<T>;

  constructor(
    def: {
      data: CommandDataType<T>;
      run: CommandExecutorType<T>;
    },
    utils: Utils,
  ) {
    this.data = def.data;
    this.run = def.run;
    this.utils = utils;
  }
}
