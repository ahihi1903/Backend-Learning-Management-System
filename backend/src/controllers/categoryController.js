// src/controllers/categoryController.js
import * as categoryService from "../services/categoryService.js";

export async function create(req, res) {
  const { name, description } = req.body;
  const category = await categoryService.createCategory(name, description);
  res.status(201).json(category);
}

export async function getAll(req, res) {
  const categories = await categoryService.getAllCategories();
  res.json(categories);
}

export async function getById(req, res) {
  const category = await categoryService.getCategoryById(req.params.id);
  res.json(category);
}

export async function update(req, res) {
  const category = await categoryService.updateCategory(
    req.params.id,
    req.body,
  );
  res.json(category);
}

export async function remove(req, res) {
  await categoryService.deleteCategory(req.params.id);
  res.json({ message: "Category deleted" });
}
