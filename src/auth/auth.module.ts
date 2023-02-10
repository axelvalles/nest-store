import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { UsersModule } from '../users/users.module';
import { AuthService } from './services/auth.service';
import { LocalStategy } from './strategies/local.strategy';
import { AuthController } from './controllers/auth.controller';
import config from '../config';
import { ConfigType } from '@nestjs/config';
import { JwtStategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [config.KEY],
      useFactory: (configService: ConfigType<typeof config>) => {
        return {
          secret: configService.jwtSecret,
          signOptions: {
            expiresIn: '10d',
          },
        };
      },
    }),
  ],
  providers: [AuthService, LocalStategy, JwtStategy],
  controllers: [AuthController],
})
export class AuthModule {}
