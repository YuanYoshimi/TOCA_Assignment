import { describe, it, expect } from 'vitest';
import { formatDate, formatTime, formatDateTimeRange, computeAge } from '@/lib/utils';

describe('formatDate', () => {
  it('should format an ISO string to "MMM d, yyyy"', () => {
    expect(formatDate('2026-01-15T18:00:00Z')).toMatch(/Jan 15, 2026/);
  });

  it('should handle different months', () => {
    expect(formatDate('2026-06-01T12:00:00Z')).toMatch(/Jun 1, 2026/);
    // Use midday UTC to avoid timezone-shift issues
    expect(formatDate('2026-12-25T12:00:00Z')).toMatch(/Dec 25, 2026/);
  });
});

describe('formatTime', () => {
  it('should format time in 12-hour format with AM/PM', () => {
    // Note: output depends on parsing — parseISO treats as UTC then format
    // outputs in local timezone. We just check the format pattern.
    const result = formatTime('2026-01-15T18:00:00Z');
    expect(result).toMatch(/\d{1,2}:\d{2}\s[AP]M/);
  });
});

describe('formatDateTimeRange', () => {
  it('should combine date and two times with bullet separator', () => {
    const result = formatDateTimeRange('2026-01-15T18:00:00Z', '2026-01-15T19:00:00Z');
    expect(result).toContain('Jan 15, 2026');
    expect(result).toContain('–');
  });
});

describe('computeAge', () => {
  it('should compute age from a DOB string', () => {
    // Person born on 2000-01-01 — in Feb 2026 they'd be 26
    const age = computeAge('2000-01-01');
    expect(age).toBe(26);
  });

  it('should handle birthday not yet passed this year', () => {
    // Person born Dec 25, 2000 — in Feb 2026 they'd still be 25
    const age = computeAge('2000-12-25');
    expect(age).toBe(25);
  });

  it('should handle edge case of today being birthday', () => {
    const today = new Date();
    const dob = `${today.getFullYear() - 20}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    expect(computeAge(dob)).toBe(20);
  });
});
