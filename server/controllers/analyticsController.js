import Order from "../models/Order.js";

export const getDashboardAnalytics = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const dailyStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today },
          paymentStatus: "Paid",
          status: { $ne: "Cancelled" },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$grandTotal" },
          count: { $sum: 1 },
        },
      },
    ]);

    const monthlyStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: firstDayOfMonth },
          paymentStatus: "Paid",
          status: { $ne: "Cancelled" },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$grandTotal" },
          count: { $sum: 1 },
        },
      },
    ]);

    const topItems = await Order.aggregate([
      {
        $match: {
          paymentStatus: "Paid",
          status: { $ne: "Cancelled" },
          createdAt: { $gte: firstDayOfMonth },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.title",
          totalQuantity: { $sum: "$items.quantity" },
          totalSales: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
    ]);

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("table");
    const activeCustomers = await Order.distinct("customer.phone", {
      paymentStatus: "Paid",
      status: { $ne: "Cancelled" },
      createdAt: { $gte: today },
      "customer.phone": { $ne: "" },
    });

    res.json({
      success: true,
      data: {
        dailyRevenue: dailyStats[0]?.totalRevenue || 0,
        dailyOrders: dailyStats[0]?.count || 0,
        monthlyRevenue: monthlyStats[0]?.totalRevenue || 0,
        monthlyOrders: monthlyStats[0]?.count || 0,
        activeCustomers: activeCustomers.length,
        topItems,
        recentOrders,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSalesReport = async (req, res) => {
  try {
    const period = req.query.period === "day" ? "day" : "month";
    const now = new Date();
    const start =
      period === "day"
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
        : new Date(now.getFullYear(), now.getMonth(), 1);
    const orders = await Order.find({
      createdAt: { $gte: start },
      paymentStatus: "Paid",
      status: { $ne: "Cancelled" },
    })
      .sort({ createdAt: -1 })
      .select(
        "orderNumber orderType customer items subtotal taxAmount grandTotal paymentMethod createdAt",
      );
    const summary = orders.reduce(
      (result, order) => {
        result.revenue += order.grandTotal;
        result.subtotal += order.subtotal;
        result.tax += order.taxAmount;
        result.byPayment[order.paymentMethod] =
          (result.byPayment[order.paymentMethod] || 0) + order.grandTotal;
        return result;
      },
      { revenue: 0, subtotal: 0, tax: 0, byPayment: {} },
    );
    res.json({
      success: true,
      data: { period, start, count: orders.length, ...summary, orders },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
