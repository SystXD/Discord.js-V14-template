import { ChatInputCommandInteraction, GuildMember, Message } from "discord.js";
import { Command } from "@utils/command";

export interface OptionsParser {
  parse: (name: string) => string | number | boolean | GuildMember | undefined;
}

export type ChatInputValidator = (ctx: {
  interaction: ChatInputCommandInteraction;
  next: () => unknown | Promise<unknown>;
  JSON: Command<"ChatInput">["data"];
}) => unknown | Promise<unknown>;

export type LegacyValidator = (ctx: {
  message: Message<true>;
  args: string[];
  next: () => Promise<void>;
  JSON: Command<"Legacy">["data"];
}) => unknown | Promise<unknown>;

export interface ChatInputValidatorProps {
  interaction: ChatInputCommandInteraction;
  next: () => unknown | Promise<unknown>;
  JSON: Command<"ChatInput">["data"];
}

export interface LegacyValidatorProps {
  message: Message<true>;
  args: string[];
  next: () => Promise<void>;
  JSON: Command<"Legacy">["data"];
}
