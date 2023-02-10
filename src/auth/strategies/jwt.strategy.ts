import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import config from 'src/config';
import { PayloadToken } from '../models/token.model';

import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtStategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private authService: AuthService,
    @Inject(config.KEY) configService: ConfigType<typeof config>,
  ) {
    super({
      // OBTENDREMOS EL TOKEN LOS HEADERS COMO 'Bearer token'
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // IGNORA LA EXPIRACION
      ignoreExpiration: false,
      // LA LLAVE SECRETA CON LA QUE FIRMAMOS EL TOKEN AL HACER LOGIN
      secretOrKey: configService.jwtSecret,
    });
  }

  async validate(payload: PayloadToken) {
    return payload;
  }
}
