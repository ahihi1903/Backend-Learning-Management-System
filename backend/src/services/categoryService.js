// src/services/categoryService.js
import Category from "../models/Category.js";
import createError from "../middlewares/createError.js";
import slugify from "slugify"; // npm install slugify

export async function createCategory(name, description = "") {
  const slug = slugify(name, { lower: true, strict: true });

  const exists = await Category.findOne({ $or: [{ name }, { slug }] });
  if (exists) throw createError(400, "Category already exists");

  return await Category.create({ name, slug, description });
}

export async function getAllCategories() {
  return await Category.find().sort({ createdAt: -1 });
}

export async function getCategoryById(id) {
  const category = await Category.findById(id);
  if (!category) throw createError(404, "Category not found");
  return category;
}

export async function updateCategory(id, data) {
  const category = await Category.findById(id);
  if (!category) throw createError(404, "Category not found");

  // nếu đổi name thì cập nhật slug luôn
  if (data.name) {
    data.slug = slugify(data.name, { lower: true, strict: true });
  }

  Object.assign(category, data);
  return await category.save();
}

export async function deleteCategory(id) {
  const category = await Category.findByIdAndDelete(id);
  if (!category) throw createError(404, "Category not found");
  return category;
}
