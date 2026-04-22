import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      naverid?: string;
      isNewUser?: boolean;
      needsLinking?: boolean;
      userId?: number;
      role?: string;
    };
  }

  interface User {
    naverid?: string;
    isNewUser?: boolean;
    needsLinking?: boolean;
    userId?: number;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    naverId?: string;
    isNewUser?: boolean;
    needsLinking?: boolean;
    userId?: number;
    email?: string;
    role?: string;
  }
}
