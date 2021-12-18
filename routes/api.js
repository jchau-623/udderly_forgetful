const express = require("express");
const router = express.Router();
const db = require("../db/models");

// router.use(express.json());
const {
  csrfProtection,
  asyncHandler,
  userValidators,
  loginValidators,
} = require("./utils");
const { check, validationResult } = require("express-validator");

router.post(
  "/lists",
  asyncHandler(async (req, res) => {
    const { description, listId } = req.body;
    const { userId } = req.session.auth;

    const task = await db.Task.create({ description, userId, listId });
    res.end();
  })
);
router.get(
  "/tasks",
  asyncHandler(async (req, res, next) => {
    const { userId } = req.session.auth;
    const tasks = await db.Task.findAll({
      where: { userId },
    });
    console.log(JSON.stringify(tasks, null, 4));
    if (tasks) {
      res.json(tasks);
    } else {
      res.json({ message: "Failed" });
    }
  })
);
router.post(
  "/tasks",
  asyncHandler(async (req, res) => {
    const { description, listId } = req.body;
    const { userId } = req.session.auth;
    // console.log("============", listId);
    const task = await db.Task.create({
      description,
      listId,
      userId,
    });
    res.json({ message: "Success", task: { id: task.id } });
  })
);
router.delete("/tasks/:id(\\d+)", async (req, res, next) => {
  // const { userId } = req.session.auth;
  console.log(">>>>>>>>>>>>>", req.params.id);
  const task = await db.Task.findByPk(req.params.id);
  console.log("<><><><><><><><>", task);
  if (task) {
    await task.destroy();
    res.json({ message: "Destroyed" });
  } else {
    res.json({ message: "Failed" });
  }
});

router.get(
  "/lists/:id",
  asyncHandler(async (req, res, next) => {
    const tasks = await db.Task.findAll({
      where: {
        listId: req.params.id,
      },
    });
    if (tasks) {
      res.json(tasks);
    } else {
      res.json({ message: "Failed" });
    }
  })
);
module.exports = router;