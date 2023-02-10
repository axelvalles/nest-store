import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';

import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/services/users.service';
import { PayloadToken } from '../models/token.model';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      return null;
    }

    const isMatch = await compare(password, user.password);

    if (!isMatch) {
      return null;
    }

    return user;
  }

  generateJwt(user: User) {
    const payload: PayloadToken = { role: user.role, sub: user.id };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
