import type { LoginService, Credentials } from "../services/login";
import type { SessionService } from "../services/session";
import type { AccessTokenGenerator } from "../ports/access-token-generator";
 
import type { AuthenticatedSession } from "../dtos/authenticated-session";
import type { Logger } from "../ports/logger";

export class LoginUseCase {
    constructor(
        private readonly logger: Logger,
        private readonly loginService: LoginService,
        private readonly sessionService: SessionService,
        private readonly accessTokenService: AccessTokenGenerator,
    ) {};
    

    async execute(credentials: Credentials): Promise<AuthenticatedSession> {
        this.logger.info("Login attempt", {
            event: "auth.login",
            stage: "attempt",
            email: credentials.email,
        });

        const user = await this.loginService.validate(credentials);
        const session = await this.sessionService.create(user.id);

        const accessToken = this.accessTokenService.createAccessToken(user.id, session.sessionId);
        
        this.logger.info("Login successful", {
            event: "auth.login",
            result: "success",
            userId: user.id,
            sessionId: session.sessionId,
        });
        
        return {
            accessToken,
            refreshToken: session.refreshToken
        };
    } 
}