import { NextResponse } from "next/server";
import { z } from "zod";
import { Rank } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  fromRank: z.nativeEnum(Rank),
  toRank: z.nativeEnum(Rank),
  price: z.number().positive(),
  estimatedDays: z.number().positive(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const game = await prisma.game.findUnique({
    where: { slug: "mobile-legends" },
  });
  if (!game) {
    return NextResponse.json(
      { error: "Game belum di-seed, jalankan `npx prisma db seed` dulu" },
      { status: 404 }
    );
  }

  try {
    const tier = await prisma.pricingTier.create({
      data: {
        gameId: game.id,
        fromRank: parsed.data.fromRank,
        toRank: parsed.data.toRank,
        price: parsed.data.price,
        estimatedDays: parsed.data.estimatedDays,
      },
    });
    return NextResponse.json({ tier }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Kombinasi rank ini sudah ada" },
      { status: 409 }
    );
  }
}
