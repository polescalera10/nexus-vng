import { expect, test as setup } from "@playwright/test";
import { fillPasswordLogin, storageStatePath, USERS, type E2EUser } from "./fixtures";

/**
 * Entra una vez con cada rol y guarda la sesión. Los tests la reutilizan con
 * `test.use({ storageState })`, así cada uno no repite el login.
 * El usuario `salida` no se guarda: su test entra y sale por su cuenta.
 */

const ROLES: E2EUser[] = ["admin", "profesor", "alumno"];

for (const user of ROLES) {
  setup(`sesión de ${user}`, async ({ page }) => {
    await page.goto("/area-privada");
    await fillPasswordLogin(page, USERS[user].email);
    // El middleware reenvía al panel que toca por rol.
    await expect(page).toHaveURL(new RegExp(`/area-privada/${USERS[user].role}$`));
    await page.context().storageState({ path: storageStatePath(user) });
  });
}
