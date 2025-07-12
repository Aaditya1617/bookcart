"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Calendar, CreditCard, Eye, Download, FileText } from "lucide-react"
import BookLoader from "@/lib/BookLoader"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useGetSellerPaymentsQuery } from "@/store/adminApi"
import Image from "next/image"
import AdminLayout from "@/app/components/admin/AdminLayout"
import Pagination from "@/constant/pagination"

export default function AdminPaymentsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filters, setFilters] = useState({
    sellerId: "",
    status: "",
    paymentMethod: "",
    startDate: "",
    endDate: "",
    search: "",
  })
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const router = useRouter()

  // Fetch all payments with RTK Query (no pagination params)
  const { data: paymentsData, isLoading: isPaymentsLoading } = useGetSellerPaymentsQuery(filters)

  // Get all payments from the API response
  const allPayments = paymentsData?.data?.payments || []
  const sellers = paymentsData?.data?.users || []

  // Search functionality
  const filteredPayments = useMemo(() => {
    if (!filters.search) return allPayments

    const searchTerm = filters.search.toLowerCase()
    return allPayments.filter((payment: any) => {
      return (
        (payment.transactionId && payment.transactionId.toLowerCase().includes(searchTerm)) ||
        (payment.notes && payment.notes.toLowerCase().includes(searchTerm)) ||
        (payment.seller?.name && payment.seller.name.toLowerCase().includes(searchTerm)) ||
        (payment.product?.subject && payment.product.subject.toLowerCase().includes(searchTerm))
      )
    })
  }, [allPayments, filters.search])

  // Calculate pagination
  const totalItems = filteredPayments.length
  const totalPages = Math.ceil(totalItems / pageSize)

  // Get current page items
  const currentPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredPayments.slice(startIndex, startIndex + pageSize)
  }, [filteredPayments, currentPage, pageSize])

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const resetFilters = () => {
    setFilters({
      sellerId: "",
      status: "",
      paymentMethod: "",
      startDate: "",
      endDate: "",
      search: "",
    })
    setCurrentPage(1)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-800">Seller Payments</h1>

        {/* Filters */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filters
            </CardTitle>
            <CardDescription>Filter seller payments by various criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Seller</label>
                <Select value={filters.sellerId} onValueChange={(value) => handleFilterChange("sellerId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Sellers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sellers</SelectItem>
                    {sellers.map((seller: any) => (
                      <SelectItem key={seller._id} value={seller._id}>
                        {seller.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Status</label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Method</label>
                <Select
                  value={filters.paymentMethod}
                  onValueChange={(value) => handleFilterChange("paymentMethod", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search transaction ID or notes"
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

        {/* Payments Table */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              Seller Payments
            </CardTitle>
            <CardDescription>
              Showing {currentPayments.length} of {totalItems} payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isPaymentsLoading ? (
              <div className="flex justify-center py-10">
                <BookLoader />
              </div>
            ) : currentPayments.length === 0 ? (
              <div className="text-center py-10">
                <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No payments found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or search criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Seller</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentPayments.map((payment: any) => (
                      <TableRow key={payment._id}>
                        <TableCell>{payment.seller?.name || "Unknown"}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          <div className="flex items-center space-x-2">
                            {payment.product?.images && payment.product.images[0] && (
                              <Image
                                src={payment.product.images[0] || "/placeholder.svg"}
                                alt={payment.product.subject}
                                width={30}
                                height={30}
                                className="rounded-md"
                              />
                            )}
                            <span className="truncate">{payment.product?.subject || "Unknown Product"}</span>
                          </div>
                        </TableCell>
                        <TableCell>₹{payment.amount}</TableCell>
                        <TableCell>{payment.paymentMethod}</TableCell>
                        <TableCell>{formatDate(payment.createdAt)}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              payment.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : payment.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm" onClick={() => setSelectedPayment(payment)}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-1" />
                              Receipt
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
            {!isPaymentsLoading && currentPayments.length > 0 && (
              <div className="mt-6">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Details Dialog */}
      {selectedPayment && (
        <Dialog open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-purple-700">Payment Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg">
                <h3 className="font-semibold text-lg text-purple-800 mb-2">Transaction Information</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium text-gray-500">Transaction ID:</div>
                  <div className="text-sm">{selectedPayment.transactionId}</div>

                  <div className="text-sm font-medium text-gray-500">Amount:</div>
                  <div className="text-sm">₹{selectedPayment.amount}</div>

                  <div className="text-sm font-medium text-gray-500">Payment Method:</div>
                  <div className="text-sm">{selectedPayment.paymentMethod}</div>

                  <div className="text-sm font-medium text-gray-500">Status:</div>
                  <div className="text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        selectedPayment.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : selectedPayment.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                    </span>
                  </div>

                  <div className="text-sm font-medium text-gray-500">Date:</div>
                  <div className="text-sm">{formatDate(selectedPayment.createdAt)}</div>

                  <div className="text-sm font-medium text-gray-500">Processed By:</div>
                  <div className="text-sm">{selectedPayment.processedBy?.name || "Unknown"}</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-100 to-cyan-100 p-4 rounded-lg">
                <h3 className="font-semibold text-lg text-blue-800 mb-2">Seller Information</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium text-gray-500">Name:</div>
                  <div className="text-sm">{selectedPayment.seller?.name || "Unknown"}</div>

                  <div className="text-sm font-medium text-gray-500">Email:</div>
                  <div className="text-sm">{selectedPayment.seller?.email || "Unknown"}</div>

                  <div className="text-sm font-medium text-gray-500">Phone:</div>
                  <div className="text-sm">{selectedPayment.seller?.phoneNumber || "Not provided"}</div>

                  <div className="text-sm font-medium text-gray-500">Payment Mode:</div>
                  <div className="text-sm">{selectedPayment.seller?.paymentMode || "Not specified"}</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-100 to-teal-100 p-4 rounded-lg">
                <h3 className="font-semibold text-lg text-green-800 mb-2">Product & Order Information</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium text-gray-500">Product:</div>
                  <div className="text-sm">{selectedPayment.product?.subject || "Unknown"}</div>

                  <div className="text-sm font-medium text-gray-500">Price:</div>
                  <div className="text-sm">₹{selectedPayment.product?.finalPrice || "Unknown"}</div>

                  <div className="text-sm font-medium text-gray-500">Order ID:</div>
                  <div className="text-sm">#{selectedPayment.order?._id?.slice(-6) || "Unknown"}</div>
                </div>
              </div>

              {selectedPayment.notes && (
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg text-yellow-800 mb-2">Notes</h3>
                  <p className="text-sm">{selectedPayment.notes}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  )
}
