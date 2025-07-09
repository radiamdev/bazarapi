import { Type } from 'class-transformer'
import { IsArray, ValidateNested } from 'class-validator'
import { CreateShippingDto } from './create-shipping.dto'
import { OrderedProductsDto } from './ordered-products.dto'

export class CreateOrderDto {
    @Type(() => CreateShippingDto)
    @ValidateNested()
    shippingAddress: CreateShippingDto

    @IsArray({ message: 'orderedProducts must be an array' })
    @Type(() => OrderedProductsDto)
    @ValidateNested({ each: true })
    orderedProducts: OrderedProductsDto[]
}
