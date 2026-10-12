import React, { useEffect, useState } from "react";
import { Pencil, Trash2, Users } from "lucide-react";
import { api } from "../api";

const empty = { name: "", phone: "", email: "" };
const tierFor = (spent) =>
  spent >= 2000 ? "Gold" : spent >= 750 ? "Silver" : "Member";

export default function CustomerManager() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  const refresh = async () => {
    try {
      const response = await api.get("/customers");
      setCustomers(response.data);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };
  useEffect(() => {
    refresh();
  }, []);

  const save = async (event) => {
    event.preventDefault();
    try {
      if (editing) {
        await api.put(`/customers/${editing}`, form);
      } else {
        await api.post("/customers", form);
      }
      setForm(empty);
      setEditing(null);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  };
  const remove = async (id) => {
    try {
      await api.delete(`/customers/${id}`);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="space-y-6">
      <header className="border-b border-[#F97316] pb-6">
        <h2 className="font-serif text-3xl text-black font-bold">
          Customer Directory
        </h2>
        <p className="text-xs text-[#1F2937] mt-1">
          Customer profiles and spend-based loyalty tiers
        </p>
      </header>
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-[#F97316] p-3 text-sm text-white"
        >
          {error}
        </p>
      )}
      <form
        onSubmit={save}
        className="glass-card2 shadows grid gap-3 rounded-2xl p-5 sm:grid-cols-4"
      >
        <h3 className="sm:col-span-4 font-serif text-xl text-[#1F2937] font-bold">
          {editing ? "Edit customer" : "Add customer"}
        </h3>
        <input
          required
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="customer-field placeholder:text-white"
        />
        <input
          required
          placeholder="Phone (unique)"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="customer-field placeholder:text-white"
        />
        <input
          type="email"
          placeholder="Email (optional)"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="customer-field placeholder:text-white"
        />
        <div className="flex gap-2">
          <button className="rounded-lg border border-[#F97316] bg-[#F97316] px-4 py-2 text-xs font-bold text-white hover:bg-white hover:text-[#F97316]">
            {editing ? "Save" : "Add customer"}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm(empty);
              }}
              className="text-xs text-[#F97316] border border-[#F97316] rounded-lg px-4 py-2 hover:bg-[#F97316] hover:text-white"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      <div className="glass-card2 shadows overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[650px] text-left text-xs">
          <thead className="bg-[#F97316] text-[10px] uppercase tracking-wider text-white">
            <tr>
              <th className="p-4">Customer</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Tier</th>
              <th className="p-4">Visits</th>
              <th className="p-4 text-right">Lifetime spend</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F97316]/20">
            {customers.map((c) => (
              <tr key={c._id}>
                <td className="p-4 font-semibold text-[#1F2937]">
                  <span className="inline-flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#1F2937]" />
                    {c.name}
                  </span>
                </td>
                <td className="p-4 text-[#1F2937]">{c.phone}</td>
                <td className="p-4 text-[#1F2937]">
                  {tierFor(Number(c.totalSpent || 0))}
                </td>
                <td className="p-4 text-[#1F2937]">{c.totalVisits || 0}</td>
                <td className="p-4 text-right font-bold text-[#1F2937]">
                  ${Number(c.totalSpent || 0).toFixed(2)}
                </td>
                <td className="p-4">
                  <div className="flex gap-3">
                    <button
                      title="Edit customer"
                      onClick={() => {
                        setEditing(c._id);
                        setForm({
                          name: c.name,
                          phone: c.phone,
                          email: c.email || "",
                        });
                      }}
                      className="text-amberGold-400"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      title="Delete customer"
                      onClick={() => remove(c._id)}
                      className="text-[#4d5e76b5] hover:text-gray-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    
    </section>
  );
}
