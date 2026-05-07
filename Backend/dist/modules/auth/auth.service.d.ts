import { IUserPayload } from '../../types';
import { TokenPair } from './jwt.service';
import { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput, ChangePasswordInput } from './auth.validator';
export declare const authService: {
    register(input: RegisterInput): Promise<{
        message: string;
    }>;
    login(input: LoginInput): Promise<{
        user: Partial<IUserPayload>;
        tokens: TokenPair;
    }>;
    refreshTokens(incomingRefreshToken: string): Promise<TokenPair>;
    logout(userId: string, refreshToken: string): Promise<void>;
    logoutAll(userId: string): Promise<void>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    forgotPassword(input: ForgotPasswordInput): Promise<{
        message: string;
    }>;
    resetPassword(input: ResetPasswordInput): Promise<{
        message: string;
    }>;
    changePassword(userId: string, input: ChangePasswordInput): Promise<{
        message: string;
    }>;
    getMe(userId: string): Promise<Partial<import("../../types").IUser>>;
    resendVerificationEmail(userId: string): Promise<{
        message: string;
    }>;
};
//# sourceMappingURL=auth.service.d.ts.map