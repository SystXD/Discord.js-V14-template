import { ChatInputValidatorProps } from "@utils/types";
import { Xantrack } from "@core/utils/client";
export default async function loadUserName({
  interaction,
  next,
}: ChatInputValidatorProps) {
  const client = interaction.client as Xantrack;
  client.logger.info(
    `${interaction.commandName} has been executed by ${interaction.user.username} at ${interaction.guild?.name}`,
  );
  next();
}
