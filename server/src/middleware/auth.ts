import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
        console.log('No token provided');
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.JWT_SECRET as string, async (err, decoded: any) => {
        if (err) {
            console.log('JWT verification error:', err.message);
            return res.sendStatus(403);
        }
        if (!decoded) {
            console.log('No decoded token');
            return res.sendStatus(403);
        }

        try {
            const userId = decoded.id || decoded.userId || decoded._id;
            const user = await User.findById(userId);
            
            if (!user) {
                console.log('User not found for id:', userId);
                return res.sendStatus(403);
            }

            req.user = { 
                userId: user._id, 
                role: user.role || 'user' 
            };
            next();
        } catch (error) {
            console.error('Auth middleware error:', error);
            return res.sendStatus(500);
        }
    });
};