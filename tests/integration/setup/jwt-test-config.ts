import type { StringValue } from 'ms';

export const jwtTestConfig = {
  accessSecret: "integration-test-secret",
  expiresIn: "3min" as StringValue
};