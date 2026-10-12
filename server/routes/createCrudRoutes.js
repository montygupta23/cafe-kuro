
import express from "express";

export default function createCrudRoutes({
  list,
  create,
  update,
  remove,
}) {
  const router = express.Router();

  router.get("/", list);
  router.post("/", create);
  router.put("/:id", update);
  router.delete("/:id", remove);

  return router;
}
