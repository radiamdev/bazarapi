import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
} from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserSignUpDto } from './dto/user-signup.dto'
import { UserEntity } from './entities/user.entity'
import { UserSignInDto } from './dto/user-signin.dto'
import { CurrentUser } from 'src/utility/decorators/current-user-decorator'
import { AuthenticationGuard } from 'src/utility/guards/authentication.guard'
import { Roles } from 'src/utility/common/user-roles.enum'
import { AuthorizeGuard } from 'src/utility/guards/authorization.guard'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post('signup')
    @ApiOperation({ summary: 'S\'inscrire un nouvel utilisateur' })
    @ApiResponse({ status: 201, description: 'Utilisateur enregistré.' })
    async signup(
        @Body() userSignUpDto: UserSignUpDto
    ): Promise<{ user: Omit<UserEntity, 'password'> }> {
        return { user: await this.usersService.signup(userSignUpDto) }
    }

    @Post('signin')
    @ApiOperation({ summary: 'Se connecter un nouvel utilisateur' })
    @ApiResponse({ status: 201, description: 'Utilisateur connecté.' })
    async signin(@Body() userSignInDto: UserSignInDto): Promise<{
        accessToken: string
        user: Omit<UserEntity, 'password'>
    }> {
        const user = await this.usersService.signin(userSignInDto)
        const accessToken = await this.usersService.accessToken(user)

        return { accessToken, user }
    }

    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        // return this.usersService.create(createUserDto);
        return 'hi'
    }

    // @AuthorizeRoles(Roles.ADMIN)
    @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN]))
    @Get('all')
    async findAll(): Promise<UserEntity[]> {
        return await this.usersService.findAll()
    }

    @Get('single/:id')
    async findOne(@Param('id') id: string): Promise<UserEntity> {
        return await this.usersService.findOne(+id)
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(+id, updateUserDto)
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(+id)
    }

    @UseGuards(AuthenticationGuard)
    @Get('me')
    getProfile(@CurrentUser() currentUser: UserEntity) {
        return currentUser
    }
}
