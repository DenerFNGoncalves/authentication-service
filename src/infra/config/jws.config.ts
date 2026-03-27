import { SECURITY } from "./env";

export type JWSConfig = {
  accessSecret: string;
}

export function loadJWSConfig(): JWSConfig {
  return Object.freeze({
    accessSecret: SECURITY.JWT_ACCESS_SECRET
  });
}
