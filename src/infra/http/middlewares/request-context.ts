import { randomUUID } from "node:crypto";
import { requestContext } from "@/infra/observability/request-context/request-context"; 

export function requestContextMiddleware(req: any, res: any, next: any) {
    const requestId = req.headers["x-request-id"] || randomUUID();
    res.setHeader("X-Request-Id", requestId);
    requestContext.run({ requestId }, () => next());
}
