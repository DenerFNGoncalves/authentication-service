import type { Logger } from "@/application/ports/logger";
import { getRequestInfo } from "@/infra/observability/request-context/utils"
import pino from "pino"

export class PinoLogger implements Logger {

    private instance: pino.Logger;

    constructor(config: pino.LoggerOptions) {
        this.instance = pino({
            ...config,
            formatters: {
                level(label, _) {
                    return { level: label };
                },
            }
        });
    }

    public trace(message: string, meta?: object) {
        const requestInfo = getRequestInfo();
        this.instance.trace({ ...requestInfo, ...meta }, message)
    }

    public debug(message: string, meta?: object) {
        const requestInfo = getRequestInfo();
        this.instance.debug({ ...requestInfo, ...meta }, message)
    }

    public info(message: string, meta?: object) {
        const requestInfo = getRequestInfo();
        this.instance.info({ ...requestInfo, ...meta }, message)
    }

    public warn(message: string, meta?: object) {
        const requestInfo = getRequestInfo();
        this.instance.warn({ ...requestInfo, ...meta }, message)
    }

    public error(message: string, meta?: object) {
        const requestInfo = getRequestInfo();
        this.instance.error({ ...requestInfo, ...meta }, message)
    }

    public fatal(message: string, meta?: object) {
        const requestInfo = getRequestInfo();
        this.instance.fatal({ ...requestInfo, ...meta }, message)
    }

}