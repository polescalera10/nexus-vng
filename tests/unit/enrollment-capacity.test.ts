import { describe, expect, it } from "vitest";
import { closedRoleMessage, roleCapacity } from "@/lib/enrollment-capacity";

const salsa = { capacity_leaders: 10, capacity_followers: 10 };
const heels = { capacity_leaders: 0, capacity_followers: 20 };

describe("roleCapacity", () => {
  it("cuenta las plazas que quedan", () => {
    expect(roleCapacity(salsa, "leader", 3)).toEqual({ kind: "open", free: 7 });
    expect(roleCapacity(salsa, "follower", 0)).toEqual({ kind: "open", free: 10 });
  });

  it("marca lleno al llegar al aforo, no antes", () => {
    expect(roleCapacity(salsa, "leader", 9)).toEqual({ kind: "open", free: 1 });
    expect(roleCapacity(salsa, "leader", 10)).toEqual({ kind: "full" });
    expect(roleCapacity(salsa, "leader", 11)).toEqual({ kind: "full" });
  });

  it("0 significa que la clase no admite ese rol, no que quepan infinitos", () => {
    expect(roleCapacity(heels, "leader", 0)).toEqual({ kind: "closed" });
    expect(roleCapacity(heels, "follower", 5)).toEqual({ kind: "open", free: 15 });
    expect(roleCapacity(heels, "follower", 20)).toEqual({ kind: "full" });
  });

  it("explica el rechazo con el nombre de la clase", () => {
    expect(closedRoleMessage("Heels", "leader")).toBe("Heels no admite leaders.");
  });
});
