import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET!;

export function generateToken(user: { id: string; email: string }) {
    return jwt.sign({ id: user.id, email: user.email }, SECRET_KEY,
        { expiresIn: "1h" });
};

export function verifyToken(token: string) {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (err) {
        return null;
    }
}