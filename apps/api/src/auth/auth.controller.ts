import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { CurrentUser } from "./current-user.decorator";
import { LoginRequestDto, ChangePasswordDto } from "./dto/login.dto";
import type { AuthUser } from "./auth.types";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  login(@Body() body: LoginRequestDto) {
    return this.auth.login(body.email, body.password);
  }

  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  logout() {
    return;
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user.id).then((u: unknown) => ({ user: u }));
  }

  @Post("password")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async change(@CurrentUser() user: AuthUser, @Body() body: ChangePasswordDto) {
    await this.auth.changePassword(user.id, body.currentPassword, body.newPassword);
  }
}
