import { SECURITY } from "./env";
import type { StringValue } from "ms";

export interface SessionConfig {
  creationAttempts: number;
  accessTokenTtl: StringValue;
  refreshTokenTtl: StringValue;
  absoluteSessionTtl?: StringValue;
  rotationEnabled: boolean;
  slidingEnabled: boolean;
}

export function loadSessionConfig(): SessionConfig {
  const absoluteSessionTtl = SECURITY.SESSION.ABSOLUTE_SESSION_TTL 
    ? (SECURITY.SESSION.ABSOLUTE_SESSION_TTL as StringValue) 
    : undefined;

  const creationAttempts = SECURITY.SESSION.SESSION_CREATION_ATTEMPTS ? parseInt(SECURITY.SESSION.SESSION_CREATION_ATTEMPTS) : 3;
  
  return Object.freeze({
    creationAttempts,
    accessTokenTtl: SECURITY.SESSION.ACCESS_TOKEN_TTL as StringValue,
    refreshTokenTtl: SECURITY.SESSION.REFRESH_TOKEN_TTL as StringValue,
    rotationEnabled: SECURITY.SESSION.SESSION_ROTATION_ENABLED,
    slidingEnabled: SECURITY.SESSION.SESSION_SLIDING_ENABLED,
    ...(absoluteSessionTtl && { absoluteSessionTtl }),   
  });
}