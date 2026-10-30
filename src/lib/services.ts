import { Boxes, CreditCard, ShoppingCart, type LucideIcon } from 'lucide-react';
import type { ServiceId } from '../api/types';

export const DEGRADATION_THRESHOLD = 15;

interface ServiceMeta {
  label: string;
  description: string;
  icon: LucideIcon;
  /** Chart series color; distinct hues that keep contrast on the carbon background. */
  color: string;
}

export const SERVICE_META: Record<ServiceId, ServiceMeta> = {
  INVENTORY: {
    label: 'Inventario',
    description: 'Stock por bodega y reservas',
    icon: Boxes,
    color: '#f5b942',
  },
  ORDERS: {
    label: 'Pedidos',
    description: 'Ciclo de vida de órdenes',
    icon: ShoppingCart,
    color: '#34d399',
  },
  PAYMENTS: {
    label: 'Pagos',
    description: 'Pasarela, reembolsos y validación',
    icon: CreditCard,
    color: '#60a5fa',
  },
};

export const OPERATION_LABELS: Record<string, string> = {
  checkStock: 'Consultar stock',
  reserveStock: 'Reservar stock',
  restockItem: 'Reabastecer',
  createOrder: 'Crear pedido',
  cancelOrder: 'Cancelar pedido',
  getOrderStatus: 'Estado del pedido',
  processPayment: 'Procesar pago',
  refundPayment: 'Reembolsar pago',
  validatePaymentMethod: 'Validar medio de pago',
};

export function isDegraded(errorRate: number): boolean {
  return errorRate > DEGRADATION_THRESHOLD;
}
