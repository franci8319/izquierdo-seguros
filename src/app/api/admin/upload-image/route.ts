import { NextRequest, NextResponse } from "next/server";
import { putFileBase64 } from "@/lib/github";
import { requireSession } from "@/lib/require-session";

export async function POST(request: NextRequest) {
  const unauthorized = await requireSession(request);
  if (unauthorized) return unauthorized;

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No se ha recibido ningún archivo." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "El archivo debe ser una imagen." }, { status: 400 });
  }

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-]/g, "-").toLowerCase();
  const repoPath = `public/images/uploads/${timestamp}-${safeName}`;
  const publicPath = `/images/uploads/${timestamp}-${safeName}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  await putFileBase64(
    repoPath,
    buffer.toString("base64"),
    undefined,
    `Subir imagen ${safeName} desde el panel admin`
  );

  return NextResponse.json({ ok: true, path: publicPath });
}
