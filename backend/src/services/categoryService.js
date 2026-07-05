// src/services/categoryService.js
import Category from "../models/Category.js";
import createError from "../middlewares/createError.js";
import slugify from "slugify"; // npm install slugify
import Course from "../models/Course.js";

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
    const duplicate = await Category.findOne({
      _id: { $ne: id },
      $or: [{ name: data.name }, { slug: data.slug }],
    });
    if (duplicate) throw createError(409, "Category already exists");
  }

  Object.assign(category, data);
  return await category.save();
}

export async function deleteCategory(id) {
  const courseExists = await Course.exists({ category: id });
  if (courseExists) {
    throw createError(409, "Không thể xóa category đang được course sử dụng");
  }
  const category = await Category.findByIdAndDelete(id);
  if (!category) throw createError(404, "Category not found");
  return category;
}
