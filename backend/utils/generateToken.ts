import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

export const generateToken = (user:IUser): string => {
  return jwt.sign({ userId:user?._id,role:user?.role }, process.env.JWT_SECRET as string, { expiresIn: '1d' });
};
