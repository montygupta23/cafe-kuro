import React, { useEffect, useState } from "react";
import {
  ArrowUpRight,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../api";

const money = (value) =>
  `$${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const getDashboard = async () => {
    const response = await api.get("/analytics/dashboard");
    return response.data;
  };

  const fetchDashboard = async () => {
    try {
      const data = await getDashboard();
      setData(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load dashboard",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading)
    return <p className="text-sm text-black/70">Loading cafe performance…</p>;
  if (error)
    return (
      <div
        role="alert"
        className="rounded-lg bg-rose-950/40 p-4 text-sm text-black/70"
      >
        Could not load dashboard: {error}
      </div>
    );

  const stats = [
    {
      title: "Today’s revenue",
      value: money(data.dailyRevenue),
      subtext: `${data.dailyOrders} paid orders`,
      icon: DollarSign,
    },
    {
      title: "Paid orders today",
      value: data.dailyOrders,
      subtext: "Settled orders",
      icon: ShoppingBag,
    },
    {
      title: "Month revenue",
      value: money(data.monthlyRevenue),
      subtext: `${data.monthlyOrders} paid orders`,
      icon: TrendingUp,
    },
    {
      title: "Guests today",
      value: data.activeCustomers,
      subtext: "Identified customers",
      icon: Users,
    },
  ];

  return (
    <section className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F97316] pb-4">
        <div>
          <h2 className="font-serif text-3xl font-bold text-[#1F2937]">
            Executive Dashboard
          </h2>
          <p className="mt-1 text-xs text-[#1F2937]">
            Live revenue, orders, and cafe activity from your order records
          </p>
        </div>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 ">
        {stats.map(({ title, value, subtext, icon: Icon }) => (
          <article key={title} className="glass-card2 rounded-2xl p-5">
            <div className="mb-4 flex items-start justify-between">
              <span className="text-[11px] uppercase tracking-widest text-[#1F2937]">
                {title}
              </span>
              <Icon className="h-5 w-5 text-[#1F2937]" />
            </div>
            <p className="text-2xl font-bold text-[#F97316]">{value}</p>
            <p className="mt-2 text-xs text-[#1F2937]">{subtext}</p>
          </article>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <article className="glass-card2 rounded-2xl p-6 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-serif text-xl text-black/80">
              Top sellers this month
            </h3>
            <Link
              to="/reports"
              className="rounded-lg text-xs px-3 py-2 bg-[#F97316] text-white hover:text-[#F97316] hover:bg-white  border hover:border-[#F97316]"
            >
              View reports
            </Link>
          </div>
          {!data.topItems.length ? (
            <p className="text-sm text-neutral-500">
              No paid orders recorded this month.
            </p>
          ) : (
            <div className="space-y-3">
              {data.topItems.map((item, index) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between rounded-xl border-none p-4"
                >
                  <div>
                    <p className="font-semibold text-black/70">
                      {index + 1}. {item._id}
                    </p>
                    <p className="mt-1 text-xs text-black/70">
                      {item.totalQuantity} sold
                    </p>
                  </div>
                  <p className="font-semibold text-black/70">
                    {money(item.totalSales)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </article>
        <article className="glass-card2 rounded-2xl p-6">
          <h3 className="mb-4 font-serif text-xl text-black/80">
            Quick actions
          </h3>
          <div className="space-y-2">
            {[
              ["New order", "/pos"],
              ["Manage menu", "/menu"],
              ["Manage tables", "/tables"],
              ["Order history", "/orders"],
            ].map(([label, path]) => (
              <Link
                key={path}
                to={path}
                className="flex w-full items-center justify-between rounded-lg bg-[#F97316] px-4 py-3 text-xs font-semibold text-white hover:bg-white border hover:border-[#F97316] hover:text-[#F97316]"
              >
                {label}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </article>
      </div>
      <article className="glass-card2 overflow-x-auto rounded-2xl">
        <div className="flex items-center justify-between p-5">
          <h3 className="font-serif text-xl text-black">Recent orders</h3>
          <Link
            to="/orders"
            className="text-xs text-[#F97316] hover:text-black"
          >
            Full history
          </Link>
        </div>
        <table className="w-full min-w-[650px] text-left text-xs">
          <thead className="bg-[#F97316] text-[10px] uppercase tracking-wider text-white">
            <tr>
              <th className="p-4">Order</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Status</th>
              <th className="p-4">Payment</th>
              <th className="p-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.recentOrders.map((order) => (
              <tr key={order._id}>
                <td className="p-4 text-black">{order.orderNumber}</td>
                <td className="p-4 text-black">
                  {order.customer?.name || "Guest"}
                </td>
                <td className="p-4 text-black">{order.status}</td>
                <td className="p-4 text-black">{order.paymentStatus}</td>
                <td className="p-4 text-right font-semibold text-black">
                  {money(order.grandTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </section>
  );
}
