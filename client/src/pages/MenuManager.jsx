import React, { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { api } from "../api";

const emptyItem = {
  title: "",
  category: "",
  price: "",
  description: "",
  image: "",
  isAvailable: true,
  isSignature: false,
};

export default function MenuManager() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyItem);
  const [editing, setEditing] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const [menuResponse, categoriesResponse] = await Promise.all([
        api.get("/menu"),
        api.get("/categories"),
      ]);
      const menu = menuResponse.data;
      const cats = categoriesResponse.data;
      setItems(menu);
      setCategories(cats);
      setForm((current) => ({
        ...current,
        category: current.category || cats[0]?._id || "",
      }));
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const saveItem = async (event) => {
    event.preventDefault();
    try {
      const payload = {
          ...form,
          price: Number(form.price),
        };
      if (editing) {
        await api.put(`/menu/${editing}`, payload);
      } else {
        await api.post("/menu", payload);
      }
      setForm({ ...emptyItem, category: categories[0]?._id || "" });
      setEditing(null);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const saveCategory = async (event) => {
    event.preventDefault();
    try {
      const payload = { name: categoryName.trim() };
      if (editingCategory) {
        await api.put(`/categories/${editingCategory}`, payload);
      } else {
        await api.post("/categories", payload);
      }
      setCategoryName("");
      setEditingCategory(null);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const editItem = (item) => {
    setEditing(item._id);
    setForm({
      ...emptyItem,
      ...item,
      category: item.category?._id || "",
      price: String(item.price),
    });
  };

  const removeItem = async (id) => {
    try {
      await api.delete(`/menu/${id}`);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const removeCategory = async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="space-y-6">
      <header className="border-b border-[#F97316] pb-5">
        <h2 className="font-serif text-3xl text-black font-bold">
          Menu & Categories
        </h2>
        <p className="text-xs text-[#1F2937] mt-1">
          Maintain the items and categories available to the point of sale
        </p>
      </header>
      {error && (
        <p
          role="alert"
          className="rounded-lg shadows bg-[#F97316] p-3 text-sm text-white"
        >
          {error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <form
          onSubmit={saveItem}
          className="glass-card2 shadows rounded-2xl p-5 grid gap-3 sm:grid-cols-2"
        >
          <h3 className="sm:col-span-2 font-serif text-xl text-[#1F2937]">
            {editing ? "Edit menu item" : "Add menu item"}
          </h3>
          <input
            required
            placeholder="Item name"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="field text-white placeholder:text-white"
          />
          <select
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="field placeholder:text-white"
          >
            <option value="">Choose category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          <input
            required
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="field placeholder:text-white"
          />
          <input
            placeholder="Image URL (optional)"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            className="field placeholder:text-white"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="field placeholder:text-white sm:col-span-2"
          />
          <label className="text-xs text-[#1F2937] flex items-center gap-2">
            <input
              type="checkbox"
              className="accent-[#F97316] text-white"
              checked={form.isAvailable}
              onChange={(e) =>
                setForm({ ...form, isAvailable: e.target.checked })
              }
            />{" "}
            Available for ordering
          </label>
          <label className="text-xs text-[#1F2937] flex items-center gap-2">
            <input
              type="checkbox"
              className="accent-[#F97316] text-white"
              checked={form.isSignature}
              onChange={(e) =>
                setForm({ ...form, isSignature: e.target.checked })
              }
            />{" "}
            Signature item
          </label>
          <div className="sm:col-span-2 flex gap-2">
            <button
              disabled={!categories.length}
              className="rounded-lg bg-[#F97316] px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
            >
              {editing ? "Save changes" : "Add item"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setForm(emptyItem);
                }}
                className="rounded-lg bg-[#F97316] px-4 py-2 text-xs text-white"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <form
          onSubmit={saveCategory}
          className="glass-card2 shadows rounded-2xl p-5 space-y-4"
        >
          <h3 className="font-serif text-xl text-[#1F2937]">
            {editingCategory ? "Edit category" : "Categories"}
          </h3>
          <div className="flex gap-2">
            <input
              required
              placeholder="New category"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="field placeholder:text-white min-w-0 flex-1"
            />
            <button
              aria-label="Add category"
              className="rounded-lg bg-[#F97316] px-3 text-white"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {editingCategory && (
            <button
              type="button"
              onClick={() => {
                setEditingCategory(null);
                setCategoryName("");
              }}
              className="text-xs text-white bg-[#F97316] px-3 py-2 rounded-lg"
            >
              Cancel edit
            </button>
          )}
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li
                key={cat._id}
                className="flex justify-between rounded-lg bg-[#F97316] p-3 text-sm text-white"
              >
                <span>{cat.name}</span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    title={`Edit ${cat.name}`}
                    onClick={() => {
                      setEditingCategory(cat._id);
                      setCategoryName(cat.name);
                    }}
                    className="text-white"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    title={`Delete ${cat.name}`}
                    onClick={() => removeCategory(cat._id)}
                    className="text-white hover:text-gray-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </form>
      </div>

      {loading ? (
        <p className="text-sm text-[#1F2937]">Loading menu…</p>
      ) : (
        <div className="glass-card2 shadows overflow-x-auto rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F97316] text-[10px] uppercase tracking-wider text-white">
              <tr>
                <th className="p-4">Menu item</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Availability</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.map((item) => (
                <tr key={item._id}>
                  <td className="p-4 font-semibold text-[#1F2937]">
                    {item.title}
                    {item.isSignature && (
                      <span className="ml-1 text-[#F97316]">Signature</span>
                    )}
                  </td>
                  <td className="p-4 text-[#1F2937]">
                    {item.category?.name || "—"}
                  </td>
                  <td className="p-4 text-[#1F2937]">
                    ${Number(item.price).toFixed(2)}
                  </td>
                  <td className="p-4 text-[#1F2937]">
                    {item.isAvailable ? "Available" : "Unavailable" }
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => editItem(item)}
                        title="Edit item"
                        className="text-[#F97316]"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeItem(item._id)}
                        title="Delete item"
                        className="text-[#4d5e76b5] hover:text-gray-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
