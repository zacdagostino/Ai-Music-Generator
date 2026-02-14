export interface SunoGenerationRequest {
  prompt: string;
  lyricGuide: string;
}

export interface SunoGenerationResult {
  audioUrl: string;
  lyrics?: string;
  metadata?: Record<string, unknown>;
}

export class SunoService {
  private baseUrl = process.env.SUNO_API_BASE_URL;
  private apiKey = process.env.SUNO_API_KEY;

  private async request(path: string, init: RequestInit) {
    if (!this.baseUrl) {
      throw new Error("SUNO_API_BASE_URL is missing");
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        ...(init.headers ?? {}),
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Suno request failed ${response.status}: ${body}`);
    }

    return response.json();
  }

  async createGenerationJob(payload: SunoGenerationRequest): Promise<{ jobId: string }> {
    if (!this.baseUrl || !this.apiKey) {
      return { jobId: `mock-${Date.now()}` };
    }

    const data = await this.request("/generations", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return { jobId: data.id ?? data.jobId };
  }

  async pollUntilComplete(jobId: string, maxAttempts = 12): Promise<SunoGenerationResult> {
    if (jobId.startsWith("mock-")) {
      return {
        audioUrl: "https://cdn.freesound.org/previews/566/566993_5674468-lq.mp3",
        lyrics: "A gentle memory in evening light...",
        metadata: { provider: "mock", jobId },
      };
    }

    let attempt = 0;
    let waitMs = 2000;

    while (attempt < maxAttempts) {
      const data = await this.request(`/generations/${jobId}`, { method: "GET" });
      if (data.status === "complete" || data.status === "completed") {
        return {
          audioUrl: data.audioUrl ?? data.result?.audioUrl,
          lyrics: data.lyrics ?? data.result?.lyrics,
          metadata: data,
        };
      }

      if (data.status === "failed") {
        throw new Error(data.error ?? "Generation failed");
      }

      await new Promise((resolve) => setTimeout(resolve, waitMs));
      waitMs = Math.min(waitMs * 1.5, 9000);
      attempt += 1;
    }

    throw new Error("Suno generation timed out");
  }
}
