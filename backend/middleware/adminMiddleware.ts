import { Request, Response, NextFunction } from "express"

export const isAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const role = req.role;
    console.log(role)
    if (role !== "admin" ) {
      res.status(403).json({ success: false, message: "Forbidden - Admin access required" })
      return
    }

    next()
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" })
  }
}
