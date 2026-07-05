const express = require ("express");
const authMiddleware = require ('../middlewares/auth.middleware'); 
//const interviewController = require ('../controllers/auth.controller');
const interviewController = require ('../controllers/interview.controller');
const upload = require ('../middlewares/file.middleware');

const interviewRouter = express.Router()

interviewRouter.post(
    "/",
    authMiddleware.authUser,
    (req, res, next) => {
        upload.single("resume")(req, res, (err) => {
            if (err) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(400).json({ message: "File is too large. Max size is 5MB." });
                }
                return res.status(400).json({ message: err.message || "Failed to upload resume." });
            }
            next();
        });
    },
    interviewController.generateInterviewReportController
);

/**
 * @route GET /api/interview/report/:interviewId
 * @description get interview report by interviewId.
 * @access private
 */
interviewRouter.get("/report/:interviewId", authMiddleware.authUser, interviewController.getInterviewReportByIdController)


/**
 * @route GET /api/interview/
 * @description get all interview reports of logged in user.
 * @access private
 */
interviewRouter.get("/", authMiddleware.authUser, interviewController.getAllInterviewReportsController)


/**
 * @route GET /api/interview/resume/pdf
 * @description generate resume pdf on the basis of user self description, resume content and job description.
 * @access private
 */
interviewRouter.post("/resume/pdf/:interviewReportId", authMiddleware.authUser, interviewController.generateResumePdfController)


module.exports = interviewRouter;