import { IUserPayload } from "../../types";
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
export declare const generateTokenPair: (payload: IUserPayload) => TokenPair;
export declare const verifyAccessToken: (token: string) => IUserPayload;
export declare const verifyRefreshToken: (token: string) => {
    _id: string;
};
export declare const REFRESH_COOKIE_OPTIONS: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "strict";
    maxAge: number;
    path: string;
};
//# sourceMappingURL=jwt.service.d.ts.map