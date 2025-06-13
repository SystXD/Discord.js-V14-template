import { connect } from "mongoose";
import { logger } from "@utils/utils";
import "dotenv/config";
export const MongoConnect = async () => {
  try {
    const connected = await connect(process.env.DB_URI!);
    logger.info(`Mongo Connected With Host: ${connected.connection.host}`);
  } catch (error) {
    logger.error("Mongo Connection Error", error);
    process.exit(1);
  }
};
