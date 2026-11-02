// ==================== USER TYPES ====================
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'agent' | 'admin';
  avatar?: { public_id: string; url: string };
  phone?: string;
  bio?: string;
  isActive: boolean;
  isApproved: boolean;
  favorites?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ==================== PROPERTY TYPES ====================
export interface PropertyImage {
  _id?: string;
  public_id: string;
  url: string;
}

export interface PropertyLocation {
  address: string;
  city: string;
  province?: string;
  country?: string;
  zipCode?: string;
  coordinates?: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
}

export type PropertyType = 'house' | 'apartment' | 'condo' | 'villa' | 'townhouse' | 'land' | 'commercial' | 'office';
export type PropertyStatus = 'sale' | 'rent';

export interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  type: PropertyType;
  status: PropertyStatus;
  bedrooms: number;
  bathrooms: number;
  area?: number;
  yearBuilt?: number;
  garage?: number;
  floors?: number;
  location: PropertyLocation;
  features?: string[];
  amenities?: string[];
  images: PropertyImage[];
  agent: User;
  isFeatured: boolean;
  isApproved: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyFilters {
  keyword?: string;
  city?: string;
  type?: PropertyType | '';
  status?: PropertyStatus | '';
  bedrooms?: string;
  bathrooms?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
}

export interface PropertiesResponse {
  success: boolean;
  count: number;
  total: number;
  pages: number;
  currentPage: number;
  properties: Property[];
}

// ==================== INQUIRY TYPES ====================
export type InquiryStatus = 'pending' | 'read' | 'replied' | 'closed';

export interface Inquiry {
  _id: string;
  property: Property;
  user: User;
  agent: User;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
}

// ==================== FAVORITE TYPES ====================
export interface Favorite {
  _id: string;
  user: string;
  property: Property;
  createdAt: string;
}

// ==================== ANALYTICS TYPES ====================
export interface AnalyticsStats {
  totalUsers: number;
  totalAgents: number;
  totalProperties: number;
  totalInquiries: number;
  pendingAgents: number;
}

export interface ChartDataPoint {
  label: string;
  count: number;
}

export interface TypeStat {
  _id: string;
  count: number;
}

export interface Analytics {
  success: boolean;
  stats: AnalyticsStats;
  monthlyProperties: ChartDataPoint[];
  monthlyUsers: ChartDataPoint[];
  typeStats: TypeStat[];
  recentProperties: Property[];
  recentUsers: User[];
}

// ==================== API RESPONSE TYPES ====================
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  total: number;
  pages: number;
  currentPage?: number;
  data: T[];
}
