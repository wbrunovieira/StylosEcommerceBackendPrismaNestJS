import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtAuthGuard } from "./jwt-auth.guard";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private jwtAuthGuard: JwtAuthGuard
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const roles = this.reflector.get<string[]>(
            "roles",
            context.getHandler()
        );

        console.log("Roles required for this route:", roles);

        if (!roles) {
            return true;
        }

        const canActivate = await this.jwtAuthGuard.canActivate(context);
        if (!canActivate) {
          console.log("JwtAuthGuard denied the request");
            return false;
        }

        const request = context.switchToHttp().getRequest();
   
        const user = request.user;
        console.log("User in RolesGuard:", user);

        return roles.includes(user.role);
    }
}
