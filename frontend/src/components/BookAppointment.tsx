import { useNavigate } from 'react-router-dom';
import { CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BookAppointment() {
  const navigate = useNavigate();

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5"
      onClick={() => navigate('/book')}
    >
      <CalendarPlus className="h-3.5 w-3.5" />
      Book Session
    </Button>
  );
}
