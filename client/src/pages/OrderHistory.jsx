import React, { useEffect, useState } from "react";
import { api } from "../api";
import InvoiceModal from "../components/InvoiceModal";

const money = (value) => `$${Number(value || 0).toFixed(2)}`;

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const response = await api.get("/orders");
      setOrders(response.data);
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

  const update = async (path, payload) => {
    try {
      await api.patch(path, payload);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const invoiceOrder = (order) =>
    setInvoice({
      ...order,
      customerName: order.customer?.name,
      table: order.table?.tableNumber,
      tax: order.taxAmount,
      paymentStatus: order.paymentStatus,
    });

  return (
    <section className="space-y-6">
      <header className="border-b border-[#F97316] pb-6">
        <h2 className="font-serif text-3xl text-black font-bold">
          Order History
        </h2>
        <p className="text-xs text-[#1F2937] mt-1">
          Track order fulfillment, invoices, and payment settlement
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
      {loading ? (
        <p className="text-sm text-[#1F2937]">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="glass-card2 shadows rounded-xl p-8 text-center text-[#1F2937]">
          No orders yet. Create one from the POS terminal.
        </p>
      ) : (
        <div className="glass-card2 shadows overflow-x-auto rounded-2xl">
          <table className="w-full min-w-[950px] text-left text-xs">
            <thead className="bg-[#F97316] text-[10px] uppercase tracking-wider text-white">
              <tr>
                <th className="p-4">Order</th>
                <th className="p-4">Created</th>
                <th className="p-4">Customer / service</th>
                <th className="p-4">Total</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Fulfillment</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#]">
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="p-4 font-semibold text-silk">
                    {order.orderNumber}
                    <p className="mt-1 text-[#1F2937]">
                      {order.items?.length || 0} items
                    </p>
                  </td>
                  <td className="p-4 text-[#1F2937]">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4 text-[#1F2937]">
                    {order.customer?.name || "Guest"}
                    <p className="mt-1 text-neutral-500">
                      {order.orderType}
                      {order.table?.tableNumber
                        ? ` · Table ${order.table.tableNumber}`
                        : ""}
                    </p>
                  </td>
                  <td className="p-4 font-bold text-[#1F2937]">
                    {money(order.grandTotal)}
                  </td>
                  <td className="p-4">
                    <span
                      className={
                        order.paymentStatus === "Paid"
                          ? "text-[#1F2937]"
                          : "text-[#F97316]"
                      }
                    >
                      {order.paymentStatus}
                    </span>
                    <p className="mt-1 text-neutral-400">
                      {order.paymentMethod}
                    </p>
                  </td>
                  <td className="p-4">
                    <select
                      aria-label={`Fulfillment status for ${order.orderNumber}`}
                      value={order.status}
                      onChange={(e) =>
                        update(`/orders/${order._id}/status`, {
                          status: e.target.value,
                        })
                      }
                      className="rounded bg-[#F97316] p-2 text-white"
                    >
                      {[
                        "Pending",
                        "Preparing",
                        "Served",
                        "Completed",
                        "Cancelled",
                      ].map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-2">
                      {order.paymentStatus !== "Paid" && (
                        <select
                          aria-label={`Record payment for ${order.orderNumber}`}
                          defaultValue=""
                          onChange={(e) =>
                            e.target.value &&
                            update(`/orders/${order._id}/payment`, {
                              paymentStatus: "Paid",
                              paymentMethod: e.target.value,
                            })
                          }
                          className="rounded bg-[#F97316] p-2 text-white"
                        >
                          <option value="" disabled>
                            Record payment…
                          </option>
                          {["Cash", "Card", "UPI"].map((method) => (
                            <option key={method}>{method}</option>
                          ))}
                        </select>
                      )}
                      {order.paymentStatus === "Paid" && (
                        <button
                          onClick={() => invoiceOrder(order)}
                          className="rounded border font-semibold border-[#F97316] p-2 text-[#F97316] hover:bg-[#F97316] hover:text-white"
                        >
                          View invoice
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {invoice && (
        <InvoiceModal order={invoice} onClose={() => setInvoice(null)} />
      )}
    </section>
  );
}
