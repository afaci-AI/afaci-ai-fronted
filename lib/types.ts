export type UserRole = 'admin' | 'editor' | 'viewer'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  isActive: boolean
  createdAt: string
  lastLoginAt?: string
}

type Permission = 'canEditProducts' | 'canManageDictionaries' | 'canManageUsers'

const rolePermissions: Record<UserRole, Permission[]> = {
  admin:  ['canEditProducts', 'canManageDictionaries', 'canManageUsers'],
  editor: ['canEditProducts', 'canManageDictionaries'],
  viewer: [],
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false
}

export interface Category {
  id: string
  name: string
}

export interface Subcategory {
  id: string
  name: string
  category_id: string
}

export interface Region {
  id: string
  name: string
}

export interface Unit {
  id: string
  name: string
}

export interface NutrientType {
  id: string
  name: string
}

export interface NutrientName {
  id: string
  name: string
  nutrient_type_id: string
}

export interface Product {
  id: string
  name: string
  category_id: string
  subcategory_id?: string
  region_id: string
}

export interface Nutrient {
  id: string
  product_id: string
  nutrient_name_id: string
  unit_id: string
  quantity: number
}

// Extended types
export interface ProductWithRelations extends Product {
  category: Category
  subcategory?: Subcategory
  region: Region
}

export interface NutrientWithRelations extends Nutrient {
  nutrient_name: NutrientName
  nutrient_type: NutrientType
  unit: Unit
}

// API response helpers
export type SimpleCreate = { name: string }
export type SimpleUpdate = { name?: string }

export type ProductCreate = {
  name: string
  category_id: string
  subcategory_id?: string
  region_id: string
}

export type ProductUpdate = {
  name?: string
  category_id?: string
  subcategory_id?: string
  region_id?: string
}

export type NutrientCreate = {
  product_id: string
  nutrient_name_id: string
  unit_id: string
  quantity: number
}

export type NutrientUpdate = {
  product_id?: string
  nutrient_name_id?: string
  unit_id?: string
  quantity?: number
}