import mongoose from "mongoose";
import Category from "../models/Category.js";
import Customer from "../models/Customer.js";
import MenuItem from "../models/MenuItem.js";
import Order from "../models/Order.js";
import Table from "../models/Table.js";


// Error handler, helpers aur Menu routes


const respondError = (res, error) => {
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A record with that value already exists.",
    });
  }

  if (
    error.name === "ValidationError" ||
    error.name === "CastError"
  ) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
};

const validId = (id) => mongoose.Types.ObjectId.isValid(id);

const pick = (body, fields) =>
  Object.fromEntries(
    fields
      .filter((field) => body[field] !== undefined)
      .map((field) => [field, body[field]])
  );

const menuFields = [
  "title",
  "category",
  "price",
  "description",
  "image",
  "isAvailable",
  "isSignature",
];

const categoryFields = ["name", "description", "isActive"];
const tableFields = ["tableNumber", "capacity", "status"];
const customerFields = ["name", "phone", "email"];

// GET all menu items
export const listMenu = async (req, res) => {
  try {
    const items = await MenuItem.find()
      .populate("category")
      .sort({ title: 1 });

    return res.json({ success: true, data: items });
  } catch (error) {
    return respondError(res, error);
  }
};

// CREATE menu item
export const createMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.create(
      pick(req.body, menuFields)
    );

    return res.status(201).json({
      success: true,
      data: await item.populate("category"),
    });
  } catch (error) {
    return respondError(res, error);
  }
};

// UPDATE menu item
export const updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      pick(req.body, menuFields),
      { new: true, runValidators: true }
    ).populate("category");

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found.",
      });
    }

    return res.json({ success: true, data: item });
  } catch (error) {
    return respondError(res, error);
  }
};

// DELETE menu item
export const deleteMenuItem = async (req, res) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid menu item ID.",
      });
    }

    if (await Order.exists({ "items.menuItem": req.params.id })) {
      return res.status(409).json({
        success: false,
        message:
          "This item is used by order history and cannot be deleted. Mark it unavailable instead.",
      });
    }

    const item = await MenuItem.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found.",
      });
    }

    return res.json({ success: true, data: item });
  } catch (error) {
    return respondError(res, error);
  }
};


// Category routes

export const listCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    return res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    return respondError(res, error);
  }
};

export const createCategory = async (req, res) => {
  try {
    const category = await Category.create(
      pick(req.body, categoryFields)
    );

    return res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    return respondError(res, error);
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      pick(req.body, categoryFields),
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    return res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    return respondError(res, error);
  }
};

export const deleteCategory = async (req, res) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID.",
      });
    }

    if (await MenuItem.exists({ category: req.params.id })) {
      return res.status(409).json({
        success: false,
        message:
          "Move or remove this category’s menu items before deleting it.",
      });
    }

    const category = await Category.findByIdAndDelete(
      req.params.id
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    return res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    return respondError(res, error);
  }
};


// Table routes


export const listTables = async (req, res) => {
  try {
    const tables = await Table.find()
      .populate("currentOrder")
      .sort({ tableNumber: 1 });

    return res.json({
      success: true,
      data: tables,
    });
  } catch (error) {
    return respondError(res, error);
  }
};

export const createTable = async (req, res) => {
  try {
    const table = await Table.create(
      pick(req.body, tableFields)
    );

    return res.status(201).json({
      success: true,
      data: table,
    });
  } catch (error) {
    return respondError(res, error);
  }
};

export const updateTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found.",
      });
    }

    const changes = pick(req.body, tableFields);

    if (
      table.currentOrder &&
      (changes.status === "Available" ||
        changes.tableNumber !== undefined)
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Complete the active order before freeing or renumbering this table.",
      });
    }

    Object.assign(table, changes);
    await table.save();

    return res.json({
      success: true,
      data: table,
    });
  } catch (error) {
    return respondError(res, error);
  }
};

export const deleteTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found.",
      });
    }

    if (table.currentOrder || table.status === "Occupied") {
      return res.status(409).json({
        success: false,
        message:
          "Complete the active order before deleting this table.",
      });
    }

    await table.deleteOne();

    return res.json({
      success: true,
      data: table,
    });
  } catch (error) {
    return respondError(res, error);
  }
};

// Customer routes

export const listCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ name: 1 });

    return res.json({
      success: true,
      data: customers,
    });
  } catch (error) {
    return respondError(res, error);
  }
};

export const createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(
      pick(req.body, customerFields)
    );

    return res.status(201).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    return respondError(res, error);
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      pick(req.body, customerFields),
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    return res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    return respondError(res, error);
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(
      req.params.id
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    return res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    return respondError(res, error);
  }
};

// Order routes


export const listOrders = async (req, res) => {
  try {
    const query = {};

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.paymentStatus) {
      query.paymentStatus = req.query.paymentStatus;
    }

    const orders = await Order.find(query)
      .populate("table")
      .sort({ createdAt: -1 })
      .limit(500);

    return res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    return respondError(res, error);
  }
};

