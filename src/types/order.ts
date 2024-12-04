export interface OrderStatus {
  status: 'PENDING' | 'ACCEPTED' | 'DELIVERED' | 'CANCELLED'
  date: Date
}

export interface Customization {
  fries: string
  vegetables: Record<string, boolean>
  sauces: Record<string, boolean>
}

export interface OrderItem {
  productId: string
  productName: string
  price: number
  quantity: number
  customizations: Customization
}

export interface Order {
  id: number
  address: string
  alternativeIngredients: boolean
  dni: string
  cellphone: string
  paymentMethod: string
  reference: string
  statusHistory: OrderStatus[]
  items: OrderItem[]
  subtotal: number
  shippingCost: number
  termsAccepted: boolean
  total: number
  createdAt: Date
}
