import { Controller, Get, Param } from '@nestjs/common';
import { StudentsService } from './students.service';
import { Levels } from 'src/auth/decorators/levels.decorator';
import { LEVELS } from 'src/constants';
import { maskUserCpf, maskUsersCpf } from 'src/common/mask-cpf';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Levels(LEVELS.ALUNO_ESTUDANTE)
  @Get()
  async findAll() {
    return maskUsersCpf(await this.studentsService.findAll());
  }

  @Levels(LEVELS.ALUNO_ESTUDANTE)
  @Get(':email')
  async findOne(@Param('email') email: string) {
    const student = await this.studentsService.findOne(email);
    return student ? maskUserCpf(student) : student;
  }
}