export const createOrder = async (req, res) => {
  try {
    const {
      items,
      orderType,
      table: tableId,
      customer = {},
      paymentMethod = "Unassigned",
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Add at least one menu item to the order.",
      });
    }

    if (!["Dine-in", "Takeaway"].includes(orderType)) {
      return res.status(400).json({
        success: false,
        message: "Choose Dine-in or Takeaway.",
      });
    }

    if (!["Cash", "Card", "UPI", "Unassigned"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Choose a valid payment method.",
      });
    }

    let table;

    if (orderType === "Dine-in") {
      if (!tableId || !validId(tableId)) {
        return res.status(400).json({
          success: false,
          message: "Select a valid table for dine-in.",
        });
      }

      table = await Table.findById(tableId);

      if (!table || table.status !== "Available") {
        return res.status(409).json({
          success: false,
          message: "The selected table is not available.",
        });
      }
    }

    const requested = new Map();

    for (const item of items) {
      if (
        !validId(item.menuItem) ||
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Order items must include a valid menu item and positive whole-number quantity.",
        });
      }

      requested.set(
        String(item.menuItem),
        (requested.get(String(item.menuItem)) || 0) +
          Number(item.quantity)
      );
    }

    const menuItems = await MenuItem.find({
      _id: { $in: [...requested.keys()] },
      isAvailable: true,
    });

    if (menuItems.length !== requested.size) {
      return res.status(400).json({
        success: false,
        message: "One or more selected menu items are unavailable.",
      });
    }

    const orderItems = menuItems.map((menuItem) => ({
      menuItem: menuItem._id,
      title: menuItem.title,
      price: menuItem.price,
      quantity: requested.get(String(menuItem._id)),
    }));

    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const taxAmount = Math.round(subtotal * 0.05 * 100) / 100;
    const paid = paymentMethod !== "Unassigned";

    const order = await Order.create({
      orderType,
      ...(table ? { table: table._id } : {}),
      customer: {
        name: customer.name?.trim() || "Guest",
        phone: customer.phone?.trim() || "",
      },
      items: orderItems,
      subtotal,
      taxRate: 0.05,
      taxAmount,
      grandTotal: Math.round((subtotal + taxAmount) * 100) / 100,
      paymentMethod,
      paymentStatus: paid ? "Paid" : "Unpaid",
    });

    if (table) {
      table.status = "Occupied";
      table.currentOrder = order._id;
      await table.save();
    }

    if (customer.name?.trim() && customer.phone?.trim()) {
      await Customer.findOneAndUpdate(
        { phone: customer.phone.trim() },
        {
          $set: {
            name: customer.name.trim(),
            email: customer.email?.trim() || "",
          },
          $inc: {
            totalVisits: 1,
            totalSpent: paid ? order.grandTotal : 0,
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );
    }

    return res.status(201).json({
      success: true,
      data: await order.populate("table"),
    });
  } catch (error) {
    return respondError(res, error);
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const allowed = [
      "Pending",
      "Preparing",
      "Served",
      "Completed",
      "Cancelled",
    ];

    if (!allowed.includes(req.body.status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status.",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (["Completed", "Cancelled"].includes(order.status)) {
      return res.status(409).json({
        success: false,
        message:
          "Completed or cancelled orders cannot be reopened or changed.",
      });
    }

    order.status = req.body.status;
    await order.save();

    if (order.table && ["Completed", "Cancelled"].includes(order.status)) {
      await Table.findByIdAndUpdate(order.table, {
        status: "Available",
        currentOrder: null,
      });
    }

    return res.json({
      success: true,
      data: await order.populate("table"),
    });
  } catch (error) {
    return respondError(res, error);
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    if (!["Paid", "Unpaid"].includes(req.body.paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Payment status must be Paid or Unpaid.",
      });
    }

    const methods = ["Cash", "Card", "UPI"];

    if (
      req.body.paymentStatus === "Paid" &&
      !methods.includes(req.body.paymentMethod)
    ) {
      return res.status(400).json({
        success: false,
        message: "Choose Cash, Card, or UPI to record a payment.",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (
      order.status === "Cancelled" &&
      req.body.paymentStatus === "Paid"
    ) {
      return res.status(409).json({
        success: false,
        message: "A cancelled order cannot be marked as paid.",
      });
    }

    const wasPaid = order.paymentStatus === "Paid";

    order.paymentStatus = req.body.paymentStatus;
    order.paymentMethod =
      req.body.paymentStatus === "Paid"
        ? req.body.paymentMethod
        : "Unassigned";

    await order.save();

    if (
      order.customer.phone &&
      wasPaid !== (order.paymentStatus === "Paid")
    ) {
      await Customer.findOneAndUpdate(
        { phone: order.customer.phone },
        {
          $inc: {
            totalSpent:
              order.paymentStatus === "Paid"
                ? order.grandTotal
                : -order.grandTotal,
          },
        }
      );
    }

    return res.json({
      success: true,
      data: await order.populate("table"),
    });
  } catch (error) {
    return respondError(res, error);
  }
};
