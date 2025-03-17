module.exports = app => {
  const resumes = require("../controllers/resume.controller.js");
  const router = require("express").Router();

  router.post("/", resumes.createResume);

  router.get("/", resumes.getAllResumes);

  router.get("/:id", resumes.getResumeById);

  router.put("/:id", resumes.updateResume);

  router.delete("/:id", resumes.deleteResume);

  app.use("/api/resumes", router);
}; 