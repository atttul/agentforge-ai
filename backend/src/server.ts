import app from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { connectDatabase } from "./config/database";

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(env.PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    logger.error(error);

    process.exit(1);
  }
};

startServer();