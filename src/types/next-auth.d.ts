import { DefaultSession } from "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
    interface Session {
        user: {
            email?: string
            inviteCode?: string
            uid: string
            username?: string
            accessToken: string
        } & DefaultSession["user"]
    }
    interface User {
        username: string;
        wallet: string;
        token: string;
        inviteCode: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string
    }
}