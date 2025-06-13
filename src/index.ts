import { Xantrack } from "@utils/client";
import { GatewayIntentBits } from "discord.js";
import path from "path";

import "module-alias/register";
import "dotenv/config";

const client = new Xantrack({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

client.start(process.env.TOKEN!, {
  commandDir: path.join(__dirname, "commands", "slash"),
  legacyDir: path.join(__dirname, "commands", "legacy"),
  eventDir: path.join(__dirname, "events"),
  slashValidator: path.join(__dirname, "validators", "slash"),
  legacyValidator: path.join(__dirname, "validators", "legacy"),
});
