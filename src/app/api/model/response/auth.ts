// AUTH RESPONSE

export interface UserResponse {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  jobTitle: string | null;
  industry: string | null;
  role: string;
  createdAt: Date;
}

export interface AuthResponse {
  success: boolean;
  message: string;
}

export interface LoginResponse extends AuthResponse {
  user?: UserResponse;
}

export interface SignupResponse extends AuthResponse {
  user?: UserResponse;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// Helper to build a safe UserResponse from a Prisma User
export function toUserResponse(user: {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  jobTitle: string | null;
  industry: string | null;
  role: string;
  createdAt: Date;
}): UserResponse {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image,
    jobTitle: user.jobTitle,
    industry: user.industry,
    role: user.role,
    createdAt: user.createdAt,
  };
}
