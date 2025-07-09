import { Injectable } from '@nestjs/common'
import { CreateOrderDto } from './dto/create-order.dto'
import { UpdateOrderDto } from './dto/update-order.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { OrderEntity } from './entities/order.entity'
import { Repository } from 'typeorm'
import { OrdersProductsEntity } from './entities/orders-products.entity'
import { UserEntity } from 'src/users/entities/user.entity'
import { ShippingEntity } from './entities/shipping.entity'
import { ProductEntity } from 'src/products/entities/product.entity'
import { ProductsService } from 'src/products/products.service'

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(OrderEntity)
        private readonly orderRepository: Repository<OrderEntity>,
        @InjectRepository(OrdersProductsEntity)
        private readonly opRepository: Repository<OrdersProductsEntity>,
        private readonly productService: ProductsService
    ) {}

    async create(createOrderDto: CreateOrderDto, currentUser: UserEntity) {
        const shippingEntity = new ShippingEntity()
        Object.assign(shippingEntity, createOrderDto.shippingAddress)

        const orderEntity = new OrderEntity()
        orderEntity.shippingAddress = shippingEntity
        orderEntity.user = currentUser

        const orderTbl = await this.orderRepository.save(orderEntity)

        let opEntity: {
            order: OrderEntity
            product: ProductEntity
            product_quantity: number
            product_unit_price: number
        }[] = []

        if (Array.isArray(createOrderDto.orderedProducts)) {
            for (const productDto of createOrderDto.orderedProducts) {
                const order = orderTbl
                const product = await this.productService.findOne(productDto.id)
                const { product_quantity, product_unit_price } = productDto
                opEntity.push({
                    order,
                    product,
                    product_quantity,
                    product_unit_price,
                })
            }
        } else {
            throw new Error('orderedProducts is not an array')
        }

        const op = await this.opRepository
            .createQueryBuilder()
            .insert()
            .into(OrdersProductsEntity)
            .values(opEntity)
            .execute()
        return await this.findOne(orderTbl.id)
    }

    findAll() {
        return `This action returns all orders`
    }

    async findOne(id: number) {
        return await this.orderRepository.findOne({
            where: { id },
            relations: {
                shippingAddress: true,
                user: true,
                products: { product: true },
            },
        })
    }

    update(id: number, updateOrderDto: UpdateOrderDto) {
        return `This action updates a #${id} order`
    }

    remove(id: number) {
        return `This action removes a #${id} order`
    }
}
