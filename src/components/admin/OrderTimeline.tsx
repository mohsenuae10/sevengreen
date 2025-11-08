import { Package, Truck, CheckCircle, Clock, Box } from 'lucide-react';
import { format } from 'date-fns';

type OrderStatus = 'pending' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled';

interface TimelineStep {
  status: OrderStatus;
  label: string;
  icon: typeof Clock;
  completed: boolean;
  active: boolean;
  timestamp?: string;
  color: string;
  bgColor: string;
}

interface OrderTimelineProps {
  currentStatus: OrderStatus;
  createdAt: string;
  packedAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  updatedAt?: string;
}

export const OrderTimeline = ({ 
  currentStatus, 
  createdAt, 
  packedAt, 
  shippedAt, 
  deliveredAt,
  updatedAt 
}: OrderTimelineProps) => {
  const statusOrder: OrderStatus[] = ['pending', 'processing', 'packed', 'shipped', 'delivered'];
  const currentIndex = statusOrder.indexOf(currentStatus);

  const getStepData = (status: OrderStatus, index: number): TimelineStep => {
    const isCompleted = index < currentIndex || (index === currentIndex && currentStatus !== 'pending');
    const isActive = index === currentIndex;
    
    let timestamp: string | undefined;
    switch (status) {
      case 'pending':
      case 'processing':
        timestamp = createdAt;
        break;
      case 'packed':
        timestamp = packedAt || undefined;
        break;
      case 'shipped':
        timestamp = shippedAt || undefined;
        break;
      case 'delivered':
        timestamp = deliveredAt || undefined;
        break;
    }

    const configs = {
      pending: { 
        label: 'معلق', 
        icon: Clock, 
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100 border-yellow-300'
      },
      processing: { 
        label: 'قيد المعالجة', 
        icon: Package, 
        color: 'text-blue-600',
        bgColor: 'bg-blue-100 border-blue-300'
      },
      packed: { 
        label: 'مُجهز للشحن', 
        icon: Box, 
        color: 'text-purple-600',
        bgColor: 'bg-purple-100 border-purple-300'
      },
      shipped: { 
        label: 'تم الشحن', 
        icon: Truck, 
        color: 'text-orange-600',
        bgColor: 'bg-orange-100 border-orange-300'
      },
      delivered: { 
        label: 'تم التوصيل', 
        icon: CheckCircle, 
        color: 'text-green-600',
        bgColor: 'bg-green-100 border-green-300'
      }
    };

    return {
      status,
      ...configs[status],
      completed: isCompleted,
      active: isActive,
      timestamp
    };
  };

  const steps = statusOrder.map((status, index) => getStepData(status, index));

  if (currentStatus === 'cancelled') {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
        <div className="flex items-center justify-center gap-3 text-red-600">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div className="text-right">
            <h3 className="text-lg font-bold">تم إلغاء الطلب</h3>
            {updatedAt && (
              <p className="text-sm text-red-500">
                {format(new Date(updatedAt), 'dd/MM/yyyy - HH:mm')}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative py-8">
      <div className="flex items-center justify-between relative">
        {/* الخط الموصل */}
        <div className="absolute top-6 right-0 left-0 h-1 bg-border -z-10" />
        <div 
          className="absolute top-6 right-0 h-1 bg-gradient-to-l from-primary to-primary-light transition-all duration-500 -z-10"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === steps.length - 1;
          
          return (
            <div key={step.status} className="flex flex-col items-center flex-1 relative">
              {/* الدائرة */}
              <div
                className={`
                  w-14 h-14 rounded-full border-4 flex items-center justify-center transition-all duration-300 z-10
                  ${step.completed 
                    ? 'bg-primary border-primary shadow-lg scale-110' 
                    : step.active 
                      ? `${step.bgColor} border-4 animate-pulse shadow-xl scale-110`
                      : 'bg-muted border-border'
                  }
                `}
              >
                <Icon 
                  className={`
                    w-6 h-6 transition-all duration-300
                    ${step.completed 
                      ? 'text-primary-foreground' 
                      : step.active 
                        ? step.color
                        : 'text-muted-foreground'
                    }
                  `} 
                />
              </div>

              {/* النص والتاريخ */}
              <div className="mt-4 text-center max-w-[120px]">
                <p 
                  className={`
                    text-sm font-bold mb-1 transition-all duration-300
                    ${step.completed || step.active ? 'text-foreground' : 'text-muted-foreground'}
                  `}
                >
                  {step.label}
                </p>
                {step.timestamp && (step.completed || step.active) && (
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(step.timestamp), 'dd/MM/yyyy')}
                    <br />
                    {format(new Date(step.timestamp), 'HH:mm')}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
