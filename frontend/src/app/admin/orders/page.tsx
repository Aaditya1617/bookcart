"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Calendar, ShoppingBag, Eye, Edit, CreditCard } from 'lucide-react'
import BookLoader from "@/lib/BookLoader"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useGetAdminOrdersQuery } from "@/store/adminApi"
import AdminLayout from "@/app/components/admin/AdminLayout"
import { OrderDetailsDialog } from "@/app/account/orders/OrderDetailsDialog"
import Pagination from "@/constant/pagination"
import { OrderEditForm } from "@/app/components/admin/OrderEditForm"
import { OrderPaymentDialog } from "@/app/components/admin/OrderPaymentDialog"

export default function AdminOrdersPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filters, setFilters] = useState({
    status: "",
    paymentStatus: "",
    startDate: "",
    endDate: "",
    search: "",
  })
  const [editingOrder, setEditingOrder] = useState<any>(null)
  const [paymentOrder, setPaymentOrder] = useState<any>(null)
  const router = useRouter()

  // Fetch all orders with RTK Query (no pagination params)
  const { data: ordersData, isLoading: isOrdersLoading } = useGetAdminOrdersQuery(filters)

  // Get all orders from the API response
  const allOrders = ordersData?.data?.orders || []
  
  // Search functionality
  const filteredOrders = useMemo(() => {
    if (!filters.search) return allOrders
    
    const searchTerm = filters.search.toLowerCase()
    return allOrders.filter((order: any) => {
      return (
        order._id.toLowerCase().includes(searchTerm) ||
        (order.user?.name && order.user.name.toLowerCase().includes(searchTerm))
      )
    })
  }, [allOrders, filters.search])

  // Calculate pagination
  const totalItems = filteredOrders.length
  const totalPages = Math.ceil(totalItems / pageSize)
  
  // Get current page items
  const currentOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredOrders.slice(startIndex, startIndex + pageSize)
  }, [filteredOrders, currentPage, pageSize])

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const resetFilters = () => {
    setFilters({
      status: "",
      paymentStatus: "",
      startDate: "",
      endDate: "",
      search: "",
    })
    setCurrentPage(1)
  }

  const handleCloseEditDialog = () => {
    setEditingOrder(null)
  }

  const handleClosePaymentDialog = () => {
    setPaymentOrder(null)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Orders Management</h1>
        </div>

        {/* Filters */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filters
            </CardTitle>
            <CardDescription>Filter orders by various criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Order Status</label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Status</label>
                <Select
                  value={filters.paymentStatus}
                  onValueChange={(value) => handleFilterChange("paymentStatus", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Payment Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search order ID or customer"
                    className="pl-8"
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="date"
                    className="pl-8"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange("startDate", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="date"
                    className="pl-8"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange("endDate", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-end space-x-2">
                <Button variant="outline" className="flex-1" onClick={resetFilters}>
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Orders
            </CardTitle>
            <CardDescription>
              Showing {currentOrders.length} of {totalItems} orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isOrdersLoading ? (
              <div className="flex justify-center py-10">
                <BookLoader />
              </div>
            ) : currentOrders.length === 0 ? (
              <div className="text-center py-10">
                <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No orders found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or search criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentOrders.map((order: any) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium">#{order._id.slice(-6)}</TableCell>
                        <TableCell>{order.user ? order.user.name : "Unknown"}</TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>₹{order.totalAmount}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              order.status === "delivered"
                                ? "bg-green-100 text-green-800"
                                : order.status === "processing"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : order.status === "shipped"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-red-100 text-red-800"
                            }`}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              order.paymentStatus === "completed"
                                ? "bg-green-100 text-green-800"
                                : order.paymentStatus === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <OrderDetailsDialog order={order} />

                            <Button variant="outline" size="sm" onClick={() => setEditingOrder(order)}>
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>

                            <Button variant="outline" size="sm" onClick={() => setPaymentOrder(order)}>
                              <CreditCard className="h-4 w-4 mr-1" />
                              Pay Seller
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Custom Pagination */}
            {!isOrdersLoading && currentOrders.length > 0 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Order Dialog */}
      {editingOrder && (
        <Dialog open={!!editingOrder} onOpenChange={(open) => !open && handleCloseEditDialog()}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-purple-700">Edit Order</DialogTitle>
            </DialogHeader>
            <OrderEditForm order={editingOrder} onClose={handleCloseEditDialog} />
          </DialogContent>
        </Dialog>
      )}

      {/* Payment Dialog */}
      {paymentOrder && (
        <Dialog open={!!paymentOrder} onOpenChange={(open) => !open && handleClosePaymentDialog()}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-purple-700">Process Seller Payment</DialogTitle>
            </DialogHeader>
            <OrderPaymentDialog order={paymentOrder} onClose={handleClosePaymentDialog} />
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  )
}
