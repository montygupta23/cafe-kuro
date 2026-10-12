import React, { useEffect, useState } from "react";
import { Armchair, Plus, Trash2 } from "lucide-react";
import { api } from "../api";

export default function TableManager() {
  const [tables, setTables] = useState([]);
  const [form, setForm] = useState({ tableNumber: "", capacity: "" });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  const refresh = async () => {
    try {
      const response = await api.get("/tables");
      setTables(response.data);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };
  useEffect(() => {
    refresh();
  }, []);

  const addTable = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        tableNumber: Number(form.tableNumber),
        capacity: Number(form.capacity),
      };
      if (editing) {
        await api.put(`/tables/${editing}`, payload);
      } else {
        await api.post("/tables", payload);
      }
      setForm({ tableNumber: "", capacity: "" });
      setEditing(null);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  };
  const setStatus = async (table, status) => {
    try {
      await api.put(`/tables/${table._id}`, { status });
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  };
  const remove = async (id) => {
    try {
      await api.delete(`/tables/${id}`);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[#F97316] pb-6">
        <div>
          <h2 className="font-serif text-3xl text-black font-bold">
            Table Management
          </h2>
          <p className="text-xs text-[#1F2937] mt-1">
            Manage table capacities, reservations, and active dine-in orders
          </p>
        </div>
        <form onSubmit={addTable} className="flex gap-2">
          <input
            aria-label="Table number"
            required
            type="number"
            min="1"
            placeholder="Table #"
            value={form.tableNumber}
            onChange={(e) => setForm({ ...form, tableNumber: e.target.value })}
            className="table-field shadows w-24"
          />
          <input
            aria-label="Table capacity"
            required
            type="number"
            min="1"
            placeholder="Seats"
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
            className="table-field shadows w-24"
          />
          <button className="flex items-center shadows gap-2 rounded-lg bg-[#F97316] px-4 text-xs font-bold text-white">
            <Plus className="h-4 w-4" />
            {editing ? "Save" : "Add"}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm({ tableNumber: "", capacity: "" });
              }}
              className="glass-card2 shadows text-xs p-3 rounded-lg text-[#f97316] font-bold"
            >
              Cancel
            </button>
          )}
        </form>
      </header>
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-[#F97316] p-3 text-sm text-white"
        >
          {error}
        </p>
      )}
      {tables.length === 0 ? (
        <p className="glass-card rounded-xl p-8 text-center text-black">
          No tables configured yet.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tables.map((table) => {
            const occupied = Boolean(table.currentOrder);
            return (
              <article key={table._id} className="glass-card2 rounded-2xl p-6">
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <Armchair className="mb-2 h-5 w-5 text-amberGold-400" />
                    <h3 className="font-serif text-3xl font-bold text-[#F97316]">
                      Table {String(table.tableNumber).padStart(2, "0")}
                    </h3>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase ${table.status === "Available" ? "border-emerald-500/30 text-[#1f2937d1]" : table.status === "Occupied" ? "border-rose-500/30 text-neutral-400" : "border-amberGold-500/30 text-amberGold-400"}`}
                  >
                    {table.status}
                  </span>
                </div>
                <div className="mb-5 space-y-2 text-xs  text-[#1f2937d1]">
                  <p>Capacity: {table.capacity} guests</p>
                  {occupied && (
                    <>
                      <p>Order: {table.currentOrder.orderNumber}</p>
                      <p>
                        Guest: {table.currentOrder.customer?.name || "Guest"} ·
                        ${Number(table.currentOrder.grandTotal || 0).toFixed(2)}
                      </p>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  {!occupied && (
                    <select
                      aria-label={`Status for table ${table.tableNumber}`}
                      value={table.status}
                      onChange={(e) => setStatus(table, e.target.value)}
                      className="flex-1 rounded-lg bg-[#F97316] p-2 text-xs  text-white"
                    >
                      <option>Available</option>
                      <option>Reserved</option>
                    </select>
                  )}
                  {!occupied && (
                    <button
                      onClick={() => {
                        setEditing(table._id);
                        setForm({
                          tableNumber: String(table.tableNumber),
                          capacity: String(table.capacity),
                        });
                      }}
                      className="rounded-lg border border-amberGold-500/20 px-3 text-xs  text-[#1f2937d1]"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    disabled={occupied}
                    title="Delete table"
                    onClick={() => remove(table._id)}
                    className="rounded-lg border border-rose-500/20 p-2 text-[#1f2937d1] disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

    </section>
  );
}
