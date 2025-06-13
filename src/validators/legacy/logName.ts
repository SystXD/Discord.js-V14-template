import { LegacyValidatorProps } from "@utils/types";
import { Xantrack } from "@core/utils/client";
export default async function loadUserName({
  message,
  next,
}: LegacyValidatorProps) {
  const client = message.client as Xantrack;
  client.logger.info(
    `${message.content.toLowerCase().split(" ")[0]} has been executed by ${
      message.author.username
    } at ${message.guild.name}`,
  );
  next();
}
