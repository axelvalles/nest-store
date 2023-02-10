import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/products/entities/product.entity';
import { Repository } from 'typeorm';
import { CreateOrderItemDto } from '../dtos/order-item.dto';
import { OrderItem } from '../entities/order-item.entity';
import { Order } from '../entities/order.entity';

@Injectable()
export class OrderItemsService {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  findAll() {
    return this.orderItemRepository.find({
      relations: {
        product: true,
        order: true,
      },
    });
  }

  async findOne(id: number) {
    const orderItem = await this.orderItemRepository.findOneBy({ id });
    if (!orderItem) {
      throw new NotFoundException(`Order item #${id} not found`);
    }
    return orderItem;
  }

  async create(data: CreateOrderItemDto) {
    const orderItem = new OrderItem();
    const order = await this.orderRepository.findOneBy({
      id: data.orderId,
    });
    const product = await this.productRepository.findOneBy({
      id: data.productId,
    });
    orderItem.order = order;
    orderItem.product = product;
    orderItem.quantity = data.quantity;
    return this.orderItemRepository.save(orderItem);
  }
}
