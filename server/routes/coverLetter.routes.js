module.exports = app => {
  const coverLetters = require("../controllers/coverLetter.controller.js");
  const router = require("express").Router();

  router.post("/", coverLetters.create);

  router.post("/generate", coverLetters.generate);

  router.get("/", coverLetters.findAll);

  router.get("/:id", coverLetters.findOne);

  router.put("/:id", coverLetters.update);

  router.delete("/:id", coverLetters.delete);

  app.use("/api/cover-letters", router);
}; 