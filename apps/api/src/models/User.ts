import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '@vietcraft/shared';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password?: string;
  passwordHash?: string;
  role: UserRole;
  avatar?: string;
  refreshTokenHash?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    password: {
      type: String,
      select: false
    },
    passwordHash: {
      type: String,
      select: false
    },
    role: {
      type: String,
      enum: ['admin', 'editor'],
      default: 'editor'
    },
    avatar: {
      type: String,
      default: ''
    },
    refreshTokenHash: {
      type: String,
      select: false
    },
    lastLoginAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

UserSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  const hash = this.password || this.passwordHash;
  if (!hash || typeof hash !== 'string' || typeof candidatePassword !== 'string') {
    return false;
  }
  try {
    return await bcrypt.compare(candidatePassword, hash);
  } catch {
    return false;
  }
};

export const User: Model<IUserDocument> = mongoose.model<IUserDocument>('User', UserSchema);
