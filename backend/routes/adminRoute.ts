import express from "express"
import * as adminController from "../controllers/adminController"
import { isAdmin } from "../middleware/adminMiddleware"
import { authenticateUser } from "../middleware/authMiddleware"

const router = express.Router()

router.get("/dashboard-stats", adminController.getDashboardStats)
// Apply both middlewares to all admin routes
router.use(authenticateUser, isAdmin)

// Order management
router.get("/orders", adminController.getAllOrders)
router.put("/orders/:id", adminController.updateOrder)

// Seller payment management
router.post("/process-seller-payment/:orderId", adminController.processSellerPayment)
router.get("/seller-payments", adminController.getSellerPayments) 

// Dashboard statistics

export default router

