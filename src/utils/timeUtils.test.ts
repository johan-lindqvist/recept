import { describe, it, expect } from 'vitest';
import { parseTotalTimeToMinutes } from './timeUtils';

describe('parseTotalTimeToMinutes', () => {
  it('should parse minutes only', () => {
    expect(parseTotalTimeToMinutes('5 minuter')).toBe(5);
    expect(parseTotalTimeToMinutes('15 minuter')).toBe(15);
    expect(parseTotalTimeToMinutes('30 minuter')).toBe(30);
    expect(parseTotalTimeToMinutes('45 minuter')).toBe(45);
  });

  it('should parse hours only (singular)', () => {
    expect(parseTotalTimeToMinutes('1 timme')).toBe(60);
  });

  it('should parse hours only (plural)', () => {
    expect(parseTotalTimeToMinutes('2 timmar')).toBe(120);
    expect(parseTotalTimeToMinutes('3 timmar')).toBe(180);
  });

  it('should parse combined hours and minutes', () => {
    expect(parseTotalTimeToMinutes('1 timme 30 minuter')).toBe(90);
    expect(parseTotalTimeToMinutes('2 timmar 15 minuter')).toBe(135);
  });

  it('should handle case insensitivity', () => {
    expect(parseTotalTimeToMinutes('1 TIMME')).toBe(60);
    expect(parseTotalTimeToMinutes('30 MINUTER')).toBe(30);
    expect(parseTotalTimeToMinutes('1 Timme 30 Minuter')).toBe(90);
  });

  it('should handle extra whitespace', () => {
    expect(parseTotalTimeToMinutes('  1 timme  ')).toBe(60);
    expect(parseTotalTimeToMinutes('1  timme  30  minuter')).toBe(90);
  });

  it('should return null for undefined', () => {
    expect(parseTotalTimeToMinutes(undefined)).toBe(null);
  });

  it('should return null for empty string', () => {
    expect(parseTotalTimeToMinutes('')).toBe(null);
  });

  it('should return null for invalid format', () => {
    expect(parseTotalTimeToMinutes('invalid')).toBe(null);
    expect(parseTotalTimeToMinutes('abc xyz')).toBe(null);
  });
});
