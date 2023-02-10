import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { ROLES_KEY } from '../decorators/roles.docorator';
import { Role } from '../models/roles.model';
import { PayloadToken } from '../models/token.model';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<Role[]>(ROLES_KEY, context.getHandler());
    // ['admin', 'customer']

    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as PayloadToken;
    // token  => {role: 'admin', sub: 1212}
    const isAuth = roles.some((role) => role === user.role);
    if (!isAuth) {
      throw new ForbiddenException("Your role don't have permissions")
    }
    return isAuth
  }
}
