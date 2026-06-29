import { IncomingMessage } from 'http';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.API_JWT_SECRET as string;

export function verifyJWT(req: IncomingMessage): {
  valid: boolean;
  payload?: any;
} {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false };
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, payload: decoded };
  } catch (e) {
    return { valid: false };
  }
}
