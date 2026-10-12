
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  listMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listTables,
  createTable,
  updateTable,
  deleteTable,
  listCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  listOrders,
  createOrder,
  updateOrderStatus,
  updatePaymentStatus,
} from "../controllers/resourceController.js";

import createCrudRoutes from "./createCrudRoutes.js";

const router = express.Router();

router.use(protect);

router.use(
  "/menu",
  createCrudRoutes({
    list: listMenu,
    create: createMenuItem,
    update: updateMenuItem,
    remove: deleteMenuItem,
  })
);

router.use(
  "/categories",
  createCrudRoutes({
    list: listCategories,
    create: createCategory,
    update: updateCategory,
    remove: deleteCategory,
  })
);

router.use(
  "/tables",
  createCrudRoutes({
    list: listTables,
    create: createTable,
    update: updateTable,
    remove: deleteTable,
  })
);

router.use(
  "/customers",
  createCrudRoutes({
    list: listCustomers,
    create: createCustomer,
    update: updateCustomer,
    remove: deleteCustomer,
  })
);

// Orders have custom status and payment routes
router.get("/orders", listOrders);
router.post("/orders", createOrder);
router.patch("/orders/:id/status", updateOrderStatus);
router.patch("/orders/:id/payment", updatePaymentStatus);

export default router;
