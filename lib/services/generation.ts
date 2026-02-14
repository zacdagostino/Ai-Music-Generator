import { AssetType, GenerationStatus, OrderStatus, Prisma, Tier } from "@prisma/client";
import path from "node:path";

import { prisma } from "@/lib/prisma";
import { type RitualAnswers } from "@/lib/schemas";
import { buildPromptPack } from "@/lib/services/prompt-builder";
import { generateSlideshowVideo } from "@/lib/slideshow/service";
import { getStorageService } from "@/lib/storage/service";
import { SunoService } from "@/lib/suno/service";

function candidatesByTier(tier: Tier) {
  if (tier === Tier.LEGACY_COLLECTION) return 4;
  if (tier === Tier.VISUAL_TRIBUTE) return 3;
  return 2;
}

function scoreCandidate(lyrics = "", prompt = "") {
  const lyricDepth = Math.min(lyrics.length / 80, 4);
  const promptClarity = Math.min(prompt.length / 200, 3);
  const randomWarmth = Math.random() * 3;
  return Number((lyricDepth + promptClarity + randomWarmth).toFixed(2));
}

export async function runGenerationPipeline(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || !order.tier || !order.answersJson) throw new Error("Order not ready for generation");

  const answers = order.answersJson as unknown as RitualAnswers;
  const pack = buildPromptPack(answers);
  const storage = getStorageService();
  const suno = new SunoService();

  await prisma.generationJob.upsert({
    where: { orderId },
    create: { orderId, status: GenerationStatus.RUNNING, maxCandidates: candidatesByTier(order.tier) },
    update: { status: GenerationStatus.RUNNING, error: null },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.COMPOSING, promptJson: pack as unknown as Prisma.InputJsonObject },
  });

  const maxCandidates = candidatesByTier(order.tier);
  const attempts = [] as { id: string; score: number; audioUrl: string; lyrics?: string }[];

  for (let i = 1; i <= maxCandidates; i += 1) {
    const prompt = `${pack.sunoPrompt} Candidate focus ${i}/${maxCandidates}.`;
    const create = await suno.createGenerationJob({
      prompt,
      lyricGuide: pack.lyricGuide,
    });
    const result = await suno.pollUntilComplete(create.jobId);

    const audioKey = path.join(orderId, `candidate-${i}.url.txt`);
    await storage.putText(audioKey, result.audioUrl);
    const score = scoreCandidate(result.lyrics, prompt);

    const attempt = await prisma.generationAttempt.create({
      data: {
        orderId,
        attemptNo: i,
        prompt,
        lyricGuide: pack.lyricGuide,
        resultUrl: result.audioUrl,
        lyrics: result.lyrics,
        metadataJson: result.metadata as Prisma.InputJsonObject | undefined,
        score,
      },
    });

    attempts.push({ id: attempt.id, score, audioUrl: result.audioUrl, lyrics: result.lyrics });
  }

  attempts.sort((a, b) => b.score - a.score);
  const best = attempts[0];

  await prisma.generationAttempt.update({
    where: { id: best.id },
    data: { selected: true },
  });

  await prisma.asset.createMany({
    data: [
      {
        orderId,
        type: AssetType.AUDIO,
        url: best.audioUrl,
      },
      {
        orderId,
        type: AssetType.LYRICS,
        url: await storage.putText(path.join(orderId, "lyrics.txt"), best.lyrics ?? "Lyrics pending"),
      },
    ],
  });

  if (order.tier === Tier.VISUAL_TRIBUTE || order.tier === Tier.LEGACY_COLLECTION) {
    const videoUrl = await generateSlideshowVideo(orderId, [], 180);
    await prisma.asset.create({
      data: {
        orderId,
        type: AssetType.VIDEO,
        url: videoUrl,
      },
    });
  }

  await prisma.generationJob.update({
    where: { orderId },
    data: { status: GenerationStatus.COMPLETE, attempts: maxCandidates },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.READY, selectedAttemptId: best.id },
  });

  return best;
}
