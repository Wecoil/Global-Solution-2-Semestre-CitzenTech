import { supabase } from "@/lib/supabase";

export async function uploadProfessionalPhoto(
  userId: string,
  localUri: string
): Promise<string> {
  const response = await fetch(localUri);
  if (!response.ok) {
    throw new Error("Não foi possível ler a foto selecionada.");
  }

  const arrayBuffer = await response.arrayBuffer();
  const extension = localUri.split("?")[0].split(".").pop()?.toLowerCase();
  const safeExtension =
    extension && ["jpg", "jpeg", "png", "webp"].includes(extension)
      ? extension
      : "jpg";
  const contentType =
    safeExtension === "png"
      ? "image/png"
      : safeExtension === "webp"
        ? "image/webp"
        : "image/jpeg";

  const filePath = `${userId}/avatar.${safeExtension}`;
  const { error: uploadError } = await supabase.storage
    .from("profile-photos")
    .upload(filePath, arrayBuffer, {
      contentType,
      upsert: true,
      cacheControl: "3600",
    });

  if (uploadError) {
    throw new Error(`Não foi possível enviar a foto: ${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from("profile-photos")
    .getPublicUrl(filePath);

  const photoUrl = data.publicUrl;
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ foto_url: photoUrl })
    .eq("id", userId);

  if (profileError) {
    throw new Error(
      `A foto foi enviada, mas não foi possível salvar no perfil: ${profileError.message}`
    );
  }

  return photoUrl;
}
