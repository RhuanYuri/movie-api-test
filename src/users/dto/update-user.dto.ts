import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    description: 'Nome completo do usuário',
    example: 'Maria Silva',
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'E-mail único do usuário',
    example: 'maria.silva@email.com',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'Senha do usuário (mínimo 6 caracteres)',
    example: 'novaSenha123',
  })
  password?: string;
}
