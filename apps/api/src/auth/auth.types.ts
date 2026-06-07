export type Role = "viewer" | "operator" | "admin";

export interface AuthUser {
  id: string;
  roles: Role[];
}

export interface JwtPayload {
  sub: string;
  roles: Role[];
  iat?: number;
  exp?: number;
}
