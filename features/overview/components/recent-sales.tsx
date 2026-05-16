import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';

type RecentBooking = {
  name: string;
  email: string;
  fallback: string;
  amount: number;
  status: string;
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

export function RecentSales({ bookings }: { bookings: RecentBooking[] }) {
  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
        <CardDescription>
          {bookings.length
            ? `Latest ${bookings.length} booking${bookings.length === 1 ? '' : 's'}`
            : 'No bookings yet.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-8'>
          {bookings.map((booking, index) => (
            <div key={index} className='flex items-center'>
              <Avatar className='h-9 w-9'>
                <AvatarImage src='' alt='' />
                <AvatarFallback>{booking.fallback}</AvatarFallback>
              </Avatar>
              <div className='ml-4 space-y-1'>
                <p className='text-sm leading-none font-medium'>{booking.name}</p>
                <p className='text-muted-foreground text-sm'>{booking.email}</p>
              </div>
              <div className='ml-auto text-right'>
                <div className='font-medium'>{currencyFormatter.format(booking.amount)}</div>
                <div className='text-muted-foreground text-xs capitalize'>{booking.status}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
