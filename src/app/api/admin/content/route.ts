import { NextRequest, NextResponse } from "next/server";
import { getFile, putFile, GithubConflictError } from "@/lib/github";
import { requireSession } from "@/lib/require-session";

const CONTENT_PATH = "content/site.json";

export async function GET(request: NextRequest) {
  const unauthorized = await requireSession(request);
  if (unauthorized) return unauthorized;

  const { content, sha } = await getFile(CONTENT_PATH);
  return NextResponse.json({ content: JSON.parse(content), sha });
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireSession(request);
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  if (!body?.content || typeof body.sha !== "string") {
    return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
  }

  try {
    const result = await putFile(
      CONTENT_PATH,
      JSON.stringify(body.content, null, 2),
      body.sha,
      "Actualizar contenido desde el panel admin"
    );
    return NextResponse.json({ ok: true, sha: result.sha });
  } catch (error) {
    if (error instanceof GithubConflictError) {
      return NextResponse.json(
        { error: "Alguien guardó otro cambio mientras editabas. Recarga para ver la última versión." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "No se pudo guardar el cambio. Inténtalo de nuevo." }, { status: 502 });
  }
}
