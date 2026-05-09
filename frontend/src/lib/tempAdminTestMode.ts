import type { User } from "@/types/auth";

// TEMP TEST BYPASS: set false/remove when admin auth guard testing is done.
export const TEMP_ADMIN_TEST_MODE = true;

export const TEMP_ADMIN_USER: User = {
  id: "TEMP-ADMIN-TEST",
  organizationId: "TEMP-ORG-TEST",
  organizationName: "RS Mock Admin Test",
  fullName: "Admin Test",
  email: "admin.test@jivara.local",
  phone: "6281200000000",
  role: "admin",
  accountStatus: "active",
  age: 0,
  gender: null,
  address: "Lingkungan test sementara",
  mustChangePassword: false,
};
