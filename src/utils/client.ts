import {
  Client,
  ClientOptions,
  ChatInputCommandInteraction,
  Message,
  Collection,
} from "discord.js";
import fs from "fs";
import path from "path";
import { getFiles, logger } from "@utils/utils";
import { Command } from "@utils/command";
import { ChatInputValidator, LegacyValidator } from "@utils/types";
import { MongoConnect } from "@core/db";

type validatorCase = "slashValidators" | "legacyValidators";
type commandCase = "ChatInput" | "Legacy";
export class Xantrack extends Client {
  constructor(options: ClientOptions) {
    super(options);
  }

  logger = logger;
  slashCommands = new Collection<string, Command<"ChatInput">>();
  legacyCommands = new Collection<string, Command<"Legacy">>();
  slashValidators = new Collection<string, ChatInputValidator[]>();
  legacyValidators = new Collection<string, LegacyValidator[]>();
  /**
   *  Each subfolder represents an event name (like `ready`, `messageCreate`), and all files inside
   * are treated as handlers for that event.
   * @param dir - The root directory containing event folders.
   */
  loadEvents(dir: string) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach((folders) => {
      const folderPath = path.join(dir, folders.name);
      const eventName = folders.name;
      this.on(eventName, async (...args) => {
        for (const file of fs
          .readdirSync(folderPath, { withFileTypes: true })
          .filter((f) => f.isFile())) {
          const filePath = path.join(folderPath, file.name);
          const event = require(filePath)?.default;
          try {
            await event(...args);
            logger.success(`Loaded ${eventName}`);
          } catch (error) {
            logger.error(`Unable to load ${eventName}`, error);
          }
        }
      });
    });
  }

  loadCommands(dir: string, action: commandCase) {
    const files = getFiles(dir, true);
    for (const file of files) {
      const command = require(file.filePath)?.default;
      if (!command) {
        logger.warn(
          `"${file.fileName}" skipped — no default export found or invalid object.`
        );
        continue;
      }

      if (!(command instanceof Command)) {
        logger.warn(
          `"${file.fileName}" is not a valid Command instance, skipping.`
        );
        continue;
      }

      action === "ChatInput"
        ? this.slashCommands.set(command.data.name, command)
        : this.legacyCommands.set(command.data.name, command);
    }
  }

  loadValidator(dir: string, action: validatorCase) {
    const files = getFiles(dir, true);
    for (const file of files) {
      const validator = require(file.filePath)?.default;
      if (!validator) {
        logger.warn(
          `"${file.fileName}" skipped — no default export found or invalid object.`
        );
        continue;
      }

      action === "slashValidators"
        ? this.slashValidators.set(validator.data.name, validator)
        : this.legacyValidators.set(validator.data.name, validator);
    }

    logger.success(`Loaded ${files.length} ${action} Validators`);
  }
  async start(
    token = process.env.TOKEN,
    {
      commandDir,
      legacyDir,
      eventDir,
      slashValidator,
      legacyValidator,
    }: {
      commandDir: string;
      legacyDir: string;
      eventDir: string;
      slashValidator: string;
      legacyValidator: string;
    }
  ) {
    await MongoConnect();
    this.login(token);
    this.loadCommands(commandDir, "ChatInput");
    this.loadCommands(legacyDir, "Legacy");
    this.loadEvents(eventDir);
    this.loadValidator(slashValidator, "slashValidators");
    this.loadValidator(legacyValidator, "legacyValidators");
  }
}
