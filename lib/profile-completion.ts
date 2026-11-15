import { IRealtor, IUser } from "@/types/userTypes";

export function isProfileComplete(
  user: IUser | null,
  realtor: IRealtor | null,
): boolean {
  const profile = realtor ?? user?.realtor;
  const fullName = user?.fullName?.trim() || profile?.full_name?.trim();
  const mobileNumber =
    profile?.mobile_number?.trim() || user?.mobileNumber?.trim();
  const whatsappNumber =
    profile?.whatsapp_number?.trim() || user?.whatsappNumber?.trim();

  return Boolean(
    user?.email?.trim() && fullName && mobileNumber && whatsappNumber,
  );
}
