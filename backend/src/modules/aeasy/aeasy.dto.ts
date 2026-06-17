import { IsString, Matches } from 'class-validator';

export class CpfLoginDto {
  @IsString({ message: 'CPF é obrigatório' })
  @Matches(/^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {
    message: 'CPF inválido. Informe 11 dígitos ou formato 000.000.000-00',
  })
  cpf: string;
}
