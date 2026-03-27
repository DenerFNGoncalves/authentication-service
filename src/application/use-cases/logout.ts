import type { LoginService, Credentials } from "../services/login";
import type { SessionService } from "../services/session";
import type { AccessTokenGenerator } from "../ports/access-token-generator";
 
import type { AuthenticatedSession } from "../dtos/authenticated-session";

export class LogoutUseCase {
    constructor(
        private readonly loginService: LoginService,
        private readonly sessionService: SessionService,
        private readonly accessTokenService: AccessTokenGenerator,
    ) {};
    

    async execute(credentials: Credentials): Promise<AuthenticatedSession> {
        const user = await this.loginService.validate(credentials);
        const session = await this.sessionService.create(user.id);

        const accessToken = this.accessTokenService.createAccessToken(user.id, session.sessionId);
        
        return {
            accessToken,
            refreshToken: session.refreshToken
        };
    } 
}