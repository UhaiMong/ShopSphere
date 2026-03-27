// ─── product.service.ts ──────────────────────────────────────────────────────
import mongoose, { FilterQuery } from 'mongoose';
import { Product, IProduct } from '../../models/Product.model';
import { Category } from '../../models/Category.model';
import { ApiError } from '../../utils/ApiError';
import { getPaginationMeta, PaginationMeta } from '../../utils/ApiResponse';
import { cloudinary } from '../../config/cloudinary';
import { CreateProductInput, UpdateProductInput, ProductQuery } from './product.validator';

// Sort Map
const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  rating: { avgRating: -1 },
  newest: { createdAt: -1 },
  popular: { soldCount: -1 },
};

export const productService = {
  // getAll
  async getAll(query: ProductQuery): Promise<{
    products: IProduct[];
    pagination: PaginationMeta;
  }> {
    const {
      page,
      limit,
      category,
      brand,
      minPrice,
      maxPrice,
      inStock,
      isFeatured,
      search,
      sort,
      tags,
    } = query;

    const filter: FilterQuery<ProductQuery> = { isActive: true };

    if (category) {
      const cat = await Category.findOne({
        $or: [{ _id: mongoose.isValidObjectId(category) ? category : null }, { slug: category }],
      });
      if (cat) {
        filter.category = {
          $in: await Category.find({
            $or: [{ _id: cat._id }, { ancestors: cat._id }],
          }).distinct('_id'),
        };
      }
    }

    if (brand) filter.brand = new RegExp(brand, 'i');
    if (minPrice !== undefined) filter.price = { ...(filter.price as object), $gte: minPrice };
    if (maxPrice !== undefined) filter.price = { ...(filter.price as object), $lte: maxPrice };
    if (inStock) filter.stock = { $gt: 0 };
    if (isFeatured !== undefined) filter.isFeatured = isFeatured;
    if (tags) filter.tags = { $in: tags.split(',').map((t) => t.trim()) };

    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const sortObj = SORT_MAP[sort] ?? SORT_MAP.newest;

    const scoreProjection = search ? { score: { $meta: 'textScore' } } : {};
    const scoreSortField: Record<string, 1 | -1 | { $meta: any }> | undefined = search
      ? { score: { $meta: 'textScore' } }
      : undefined;

    const [products, total] = await Promise.all([
      Product.find(filter, scoreProjection)
        .populate('category', 'name slug')
        .sort({ ...(scoreSortField ?? {}), ...sortObj })
        .skip(skip)
        .limit(limit)
        .lean<IProduct[]>(),
      Product.countDocuments(filter),
    ]);

    return {
      products,
      pagination: getPaginationMeta(total, page, limit),
    };
  },

  // getById
  async getById(idOrSlug: string): Promise<IProduct> {
    const isObjectId = mongoose.isValidObjectId(idOrSlug);
    const filter: FilterQuery<ProductQuery> = isObjectId
      ? { _id: idOrSlug, isActive: true }
      : { slug: idOrSlug, isActive: true };

    const product = await Product.findOne(filter)
      .populate('category', 'name slug ancestors')
      .lean<IProduct>();

    if (!product) throw ApiError.notFound('Product');
    return product;
  },

  // getFeatured
  async getFeatured(limit = 8): Promise<IProduct[]> {
    return Product.find({ isActive: true, isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('category', 'name slug')
      .lean<IProduct[]>();
  },

  // getRelated
  async getRelated(productId: string, limit = 6): Promise<IProduct[]> {
    const product = await Product.findById(productId).lean<IProduct>();
    if (!product) return [];

    return Product.find({
      _id: { $ne: productId },
      category: product.category,
      isActive: true,
    })
      .sort({ avgRating: -1, soldCount: -1 })
      .limit(limit)
      .lean<IProduct[]>();
  },

  // create
  async create(data: CreateProductInput, imageUrls: string[]): Promise<IProduct> {
    const category = await Category.findById(data.category);
    if (!category) throw ApiError.badRequest('Category not found');

    const product = await Product.create({
      ...data,
      images: imageUrls,
    });

    return product.toObject() as IProduct;
  },

  // update by PUT
  async update(id: string, data: UpdateProductInput, incomingImages?: string[]): Promise<IProduct> {
    const product = await Product.findById(id);
    if (!product) throw ApiError.notFound('Product');

    if (data.category) {
      const category = await Category.findById(data.category);
      if (!category) throw ApiError.badRequest('Category not found');
    }

    Object.assign(product, data);

    // ✅ KEY FIX: incomingImages is the FULL final array from the frontend
    // (existing kept + new ones added, duplicates already filtered in the UI).
    // We replace outright instead of appending — this prevents duplication
    // when the user updates without changing images.
    if (incomingImages !== undefined) {
      // Deduplicate just in case, then replace
      product.images = [...new Set(incomingImages)];
    }

    await product.save();
    return product.toObject() as IProduct;
  },

  // updateStock by PATCH
  async updateStock(id: string, quantity: number): Promise<IProduct> {
    const product = await Product.findById(id);
    if (!product) throw ApiError.notFound('Product');
    if (product.stock + quantity < 0) {
      throw ApiError.badRequest('Insufficient stock');
    }
    product.stock += quantity;
    await product.save();
    return product.toObject() as IProduct;
  },

  // softDelete
  async softDelete(id: string): Promise<void> {
    const product = await Product.findByIdAndUpdate(id, { isActive: false });
    if (!product) throw ApiError.notFound('Product');
  },

  // deleteImage
  async deleteImage(productId: string, imageUrl: string): Promise<IProduct> {
    const product = await Product.findById(productId);
    if (!product) throw ApiError.notFound('Product');

    const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
    try {
      await cloudinary.uploader.destroy(`shopsphere/products/${publicId}`);
    } catch {
      // Log but don't fail if Cloudinary delete fails
    }

    product.images = product.images.filter((img) => img !== imageUrl);
    await product.save();
    return product.toObject() as IProduct;
  },
};

/*
import mongoose, { FilterQuery } from 'mongoose';
import { Product, IProduct } from '../../models/Product.model';
import { Category } from '../../models/Category.model';
import { ApiError } from '../../utils/ApiError';
import { getPaginationMeta, PaginationMeta } from '../../utils/ApiResponse';
import { cloudinary } from '../../config/cloudinary';
import { CreateProductInput, UpdateProductInput, ProductQuery } from './product.validator';

// Sort Map
const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  rating: { avgRating: -1 },
  newest: { createdAt: -1 },
  popular: { soldCount: -1 },
};

export const productService = {
  // getAll
  async getAll(query: ProductQuery): Promise<{
    products: IProduct[];
    pagination: PaginationMeta;
  }> {
    const {
      page,
      limit,
      category,
      brand,
      minPrice,
      maxPrice,
      inStock,
      isFeatured,
      search,
      sort,
      tags,
    } = query;

    const filter: FilterQuery<ProductQuery> = { isActive: true };

    // Category filter — supports querying a category + all its descendants
    if (category) {
      const cat = await Category.findOne({
        $or: [{ _id: mongoose.isValidObjectId(category) ? category : null }, { slug: category }],
      });
      if (cat) {
        filter.category = {
          $in: await Category.find({
            $or: [{ _id: cat._id }, { ancestors: cat._id }],
          }).distinct('_id'),
        };
      }
    }

    if (brand) filter.brand = new RegExp(brand, 'i');
    if (minPrice !== undefined) filter.price = { ...(filter.price as object), $gte: minPrice };
    if (maxPrice !== undefined) filter.price = { ...(filter.price as object), $lte: maxPrice };
    if (inStock) filter.stock = { $gt: 0 };
    if (isFeatured !== undefined) filter.isFeatured = isFeatured;
    if (tags) filter.tags = { $in: tags.split(',').map((t) => t.trim()) };

    // Full-text search using MongoDB text index
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const sortObj = SORT_MAP[sort] ?? SORT_MAP.newest;

    // Add text score projection when searching
    const scoreProjection = search ? { score: { $meta: 'textScore' } } : {};
    const scoreSortField: Record<string, 1 | -1 | { $meta: any }> | undefined = search
      ? { score: { $meta: 'textScore' } }
      : undefined;

    const [products, total] = await Promise.all([
      Product.find(filter, scoreProjection)
        .populate('category', 'name slug')
        .sort({ ...(scoreSortField ?? {}), ...sortObj })
        .skip(skip)
        .limit(limit)
        .lean<IProduct[]>(),
      Product.countDocuments(filter),
    ]);

    return {
      products,
      pagination: getPaginationMeta(total, page, limit),
    };
  },

  // getById
  async getById(idOrSlug: string): Promise<IProduct> {
    const isObjectId = mongoose.isValidObjectId(idOrSlug);
    const filter: FilterQuery<ProductQuery> = isObjectId
      ? { _id: idOrSlug, isActive: true }
      : { slug: idOrSlug, isActive: true };

    const product = await Product.findOne(filter)
      .populate('category', 'name slug ancestors')
      .lean<IProduct>();

    if (!product) throw ApiError.notFound('Product');
    return product;
  },

  // getFeatured
  async getFeatured(limit = 8): Promise<IProduct[]> {
    return Product.find({ isActive: true, isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('category', 'name slug')
      .lean<IProduct[]>();
  },

  // getRelated
  async getRelated(productId: string, limit = 6): Promise<IProduct[]> {
    const product = await Product.findById(productId).lean<IProduct>();
    if (!product) return [];

    return Product.find({
      _id: { $ne: productId },
      category: product.category,
      isActive: true,
    })
      .sort({ avgRating: -1, soldCount: -1 })
      .limit(limit)
      .lean<IProduct[]>();
  },

  // create
  async create(data: CreateProductInput, imageUrls: string[]): Promise<IProduct> {
    // Validate category exists
    const category = await Category.findById(data.category);
    if (!category) throw ApiError.badRequest('Category not found');

    const product = await Product.create({
      ...data,
      images: imageUrls,
    });

    return product.toObject() as IProduct;
  },

  // update by PUT
  async update(id: string, data: UpdateProductInput, newImageUrls?: string[]): Promise<IProduct> {
    const product = await Product.findById(id);
    if (!product) throw ApiError.notFound('Product');

    if (data.category) {
      const category = await Category.findById(data.category);
      if (!category) throw ApiError.badRequest('Category not found');
    }

    Object.assign(product, data);
    if (newImageUrls && newImageUrls.length > 0) {
      product.images = [...product.images, ...newImageUrls];
    }

    await product.save();
    return product.toObject() as IProduct;
  },

  // updateStock by PATCH
  async updateStock(id: string, quantity: number): Promise<IProduct> {
    const product = await Product.findById(id);
    if (!product) throw ApiError.notFound('Product');
    if (product.stock + quantity < 0) {
      throw ApiError.badRequest('Insufficient stock');
    }
    product.stock += quantity;
    await product.save();
    return product.toObject() as IProduct;
  },

  // softDelete
  async softDelete(id: string): Promise<void> {
    const product = await Product.findByIdAndUpdate(id, { isActive: false });
    if (!product) throw ApiError.notFound('Product');
  },

  // deleteImage
  async deleteImage(productId: string, imageUrl: string): Promise<IProduct> {
    const product = await Product.findById(productId);
    if (!product) throw ApiError.notFound('Product');

    // Extract Cloudinary public_id and delete from cloud
    const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
    try {
      await cloudinary.uploader.destroy(`shopsphere/products/${publicId}`);
    } catch {
      // Log but don't fail if Cloudinary delete fails
    }

    product.images = product.images.filter((img) => img !== imageUrl);
    await product.save();
    return product.toObject() as IProduct;
  },
};
*/
