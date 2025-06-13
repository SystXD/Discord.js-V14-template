import { ChatInputCommandInteraction, GuildMember, Message } from "discord.js";
import { Command } from "@utils/command";
import { Xantrack } from "@utils/client";

/**The ChatInput Validator */

type ValidatorCTX = {
  interaction: ChatInputCommandInteraction;
  next: () => unknown | Promise<unknown>;
  JSON: Command<"ChatInput">["data"];
};

type Validator = (ctx: ValidatorCTX) => unknown | Promise<unknown>;

interface HandleValidatorOptions {
  interaction: ChatInputCommandInteraction;
  command: Command<"ChatInput">;
}

export const loadSlashValidators = async ({
  interaction,
  command,
}: HandleValidatorOptions): Promise<void> => {
  const client = interaction.client as Xantrack;
  const validators = [...client.slashValidators.values()].flat() as Validator[];

  if (!Array.isArray(validators)) {
    console.error("\x1b[91m", "No middleware functions found.");
    return;
  }

  let index = 0;

  const next = async (): Promise<void> => {
    if (index >= validators.length) return;

    const validator = validators[index++];
    if (typeof validator !== "function") {
      client.logger.warn(
        `Validator at index ${index - 1} is not a function. Skipping.`,
      );
      return next();
    }

    try {
      await validator({
        interaction,
        next,
        JSON: command.data,
      });
    } catch (err) {
      client.logger.error(`Middleware error:\n`, err);
      interaction.replied || interaction.deferred
        ? interaction.followUp({
            content: "Command execution failed. Please retry.",
            ephemeral: true,
          })
        : interaction.reply({
            content: "Command execution failed. Please retry.",
            ephemeral: true,
          });
    }
  };

  try {
    await next();
    if (index === validators.length) {
      await command.run(
        interaction as ChatInputCommandInteraction<"cached">,
        client,
      );
    }
  } catch (err) {
    client.logger.error(`Unable to execute validator`, err);
  }
};

/**The legacy Validator */

interface OptionsParser {
  parse: (name: string) => string | number | boolean | GuildMember | undefined;
}

interface LegacyMiddlewareProps {
  message: Message<true>;
  command: Command<"Legacy">;
  args: string[];
  options: OptionsParser;
}

export const loadLegacyValidators = async ({
  message,
  command,
  args,
  options,
}: LegacyMiddlewareProps): Promise<void> => {
  const client = message.client as Xantrack;

  const validators = Array.from(client.legacyValidators.values()).flat();
  const legacyValidators = validators.filter((fn) => typeof fn === "function");

  let index = 0;

  async function runValidator(): Promise<void> {
    if (index >= legacyValidators.length) {
      try {
        await command.run(message, args, options);
      } catch (error) {
        client.logger.error(`Error executing command:`, error);
      }
      return;
    }

    const validator = legacyValidators[index];
    if (!validator) {
      client.logger.warn(`Skipped undefined validator at index ${index}`);
      index++;
      return runValidator();
    }

    try {
      await validator({
        message,
        args,
        next,
        JSON: command["data"],
      });
    } catch (error) {
      client.logger.error(
        `Legacy validator at index ${index} threw an error:`,
        error,
      );
    }
  }

  async function next(): Promise<void> {
    index++;
    await runValidator();
  }

  await runValidator();
};
