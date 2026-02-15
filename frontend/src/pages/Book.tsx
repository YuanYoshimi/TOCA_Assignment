import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Check,
  Loader2,
  CalendarPlus,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getSchedule, getTrainers, bookAppointment, getAppointments } from '@/services/api';
import type { TrainerSchedule, TimeSlot } from '@/types/models';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageTransition } from '@/components/PageTransition';
import { cn } from '@/lib/utils';

// ─── Helpers ──────────────────────────────────────────────

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday = 1
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, n: number): Date {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date;
}

function formatDateShort(d: Date): string {
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatDayOfWeek(d: Date): string {
  return d.toLocaleDateString(undefined, { weekday: 'short' });
}

function toDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatSlotTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const COACH_COLORS: Record<string, string> = {
  'Coach David': 'bg-blue-500',
  'Coach Alex': 'bg-emerald-500',
  'Coach Mike': 'bg-violet-500',
  'Trainer Lisa': 'bg-amber-500',
  'Trainer Sarah': 'bg-pink-500',
};

function getCoachColor(name: string): string {
  return COACH_COLORS[name] ?? 'bg-primary';
}

function getCoachInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase();
}

// ─── Page Component ───────────────────────────────────────

export default function Book() {
  const { player } = useAuth();
  const queryClient = useQueryClient();
  const today = useMemo(() => new Date(), []);

  if (!player) return null;

  const playerId = player.id;

  // ─── State ────────────────────────────────────────────
  const [weekStart, setWeekStart] = useState(() => getMonday(today));
  const [selectedDay, setSelectedDay] = useState(today);
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ trainerName: string; slot: TimeSlot } | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const selectedDateStr = toDateString(selectedDay);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // ─── Queries ──────────────────────────────────────────
  const trainersQuery = useQuery({
    queryKey: ['trainers'],
    queryFn: getTrainers,
    staleTime: 1000 * 60 * 10,
  });

  const scheduleQuery = useQuery({
    queryKey: ['schedule', selectedDateStr, selectedCoach],
    queryFn: () => getSchedule(selectedDateStr, selectedCoach ?? undefined),
    staleTime: 1000 * 60,
  });

  const myAppointmentsQuery = useQuery({
    queryKey: ['player', playerId, 'appointments', 'future'],
    queryFn: () => getAppointments(playerId, 'future'),
  });

  const trainers = trainersQuery.data ?? [];
  const schedules: TrainerSchedule[] = scheduleQuery.data ?? [];
  const myAppointments = myAppointmentsQuery.data ?? [];

  const [bookingError, setBookingError] = useState('');

  // ─── Booking mutation ─────────────────────────────────
  const mutation = useMutation({
    mutationFn: (data: { trainerName: string; startTime: string; endTime: string }) =>
      bookAppointment(playerId, data),
    onSuccess: () => {
      setBookingSuccess(true);
      setBookingError('');
      setSelectedSlot(null);
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      queryClient.invalidateQueries({ queryKey: ['player', playerId, 'appointments'] });
      setTimeout(() => setBookingSuccess(false), 3000);
    },
    onError: (err: Error) => {
      setBookingError(err.message || 'Failed to book session. Please try again.');
      setTimeout(() => setBookingError(''), 5000);
    },
  });

  // ─── Navigation ───────────────────────────────────────
  const goNextWeek = () => setWeekStart((w) => addDays(w, 7));
  const goPrevWeek = () => {
    const prev = addDays(weekStart, -7);
    if (prev >= getMonday(today)) setWeekStart(prev);
  };
  const goToday = () => {
    setWeekStart(getMonday(today));
    setSelectedDay(today);
  };

  const isPastDay = (d: Date) => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return d < t;
  };

  // Total available slots for the selected view
  const totalAvailable = schedules.reduce(
    (sum, s) => sum + s.slots.filter((sl) => sl.available).length,
    0,
  );

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Book a Session</h1>
          <p className="text-muted-foreground">
            Choose a coach, pick a date, and reserve your training slot.
          </p>
        </div>

        {/* Success banner */}
        {bookingSuccess && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/30">
            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              Session booked successfully! Check your upcoming appointments.
            </p>
          </div>
        )}

        {/* Error banner */}
        {bookingError && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 dark:bg-red-950/30">
            <Clock className="h-4 w-4 text-red-600 dark:text-red-400" />
            <p className="text-sm font-medium text-red-700 dark:text-red-400">
              {bookingError}
            </p>
          </div>
        )}

        {/* Coach Selection */}
        <div>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">Select a Coach</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setSelectedCoach(null); setSelectedSlot(null); }}
              className={cn(
                'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors border',
                selectedCoach === null
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:bg-accent',
              )}
            >
              All Coaches
            </button>
            {trainers.map((name) => (
              <button
                key={name}
                onClick={() => { setSelectedCoach(name); setSelectedSlot(null); }}
                className={cn(
                  'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors border',
                  selectedCoach === name
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:bg-accent',
                )}
              >
                <span className={cn('h-2 w-2 rounded-full', getCoachColor(name))} />
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar Week Navigation */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="h-4 w-4 text-primary" />
                {weekDays[0].toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goPrevWeek} aria-label="Previous week">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={goToday}>
                  Today
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goNextWeek} aria-label="Next week">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1.5">
              {weekDays.map((day) => {
                const isSelected = isSameDay(day, selectedDay);
                const isToday = isSameDay(day, today);
                const past = isPastDay(day);

                return (
                  <button
                    key={day.toISOString()}
                    disabled={past}
                    onClick={() => { setSelectedDay(day); setSelectedSlot(null); }}
                    className={cn(
                      'flex flex-col items-center rounded-lg py-2.5 transition-colors',
                      past && 'opacity-40 cursor-not-allowed',
                      !past && !isSelected && 'hover:bg-accent cursor-pointer',
                      isSelected && 'bg-primary text-primary-foreground',
                      isToday && !isSelected && 'ring-1 ring-primary',
                    )}
                  >
                    <span className="text-[10px] font-medium uppercase">{formatDayOfWeek(day)}</span>
                    <span className="text-lg font-bold">{day.getDate()}</span>
                    <span className="text-[10px]">{formatDateShort(day).split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Time Slots Grid */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">
              Available Slots — {selectedDay.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </h2>
            {!scheduleQuery.isLoading && (
              <Badge variant="secondary" className="text-xs">
                {totalAvailable} available
              </Badge>
            )}
          </div>

          {scheduleQuery.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-xl" />
              ))}
            </div>
          ) : schedules.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No schedules available for this date.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {schedules.map((schedule) => (
                <CoachScheduleCard
                  key={schedule.trainerName}
                  schedule={schedule}
                  selectedSlot={
                    selectedSlot?.trainerName === schedule.trainerName
                      ? selectedSlot.slot
                      : null
                  }
                  onSelectSlot={(slot) => setSelectedSlot(
                    selectedSlot?.trainerName === schedule.trainerName &&
                    selectedSlot?.slot.startTime === slot.startTime
                      ? null
                      : { trainerName: schedule.trainerName, slot },
                  )}
                  selectedCoachForSlot={schedule.trainerName}
                  onBook={(slot) => {
                    mutation.mutate({
                      trainerName: schedule.trainerName,
                      startTime: slot.startTime,
                      endTime: slot.endTime,
                    });
                  }}
                  isBooking={mutation.isPending}
                />
              ))}
            </div>
          )}
        </div>

        {/* My upcoming appointments */}
        {myAppointments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarPlus className="h-4 w-4 text-primary" />
                My Upcoming Sessions ({myAppointments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                {myAppointments.map((appt) => (
                  <div key={appt.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <div className={cn('flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white', getCoachColor(appt.trainerName))}>
                      {getCoachInitials(appt.trainerName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {new Date(appt.startTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        {' '}
                        {formatSlotTime(appt.startTime)} – {formatSlotTime(appt.endTime)}
                      </p>
                      <p className="text-xs text-muted-foreground">{appt.trainerName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}

// ─── Coach Schedule Card ──────────────────────────────────

function CoachScheduleCard({
  schedule,
  selectedSlot,
  onSelectSlot,
  selectedCoachForSlot,
  onBook,
  isBooking,
}: {
  schedule: TrainerSchedule;
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
  selectedCoachForSlot: string;
  onBook: (slot: TimeSlot) => void;
  isBooking: boolean;
}) {
  const availableCount = schedule.slots.filter((s) => s.available).length;
  const color = getCoachColor(schedule.trainerName);

  return (
    <Card className="overflow-hidden">
      {/* Coach header */}
      <div className={cn('flex items-center gap-3 px-4 py-3', color.replace('bg-', 'bg-').replace('500', '50'), 'dark:bg-muted/50')}>
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white', color)}>
          {getCoachInitials(schedule.trainerName)}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">{schedule.trainerName}</p>
          <p className="text-xs text-muted-foreground">
            {availableCount} of {schedule.slots.length} slots open
          </p>
        </div>
        <User className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Slots grid */}
      <CardContent className="p-3">
        <div className="grid grid-cols-2 gap-1.5">
          {schedule.slots.map((slot) => {
            const isSelected =
              selectedSlot?.startTime === slot.startTime &&
              selectedSlot?.endTime === slot.endTime;

            return (
              <button
                key={slot.startTime}
                disabled={!slot.available || isBooking}
                onClick={() => onSelectSlot(slot)}
                className={cn(
                  'flex items-center justify-center rounded-md py-2 text-xs font-medium transition-all',
                  !slot.available && 'bg-muted/50 text-muted-foreground/40 line-through cursor-not-allowed',
                  slot.available && !isSelected && 'border border-border hover:border-primary hover:bg-primary/5 cursor-pointer',
                  isSelected && 'bg-primary text-primary-foreground border-primary',
                )}
              >
                <Clock className="mr-1 h-3 w-3" />
                {formatSlotTime(slot.startTime)}
              </button>
            );
          })}
        </div>

        {/* Book button for selected slot */}
        {selectedSlot && schedule.slots.some((s) => s.startTime === selectedSlot.startTime && s.endTime === selectedSlot.endTime) && (
          <div className="mt-3 rounded-lg bg-primary/5 p-2.5 dark:bg-primary/10">
            <p className="mb-2 text-xs text-muted-foreground">
              {formatSlotTime(selectedSlot.startTime)} – {formatSlotTime(selectedSlot.endTime)} with <strong>{selectedCoachForSlot}</strong>
            </p>
            <Button
              size="sm"
              className="w-full gap-1.5"
              onClick={() => onBook(selectedSlot)}
              disabled={isBooking}
            >
              {isBooking ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              {isBooking ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
