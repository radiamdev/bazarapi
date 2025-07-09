import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator'

export class OrderedProductsDto {
    @IsNotEmpty({ message: 'Product ID cannot be empty' })
    id: number

    @IsNumber(
        { maxDecimalPlaces: 2 },
        {
            message:
                'product_unit_price must be a number with up to 2 decimal places',
        }
    )
    @IsPositive({ message: 'product_unit_price cannot be negative' })
    product_unit_price: number

    @IsNumber({}, { message: 'product_quantity must be a number' })
    @IsPositive({ message: 'product_quantity cannot be negative' })
    product_quantity: number
}
