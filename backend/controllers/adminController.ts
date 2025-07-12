import { Request, Response } from "express"
import User from "../models/User"
import SellerPayment from "../models/SellerPayment"
import Products from "../models/Products"
import ProductOrder from "../models/ProductOrder"
import { response } from "../utils/responseHandler"

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { status, paymentStatus, startDate, endDate } = req.query

    const paidOrderRecords = await SellerPayment.find().select("order")
    const paidOrderIds = paidOrderRecords.map((record) => record.order.toString())

    // Build query
    const query: any = {
      paymentStatus: "completed",
      _id: { $nin: paidOrderIds },
    }

    // Filter by status
    if (status) {
      query.status = status
    }

    query.paymentStatus = paymentStatus || "completed"

    // Filter by date range
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      }
    }

    // Execute the query without pagination
    const orders = await ProductOrder.find(query)
      .populate({
        path: "items.product",
        populate: {
          path: "seller",
          select: "name email phoneNumber paymentMode paymentDetails",
        },
      })
      .populate("user", "name email")
      .populate("shippingAddress")
      .sort({ createdAt: -1 })

    response(res, 200, "Orders fetched successfully", { orders })
  } catch (error) {
    console.error("Error fetching orders:", error)
    response(res, 500, "Failed to fetch orders")
  }
}



// Update order status and details
export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status, paymentStatus ,notes} = req.body

    const order = await ProductOrder.findById(id)

    if (!order) {
      return response(res, 404, "Order not found")
    }

    // Update fields if provided
    if (status) order.status = status
    if (paymentStatus) order.paymentStatus = paymentStatus
    if(notes) order.notes=notes;

    await order.save()

    response(res, 200, "Order updated successfully", order)
  } catch (error) {
    console.error("Error updating order:", error)
    response(res, 500, "Failed to update order")
  }
}

// Process payment to seller
export const processSellerPayment = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params
    const { productId, paymentMethod, amount, notes } = req.body
    const user = req.id as any

    // Validate required fields
    if (!productId || !paymentMethod || !amount) {
      return response(res, 400, "Missing required fields: productId, paymentMethod, amount")
    }

    const order = await ProductOrder.findById(orderId).populate({
      path: "items.product",
      populate: {
        path: "seller",
      },
    })

    if (!order) {
      return response(res, 404, "Order not found")
    }

    // Find the specific product in the order
    const orderItem = order.items.find((item) => (item.product as any)._id.toString() === productId)
      console.log(orderItem)
    if (!orderItem) {
      return response(res, 404, "Product not found in this order")
    }

    // Create a new seller payment record
    const sellerPayment = new SellerPayment({
      seller: (orderItem.product as any).seller._id,
      order: orderId,
      product: productId,
      amount,
      paymentMethod,
      status: "completed",
      processedBy: user,
      notes,
    })

    await sellerPayment.save()
   console.log('this is seller',sellerPayment)
    response(res, 200, "Payment to seller processed successfully", sellerPayment)
  } catch (error) {
    console.error("Error processing seller payment:", error)
    response(res, 500, "Failed to process seller payment")
  }
}



// Get dashboard statistics
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Run queries in parallel using Promise.all
    const [totalOrders, totalUsers, totalProducts, statusCounts, recentOrders, revenue, monthlySales] =
      await Promise.all([
        // Get counts
        ProductOrder.countDocuments().lean(),
        User.countDocuments().lean(),
        Products.countDocuments().lean(),

        // Get orders by status in a single query
        ProductOrder.aggregate([
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ]),

        // Get recent orders
        ProductOrder.find()
          .select("user totalAmount status createdAt")
          .populate("user", "name")
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),

        // Calculate revenue
        ProductOrder.aggregate([
          { $match: { paymentStatus: "completed" } },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),

        // Get monthly sales data for chart
        ProductOrder.aggregate([
          { $match: { paymentStatus: "completed" } },
          {
            $group: {
              _id: {
                month: { $month: "$createdAt" },
                year: { $year: "$createdAt" },
              },
              total: { $sum: "$totalAmount" },
              count: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]),
      ])

    // Process status counts
    const ordersByStatus = {
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    }

    statusCounts.forEach((item: any) => {
      const status = item._id as keyof typeof ordersByStatus;
      if (ordersByStatus.hasOwnProperty(status)) {
        ordersByStatus[status] = item.count;
      }
    });
    
    

    response(res, 200, "Dashboard statistics fetched successfully", {
      counts: {
        orders: totalOrders,
        users: totalUsers,
        products: totalProducts,
        revenue: revenue.length > 0 ? revenue[0].total : 0,
      },
      ordersByStatus,
      recentOrders,
      monthlySales,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    response(res, 500, "Failed to fetch dashboard statistics")
  }
}



// Add this new function to get all seller payments
export const getSellerPayments = async (req: Request, res: Response) => {
  try {
    const { sellerId, status, paymentMethod, startDate, endDate } = req.query

    // Build the query
    const query: any = {}

    // Filter by seller
    if (sellerId && sellerId !== "all") {
      query.seller = sellerId
    }

    // Filter by status
    if (status && status !== "all") {
      query.status = status
    }

    // Filter by payment method
    if (paymentMethod && paymentMethod !== "all") {
      query.paymentMethod = paymentMethod
    }

    // Filter by date range
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      }
    }

    // Execute the query without pagination
    const payments = await SellerPayment.find(query)
      .populate("seller", "name email phoneNumber paymentMode paymentDetails")
      .populate("order")
      .populate("product", "subject finalPrice images")
      .populate("processedBy", "name")
      .sort({ createdAt: -1 })
      const users= await User.find();

    response(res, 200, "Seller payments fetched successfully", { payments,users })
  } catch (error) {
    console.error("Error fetching seller payments:", error)
    response(res, 500, "Failed to fetch seller payments")
  }
}
