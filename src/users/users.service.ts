import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSignUpDto } from './dto/user-signup.dto';
import { compare, hash } from 'bcrypt';
import { UserSignInDto } from './dto/user-signin.dto';
import { sign } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private configService: ConfigService,
  ) {}

  async signup(
    userSignUpDto: UserSignUpDto,
  ): Promise<Omit<UserEntity, 'password'>> {
    const userExists = await this.findUserByEmail(userSignUpDto.email);

    if (userExists) {
      throw new BadRequestException('Email is not available!');
    }

    userSignUpDto.password = await hash(userSignUpDto.password, 10);

    let user = this.usersRepository.create(userSignUpDto);
    user = await this.usersRepository.save(user);

    // Exclude password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async signin(
    userSignInDto: UserSignInDto,
  ): Promise<Omit<UserEntity, 'password'>> {
    const userExists = await this.usersRepository
      .createQueryBuilder('users')
      .addSelect('users.password')
      .where('users.email = :email', { email: userSignInDto.email })
      .getOne();

    if (!userExists) {
      throw new BadRequestException('Bad credentials!');
    }

    const matchPassword = await compare(
      userSignInDto.password,
      userExists.password,
    );

    if (!matchPassword) {
      throw new BadRequestException('Bad credentials.');
    }

    // Exclude password from returned object
    const { password, ...userWithoutPassword } = userExists;
    return userWithoutPassword;
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll(): Promise<UserEntity[]> {
    return await this.usersRepository.find();
  }

  async findOne(id: number): Promise<UserEntity> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async findUserByEmail(email: string) {
    return await this.usersRepository.findOneBy({ email });
  }

  async accessToken(user: Pick<UserEntity, 'id' | 'email'>): Promise<string> {
    const secret = this.configService.get<string>('ACCESS_TOKEN_SECRET_KEY');
    const expiresIn =
      this.configService.get<string>('ACCESS_TOKEN_EXPIRE_TIME') ?? '1h';

    if (!secret) {
      throw new Error('ACCESS_TOKEN_SECRET_KEY is not defined in env');
    }

    return sign({ id: user.id, email: user.email }, secret, { expiresIn });
  }
}
