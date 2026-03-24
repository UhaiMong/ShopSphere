import jwt from "jsonwebtoken";
import { env } from "../../config/env.config";
import { IUserPayload } from "../../types";

// Token Types
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

//  generateTokenPair

// Access token: short-lived (15m)
// Refresh token: long-lived (7d), sent as httpOnly cookie

export const generateTokenPair = (payload: IUserPayload): TokenPair => {
  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRE,
  } as jwt.SignOptions);

  const refreshToken = jwt.sign({ _id: payload._id }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRE,
  } as jwt.SignOptions);

  return { accessToken, refreshToken };
};

// verifyAccessToken
export const verifyAccessToken = (token: string): IUserPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as IUserPayload;
};

// verifyRefreshToken
export const verifyRefreshToken = (token: string): { _id: string } => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as { _id: string };
};

// Cookie options for refresh token
export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/api/v1/auth",
};
