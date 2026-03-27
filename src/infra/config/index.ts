
import { loadJWSConfig } from "./jws.config";
import { loadSessionConfig } from "./session.config";
import { loadLoggerConfig } from "./logger.config";
import { loadServerConfig } from "./server.config";

export const config = {
  jws: loadJWSConfig(),
  logger: loadLoggerConfig(),
  session: loadSessionConfig(),
  server: loadServerConfig()
}