const {
  validateResumeDataMiddleware,
  validateJobDetailsMiddleware,
  validateGenerationOptionsMiddleware
} = require('../middleware/validation');

module.exports = app => {
  const coverletters = require("../controllers/coverLetter.controller.js");
  const router = require("express").Router();

  router.post("/", coverletters.create);

  router.post("/generate", [
    validateResumeDataMiddleware,
    validateJobDetailsMiddleware,
    validateGenerationOptionsMiddleware
  ], coverletters.generate);

  router.get("/", coverletters.findAll);

  router.get("/:id", coverletters.findOne);

  router.put("/:id", coverletters.update);

  router.delete("/:id", coverletters.delete);

  app.use("/api/cover-letter", router);
}; 