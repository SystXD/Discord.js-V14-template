import { model, Schema } from "mongoose";
export const Prefix = model(
  "Prefix",
  new Schema(
    {
      guildId: {
        type: String,
        required: true,
        index: true,
      },
      prefix: {
        type: [String],
        default: ["x!"],
      },
    },
    { timestamps: true },
  ),
);
