module.exports = app => {
  const jobFit = require("../controllers/jobFit.controller.js");
  const router = require("express").Router();

  router.get("/:coverLetterId", jobFit.getJobFitScore);

  app.use("/api/job-fit-score", router);
}; 