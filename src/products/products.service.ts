import { Injectable, NotFoundException } from '@nestjs/common'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { ProductEntity } from './entities/product.entity'
import { Repository } from 'typeorm'
import { CategoriesService } from 'src/categories/categories.service'
import { UserEntity } from 'src/users/entities/user.entity'
import { OrderStatus } from 'src/orders/enums/order-status.enum'

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>,
        private readonly categoryService: CategoriesService
    ) {}
    async create(
        createProductDto: CreateProductDto,
        currentUser: UserEntity
    ): Promise<ProductEntity> {
        const category = await this.categoryService.findOne(
            +createProductDto.categoryId
        )
        const product = this.productRepository.create(createProductDto)
        if (!category) {
            throw new NotFoundException('Category not found')
        }
        product.category = category
        product.addedBy = currentUser

        return await this.productRepository.save(product)
    }

    async findAll(): Promise<ProductEntity[]> {
        return await this.productRepository.find()
    }

    async findOne(id: number) {
        const product = await this.productRepository.findOne({
            where: { id: id },
            relations: {
                addedBy: true,
                category: true,
            },
            select: {
                addedBy: {
                    id: true,
                    name: true,
                    email: true,
                },
                category: {
                    id: true,
                    title: true,
                },
            },
        })
        if (!product) {
            throw new NotFoundException('Product not found')
        } else return product
    }

    async update(
        id: number,
        updateProductDto: Partial<UpdateProductDto>,
        currentUser: UserEntity
    ): Promise<ProductEntity> {
        const product = await this.findOne(id)

        Object.assign(product, updateProductDto)
        product.addedBy = currentUser

        if (updateProductDto.categoryId) {
            const category = await this.categoryService.findOne(
                +updateProductDto.categoryId
            )
            if (!category) {
                throw new NotFoundException('Category not found')
            }
            product.category = category
        }

        return await this.productRepository.save(product)
    }

    remove(id: number) {
        return `This action removes a #${id} product`
    }

    async updateStock(id: number, stock: number, status: string) {
        let product = await this.findOne(id)
        if (status === OrderStatus.DELIVERED) {
            product.stock -= stock
        } else {
            product.stock += stock
        }
        product = await this.productRepository.save(product)
        return product
    }
}
