import { User } from "../entities/user.js";

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  incrementTokenVersion(userId: string): Promise<void>;
}