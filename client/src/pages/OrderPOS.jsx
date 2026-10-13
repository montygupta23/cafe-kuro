import React, { useEffect, useMemo, useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import InvoiceModal from "../components/InvoiceModal";
import { api } from "../api";

export default function OrderPOS() {
  const [menu, setMenu] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedCat, setSelectedCat] = useState("All");
  const [orderType, setOrderType] = useState("Dine-in");
  const [table, setTable] = useState("");
  const [customer, setCustomer] = useState({ name: "", phone: "" });
  const [cart, setCart] = useState([]);
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const refresh = async () => {
    setLoading(true);

    try {
      const [menuResponse, tablesResponse] = await Promise.all([
        api.get("/menu"),
        api.get("/tables"),
      ]);

      const items = menuResponse.data;
      const diningTables = tablesResponse.data;

      setMenu(items.filter((item) => item.isAvailable));

      const available = diningTables.filter(
        (item) => item.status === "Available",
      );

      setTables(available);

      setTable((current) =>
        available.some((item) => item._id === current)
          ? current
          : available[0]?._id || "",
      );

      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load menu and tables",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const categories = useMemo(
    () => [
      "All",
      ...new Set(menu.map((item) => item.category?.name).filter(Boolean)),
    ],
    [menu],
  );
  const visibleMenu = menu.filter(
    (item) => selectedCat === "All" || item.category?.name === selectedCat,
  );
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const total = subtotal + tax;

  const changeQty = (id, delta) =>
    setCart((current) =>
      current
        .map((item) =>
          item._id === id ? { ...item, quantity: item.quantity + delta } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  const add = (item) =>
    setCart((current) => {
      const existing = current.find((entry) => entry._id === item._id);
      return existing
        ? current.map((entry) =>
            entry._id === item._id
              ? { ...entry, quantity: entry.quantity + 1 }
              : entry,
          )
        : [...current, { ...item, quantity: 1 }];
    });

  const checkout = async (paymentMethod) => {
    if (!cart.length) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await api.post("/orders", {
        orderType,
        ...(orderType === "Dine-in" ? { table } : {}),
        customer,
        paymentMethod,
        items: cart.map((item) => ({
          menuItem: item._id,
          quantity: item.quantity,
        })),
      });

      const order = response.data;

      setInvoice({
        ...order,
        table: order.table?.tableNumber,
        customerName: order.customer?.name,
        tax: order.taxAmount,
      });

      setCart([]);

      await refresh();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
      <section className="space-y-5 xl:col-span-8">
        <header>
          <h2 className="font-serif text-3xl font-bold text-black">Orders</h2>
          <p className="mt-1 text-xs text-[#1F2937]">
            Create an order from the live menu and record payment
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
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCat(category)}
              className={`whitespace-nowrap shadows rounded-xl px-4 py-2 text-xs font-semibold ${selectedCat === category ? "bg-[#F97316] text-white" : "bg-white text-[#F97316]"}`}
            >
              {category}
            </button>
          ))}
        </div>
        {loading ? (
          <p className="text-sm text-black">Loading menu…</p>
        ) : visibleMenu.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center text-sm text-black">
            No available menu items. Add categories and items in Menu
            Management.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleMenu.map((item) => (
              <button
                key={item._id}
                onClick={() => add(item)}
                className="glass-card2 shadows rounded-2xl p-4 text-left transition hover:border-[#F97316]/50"
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt=""
                    className="mb-3 h-36 w-full rounded-xl object-cover"
                  />
                )}
                <p className="text-[10px] uppercase pb-2 border-b border-[#F97316] tracking-wider text-[#1F2937]">
                  {item.category?.name}
                </p>
                <h3 className="mt-2 text-sm font-semibold text-[#1F2937]">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs text-[#1F2937]">
                  {item.description?.slice(0, 50) + "..." || ""}
                </p>
                <p className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 font-bold text-[#F97316]">
                  <span>${Number(item.price).toFixed(2)}</span>
                  <Plus className="h-4 w-4" />
                </p>
              </button>
            ))}
          </div>
        )}
      </section>

      <aside className="pos-cart glass-card2 shadows flex flex-col rounded-2xl p-5 xl:sticky xl:top-8 xl:col-span-4 xl:h-[calc(100vh-4rem)]">
        <div className="mb-4 flex items-center justify-between border-b border-[#F97316] pb-4">
          <h3 className="flex items-center gap-2 font-serif text-xl font-bold text-[#F97316]">
            <ShoppingCart className="h-5 w-5" />
            Current order
          </h3>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-2">
          {["Dine-in", "Takeaway"].map((type) => (
            <button
              key={type}
              onClick={() => setOrderType(type)}
              className={`rounded-lg px-3 py-2 text-xs font-bold ${orderType === type ? "bg-[#F97316] text-white" : "bg-white border border-[#F97316]  text-[#F97316]"}`}
            >
              {type}
            </button>
          ))}
        </div>
        {orderType === "Dine-in" && (
          <select
            aria-label="Dining table"
            value={table}
            onChange={(e) => setTable(e.target.value)}
            className="mb-3 rounded-lg bg-[#F97316] p-3 text-xs text-white"
          >
            <option value="">Select available table</option>
            {tables.map((item) => (
              <option key={item._id} value={item._id}>
                Table {item.tableNumber} · {item.capacity} seats
              </option>
            ))}
          </select>
        )}
        <div className="mb-3 grid grid-cols-2 gap-2">
          <input
            aria-label="Customer name"
            placeholder="Guest name"
            value={customer.name}
            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            className="bg-white placeholder:text-[#F97316] rounded-lg p-2 border border-[#F97316]  text-xs text-[#1F2937]"
          />
          <input
            aria-label="Customer phone"
            placeholder="Phone (optional)"
            value={customer.phone}
            onChange={(e) =>
              setCustomer({ ...customer, phone: e.target.value })
            }
            className="bg-white  placeholder:text-[#F97316] rounded-lg border border-[#F97316] p-2 text-xs  text-[#1F2937]"
          />
        </div>
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
          {!cart.length && (
            <p className="py-10 text-center text-xs text-neutral-500">
              Select menu items to build an order.
            </p>
          )}
          {cart.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between rounded-xl bg-[#F97316] p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-white mb-1">
                  {item.title}
                </p>
                <p className="text-[10px] text-white">
                  ${Number(item.price).toFixed(2)}
                </p>
              </div>
              <div className="ml-3 flex items-center gap-2">
                <button
                  aria-label={`Remove one ${item.title}`}
                  onClick={() => changeQty(item._id, -1)}
                  className="rounded bg-white p-1 text-[#F97316]"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-4 text-center text-xs">{item.quantity}</span>
                <button
                  aria-label={`Add one ${item.title}`}
                  onClick={() => changeQty(item._id, 1)}
                  className="rounded bg-white p-1 text-[#F97316]"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-xs">
          <div className="flex justify-between text-[#1F2937]">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[#1F2937]">
            <span>Tax (5%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-white/10 pt-2 text-sm font-bold text-[#1F2937]">
            <span>Total</span>
            <span className="text-[#1F2937]">${total.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-3">
            {["Cash", "Card", "UPI"].map((method) => (
              <button
                key={method}
                disabled={
                  !cart.length ||
                  submitting ||
                  (orderType === "Dine-in" && !table)
                }
                onClick={() => checkout(method)}
                className="rounded-lg border hover:border-[#F97316]  bg-[#F97316] py-2.5 text-xs font-bold text-white hover:bg-white hover:text-[#F97316] "
              >
                {submitting ? "…" : method}
              </button>
            ))}
          </div>
          <button
            disabled={
              !cart.length || submitting || (orderType === "Dine-in" && !table)
            }
            onClick={() => checkout("Unassigned")}
            className="mt-2 w-full rounded-lg border border-white/10 py-2 text-xs font-semibold text-[#1F2937] disabled:opacity-40"
          >
            Save as unpaid
          </button>
        </div>
      </aside>
      {invoice && (
        <InvoiceModal order={invoice} onClose={() => setInvoice(null)} />
      )}
    </div>
  );
}
