import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';

import { Product } from './../entities/product.entity';
import {
  CreateProductDto,
  FilterProductDto,
  UpdateProductDto,
} from './../dtos/products.dtos';
import { Category } from '../entities/category.entity';
import { Brand } from '../entities/brand.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
  ) {}

  findAll(params?: FilterProductDto) {
    if (params) {
      const where: FindOptionsWhere<Product> = {};

      if (params.maxPrice && params.minPrice) {
        where.price = Between(params.minPrice, params.maxPrice)
      }

      return this.productRepository.find({
        relations: {
          brand: true,
        },
        take: params.limit,
        skip: params.offset,
        where,
      });
    }

    return this.productRepository.find({
      relations: {
        brand: true,
      },
    });
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: { brand: true, categories: true },
    });

    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }

    return product;
  }

  async create(data: CreateProductDto) {
    try {
      const newProduct = this.productRepository.create(data);

      if (data.brandId) {
        const brand = await this.brandRepository.findOne({
          where: { id: data.brandId },
        });
        newProduct.brand = brand;
      }

      if (data.categoriesIds.length) {
        const categories = await this.categoryRepository.find({
          where: data.categoriesIds.map((categoryId) => ({ id: categoryId })),
        });

        newProduct.categories = categories;
      }

      const product = await this.productRepository.save(newProduct);

      return product;
    } catch (err) {
      throw new BadRequestException(`${err.message || 'Unexpected Error'}`);
    }
  }

  async update(id: number, changes: UpdateProductDto) {
    const product = await this.findOne(id);

    if (changes.brandId) {
      const brand = await this.brandRepository.findOne({
        where: { id: changes.brandId },
      });
      product.brand = brand;
    }

    if (changes.categoriesIds.length) {
      const categories = await this.categoryRepository.find({
        where: changes.categoriesIds.map((categoryId) => ({ id: categoryId })),
      });

      product.categories = categories;
    }

    await this.productRepository.merge(product, changes);

    return this.productRepository.save(product);
  }

  async removeCategoryByProduct(productId: number, categoryId: number) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: { categories: true },
    });

    if (!product) {
      throw new NotFoundException(`Product #${productId} not found`);
    }

    product.categories = product.categories.filter(
      (item) => item.id != categoryId,
    );

    return this.productRepository.save(product);
  }

  async addCategoryToProduct(productId: number, categoryId: number) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: { categories: true },
    });

    if (!product) {
      throw new NotFoundException(`Product #${productId} not found`);
    }

    if (product.categories.some((item) => item.id === categoryId)) {
      throw new ConflictException(
        `Category #${categoryId} is already present in this product`,
      );
    }

    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Category #${productId} not found`);
    }

    product.categories.push(category);

    return this.productRepository.save(product);
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    return this.productRepository.delete(product);
  }
}
