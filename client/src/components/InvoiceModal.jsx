import React from "react";
import { X, Printer, CheckCircle } from "lucide-react";

const InvoiceModal = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="invoice-overlay fixed inset-0 bg-[#F97316]/10 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="invoice-print bg-white text-[#1F2937] w-full max-w-md rounded-2xl p-8 shadow-2xl border border-amberGold-500/30 print:shadow-none print:w-full print:max-w-none">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 print:hidden">
          <div
            className={`flex items-center gap-2 text-xs font-semibold ${order.paymentStatus === "Paid" ? "text-emerald-600" : "text-amber-700"}`}
          >
            <CheckCircle className="w-4 h-4" />{" "}
            {order.paymentStatus === "Paid"
              ? "Payment Completed"
              : "Payment Pending"}
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-black"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Header */}
        <div className="text-center border-b border-neutral-300 pb-6 mb-6">
          <h2 className="font-serif text-2xl font-bold tracking-tight text-[#F97316]">
          CAFE KURO
          </h2>
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 mt-1">
            High-End Coffee & Confectionery
          </p>
          <p className="text-xs text-neutral-600 mt-0.5">
            742 Fifth Avenue, New Delhi, India
          </p>
        </div>

        {/* Details */}
        <div className="text-xs space-y-1.5 border-b border-neutral-200 pb-4 mb-4 text-neutral-700">
          <div className="flex justify-between">
            <span>Invoice Ref:</span>
            <span className="font-semibold text-[#1F2937]">
              {order.orderNumber}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>
              {new Date(order.createdAt || Date.now()).toLocaleDateString(
                "en-US",
                { dateStyle: "medium" },
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Service Type:</span>
            <span className="font-medium">
              {order.orderType} {order.table ? `(Table ${order.table})` : ""}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Guest Name:</span>
            <span className="font-medium">{order.customerName || "Guest"}</span>
          </div>
        </div>

        {/* Itemized Table */}
        <table className="w-full text-xs mb-6">
          <thead>
            <tr className="border-b border-obsidian-900 text-left uppercase text-[10px] tracking-wider">
              <th className="py-2">Item</th>
              <th className="py-2 text-center">Qty</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {order.items.map((item, idx) => (
              <tr key={idx}>
                <td className="py-2 font-medium">{item.title}</td>
                <td className="py-2 text-center">{item.quantity}</td>
                <td className="py-2 text-right font-medium">
                  ${(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="border-t border-obsidian-900 pt-4 space-y-1.5 text-xs mb-6">
          <div className="flex justify-between text-neutral-600">
            <span>Subtotal</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-neutral-600">
            <span>Tax (5% VAT)</span>
            <span>${Number(order.tax ?? order.taxAmount ?? 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-serif text-lg font-bold text-obsidian-900 pt-2 border-t border-neutral-300">
            <span>
              {order.paymentStatus === "Paid" ? "Total Paid" : "Total Due"}
            </span>
            <span className="text-amberGold-600">
              ${order.grandTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 print:hidden">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
          >
            Close
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 py-2.5 rounded-xl bg-obsidian-900 text-amberGold-400 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-black"
          >
            <Printer className="w-4 h-4" /> Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
