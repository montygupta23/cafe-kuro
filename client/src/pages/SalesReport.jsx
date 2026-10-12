import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { api } from "../api";

const money = (value) =>
  `$${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function SalesReport() {
  const [period, setPeriod] = useState("month");
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.get("/analytics/reports", { params: { period } })
      .then((response) => {
        if (active) {
          setReport(response.data);
          setError("");
        }
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [period]);

  const exportCsv = () => {
    if (!report) return;
    const rows = [
      [
        "Order",
        "Date",
        "Type",
        "Customer",
        "Subtotal",
        "Tax",
        "Total",
        "Payment method",
      ],
      ...report.orders.map((order) => [
        order.orderNumber,
        new Date(order.createdAt).toISOString(),
        order.orderType,
        order.customer?.name || "Guest",
        order.subtotal,
        order.taxAmount,
        order.grandTotal,
        order.paymentMethod,
      ]),
    ];
    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `cafe-sales-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[#F97316] pb-6">
        <div>
          <h2 className="font-serif text-3xl font-bold text-black">
            Sales Reports
          </h2>
          <p className="mt-1 text-xs text-[#1F2937]">
            Settled sales by date range, tax, and payment method
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-lg border border-[#F97316] bg-[#F97316] p-2 text-xs text-white"
          >
            <option value="day">Today</option>
            <option value="month">This month</option>
          </select>
          <button
            onClick={exportCsv}
            disabled={!report || !report.orders.length}
            className="glass-card2 shadows flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-bold text-[#F97316] border border-[#F97316] disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </header>
      {error && (
        <p
          role="alert"
          className="glass-card2 shadows rounded-lg bg-[#F97316] p-3 text-sm text-white"
        >
          {error}
        </p>
      )}
      {loading ? (
        <p className="text-sm text-[#1F2937]">Loading sales report…</p>
      ) : (
        report && (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["Revenue", money(report.revenue)],
                ["Paid orders", report.count],
                ["Tax collected", money(report.tax)],
              ].map(([label, value]) => (
                <article key={label} className="glass-card2 shadows rounded-2xl p-5">
                  <p className="text-[11px] uppercase tracking-widest text-[#1F2937]">
                    {label}
                  </p>
                  <p className="mt-3 text-2xl font-bold text-[#F97316]">
                    {value}
                  </p>
                </article>
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <article className="glass-card2 shadows rounded-2xl p-6">
                <h3 className="mb-4 font-serif text-xl text-black">
                  Revenue by payment method
                </h3>
                {Object.keys(report.byPayment).length ? (
                  <div className="space-y-3">
                    {Object.entries(report.byPayment).map(([method, total]) => (
                      <div
                        key={method}
                        className="flex justify-between rounded-xl bg-[#F97316] p-3 text-xs"
                      >
                        <span className="text-white">{method}</span>
                        <span className="font-semibold text-white">
                          {money(total)} (
                          {report.revenue
                            ? Math.round((total / report.revenue) * 100)
                            : 0}
                          %)
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#1F2937]">
                    No payments in this period.
                  </p>
                )}
              </article>
              <article className="glass-card2 shadows rounded-2xl p-6">
                <h3 className="mb-4 font-serif text-xl text-black">
                  Tax summary
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between rounded-xl bg-[#F97316] p-3">
                    <span className="text-white">Subtotal</span>
                    <span className="text-white font-semibold">{money(report.subtotal)}</span>
                  </div>
                  <div className="flex justify-between rounded-xl bg-[#F97316] p-3">
                    <span className="text-white">Collected tax</span>
                    <span className="text-white font-semibold">
                      {money(report.tax)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-[#F97316] pt-3 font-bold">
                    <span className="text-[#1F2937]">Settled revenue</span>
                    <span className="text-[#1F2937] font-semibold">{money(report.revenue)}</span>
                  </div>
                </div>
              </article>
            </div>
            <article className="glass-card2 shadows overflow-x-auto rounded-2xl">
              <h3 className="p-5 font-serif text-xl text-black">
                Included paid orders
              </h3>
              <table className="w-full min-w-[650px] text-left text-xs">
                <thead className="bg-[#F97316] text-[10px] uppercase tracking-wider text-white">
                  <tr>
                    <th className="p-4">Order</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F97316]/10">
                  {report.orders.map((order) => (
                    <tr key={order._id}>
                      <td className="p-4 font-semibold text-[#1F2937]">{order.orderNumber}</td>
                      <td className="p-4 text-[#1F2937]">
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4 text-[#1F2937]">
                        {order.customer?.name || "Guest"}
                      </td>
                      <td className="p-4 text-[#1F2937]">
                        {order.paymentMethod}
                      </td>
                      <td className="p-4 text-right font-semibold text-[#1F2937]">
                        {money(order.grandTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
          </>
        )
      )}
    </section>
  );
}
