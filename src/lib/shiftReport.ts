import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { StaffShift } from './types';

interface ShiftReportStaff {
  id: string;
  full_name: string;
  email: string;
  department?: string;
  job_title?: string;
}

// Local-calendar YYYY-MM-DD — never toISOString() here, it converts to UTC and
// rolls the date back a day in any timezone ahead of UTC (e.g. Lagos, UTC+1).
function toDateOnly(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Monday of the week containing `anchor` (ISO week, locale-independent).
export function getWeekStart(anchor: Date = new Date()): string {
  const d = new Date(anchor);
  const day = d.getDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  return toDateOnly(d);
}

function getWeekDates(weekStart: string): string[] {
  const start = new Date(`${weekStart}T00:00:00`);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return toDateOnly(d);
  });
}

export function generateWeeklyShiftReportPdf(
  staff: ShiftReportStaff,
  weekStart: string,
  allShifts: StaffShift[]
): void {
  const weekDates = getWeekDates(weekStart);
  const weekEnd = weekDates[6];

  const staffShifts = allShifts.filter(
    s => (s.staffId === staff.id || s.staffEmail?.toLowerCase() === staff.email.toLowerCase()) && weekDates.includes(s.date)
  );

  const rows = weekDates.map(date => {
    const dayShifts = staffShifts.filter(s => s.date === date);
    if (dayShifts.length === 0) {
      return [new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' }), '—', '—', '0', '0', '0', '0', 'No shift recorded'];
    }
    const hours = Math.round(dayShifts.reduce((acc, s) => acc + (s.durationHours || 0), 0) * 10) / 10;
    const planned = dayShifts.reduce((acc, s) => acc + (s.tasksPlannedCount || 0), 0);
    const completed = dayShifts.reduce((acc, s) => acc + (s.tasksCompletedCount || 0), 0);
    const carried = dayShifts.reduce((acc, s) => acc + (s.tasksCarriedForwardCount || 0), 0);
    const clockIn = dayShifts[0].clockInTime
      ? new Date(dayShifts[0].clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '—';
    const lastOut = dayShifts[dayShifts.length - 1].clockOutTime;
    const clockOut = lastOut ? new Date(lastOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'In Progress';
    const notes = dayShifts.map(s => s.shiftReviewNotes).filter(Boolean).join(' | ') || '—';
    return [
      new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' }),
      clockIn,
      clockOut,
      String(hours),
      String(planned),
      String(completed),
      String(carried),
      notes
    ];
  });

  const totalHours = Math.round(staffShifts.reduce((acc, s) => acc + (s.durationHours || 0), 0) * 10) / 10;
  const totalCompleted = staffShifts.reduce((acc, s) => acc + (s.tasksCompletedCount || 0), 0);
  const totalCarried = staffShifts.reduce((acc, s) => acc + (s.tasksCarriedForwardCount || 0), 0);

  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.setTextColor(13, 82, 248);
  doc.text('MODE Digital Creations', 14, 18);

  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text('Weekly Shift Report', 14, 26);

  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text(`Staff: ${staff.full_name}  (${staff.job_title || 'N/A'}, ${staff.department || 'N/A'})`, 14, 34);
  doc.text(`Week: ${formatRangeLabel(weekStart, weekEnd)}`, 14, 39);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 44);

  autoTable(doc, {
    startY: 50,
    head: [['Date', 'Clock In', 'Clock Out', 'Hours', 'Planned', 'Completed', 'Carried Fwd', 'Daily Summary Note']],
    body: rows,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [13, 82, 248], textColor: 255 },
    columnStyles: { 7: { cellWidth: 70 } }
  });

  // @ts-expect-error - lastAutoTable is attached by the autotable plugin at runtime
  const afterTableY = (doc.lastAutoTable?.finalY || 50) + 8;

  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  doc.text('Weekly Totals', 14, afterTableY);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Hours: ${totalHours}    Tasks Completed: ${totalCompleted}    Carried Forward: ${totalCarried}`, 14, afterTableY + 6);

  const fileName = `Weekly-Shift-Report-${staff.full_name.replace(/\s+/g, '-')}-${weekStart}.pdf`;
  doc.save(fileName);
}

function formatRangeLabel(start: string, end: string): string {
  const s = new Date(`${start}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const e = new Date(`${end}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  return `${s} — ${e}`;
}
