import { afterEach, describe, expect, it, vi } from "vitest";
import {
  addDaysIso,
  splitTeacherAgenda,
  teacherAgendaWindow,
} from "@/lib/teacher-agenda";

const item = (session_date: string) => ({ session: { session_date } });

describe("addDaysIso", () => {
  it("cruza fin de mes y de año", () => {
    expect(addDaysIso("2026-09-28", 7)).toBe("2026-10-05");
    expect(addDaysIso("2026-12-29", 7)).toBe("2027-01-05");
  });

  it("no se descuadra con el cambio de hora de octubre", () => {
    expect(addDaysIso("2026-10-24", 1)).toBe("2026-10-25");
    expect(addDaysIso("2026-10-25", 1)).toBe("2026-10-26");
  });
});

describe("agenda del profesor cerca de medianoche", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * 23:30 UTC del 15-09 = 01:30 del 16-09 en Madrid. Con el reloj del servidor
   * (UTC en Vercel) la cabecera diría martes 15 y la clase del 16 caería en
   * «Próximas».
   */
  it("usa el día de Madrid con el reloj del sistema en UTC", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-15T23:30:00Z"));

    const { todayIso, horizonIso } = teacherAgendaWindow();
    expect(todayIso).toBe("2026-09-16");
    expect(horizonIso).toBe("2026-09-23");

    const { today, upcoming } = splitTeacherAgenda(
      [item("2026-09-15"), item("2026-09-16"), item("2026-09-17")],
      todayIso,
    );
    expect(today.map((i) => i.session.session_date)).toEqual(["2026-09-16"]);
    expect(upcoming.map((i) => i.session.session_date)).toEqual(["2026-09-17"]);
  });

  it("antes de medianoche en Madrid sigue siendo el mismo día", () => {
    const { todayIso } = teacherAgendaWindow(new Date("2026-09-15T21:59:00Z"));
    expect(todayIso).toBe("2026-09-15");
  });
});
