import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'Maria Silva',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @ApiProperty({
    description: 'E-mail único do usuário',
    example: 'maria.silva@email.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Senha do usuário (mínimo 6 caracteres)',
    example: '123456',
  })
  @IsString()
  @MinLength(6)
  password: string;
}

export class UserResponseDto {
  @ApiProperty({
    description: 'Identificador único do usuário (UUID)',
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
  })
  id: string;

  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'Maria Silva',
  })
  name: string;

  @ApiProperty({
    description: 'E-mail único do usuário',
    example: 'maria.silva@email.com',
  })
  email: string;

  @ApiProperty({
    description: 'Data de criação',
    example: '2025-09-20T10:20:30.400Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2025-09-20T11:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Data da exclusão lógica (soft delete)',
    example: null,
    nullable: true,
  })
  deletedAt: Date | null;
}
