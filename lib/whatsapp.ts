export function buildWhatsAppLink(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  // Nigeria: if number is 11 digits starting with 0, prefer 234...
  const normalized =
    digits.length === 11 && digits.startsWith("0")
      ? `234${digits.slice(1)}`
      : digits;

  const text = encodeURIComponent(message);
  return `https://wa.me/${normalized}?text=${text}`;
}

export function propertyInquiryMessage(listing: {
  title?: string;
  property_id?: string;
}): string {
  const title = listing.title?.trim() || "your property";
  const kid = listing.property_id?.trim() || "";
  const kidPart = kid ? ` (KID: ${kid})` : "";

  return `Hi, I found your property "${title}" on Kaban.ng${kidPart} and would like to inspect it.`;
}