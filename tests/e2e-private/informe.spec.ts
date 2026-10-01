import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import {
  DIARIO_VIDEO_TITULO,
  IDS,
  INFORME_SECRET_E2E,
  STUDENT_NAME,
  storageStatePath,
} from "./fixtures";

/**
 * Informe diario del área de alumnos (0049 + /api/cron/informe-alumnos).
 *
 * Primero la alumna navega y abre un vídeo; luego se pide el informe del día
 * de HOY en modo vista (`?vista=html`, no envía nada) y se comprueba que la
 * recoge. Así se prueba la cadena entera contra el esquema real: la RPC, la
 * RLS, el trigger y las lecturas paginadas de la ruta.
 */

test.use({ storageState: storageStatePath("alumno") });

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function hoyMadrid(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

test("sus visitas y el play del vídeo quedan apuntados", async ({ page }) => {
  await page.goto("/area-privada/alumno/ranking");
  await page.goto(`/area-privada/alumno/clase/${IDS.course}`);
  await page.getByRole("button", { name: new RegExp(DIARIO_VIDEO_TITULO) }).click();
  await expect(page.locator("iframe")).toHaveCount(1);

  const db = admin();
  await expect
    .poll(async () => {
      const { data } = await db
        .from("student_activity_days")
        .select("sections")
        .eq("student_id", IDS.student)
        .eq("day", hoyMadrid());
      return data?.[0]?.sections ?? [];
    })
    .toEqual(expect.arrayContaining(["ranking", "clase"]));
  await expect
    .poll(async () => {
      const { count } = await db
        .from("student_video_plays")
        .select("*", { count: "exact", head: true })
        .eq("student_id", IDS.student);
      return count ?? 0;
    })
    .toBeGreaterThan(0);
});

test("el informe del día la recoge y no se envía en modo vista", async ({ request }) => {
  const res = await request.get(`/api/cron/informe-alumnos?vista=html&fecha=${hoyMadrid()}`, {
    headers: { "x-cron-secret": INFORME_SECRET_E2E },
  });
  expect(res.status()).toBe(200);
  const html = await res.text();
  expect(html).toContain("Área de alumnos");
  expect(html).toContain(STUDENT_NAME);
  expect(html).toContain(DIARIO_VIDEO_TITULO);
});

test("sin el secreto, el informe responde 401", async ({ request }) => {
  const res = await request.get("/api/cron/informe-alumnos?vista=html");
  expect(res.status()).toBe(401);
});
