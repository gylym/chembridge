import { describe, expect, it } from "vitest";
import { assertSafePdfUrl, assertSafeResourceUrl, extractYouTubeVideoId } from "./media-validation";

describe("media validation", () => {
  it("normalizes supported YouTube URLs", () => {
    expect(extractYouTubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(extractYouTubeVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(extractYouTubeVideoId("https://youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("rejects arbitrary embeds and non-PDF files", () => {
    expect(() => extractYouTubeVideoId("https://example.com/embed/dQw4w9WgXcQ")).toThrow();
    expect(() => assertSafePdfUrl("https://example.com/file.exe")).toThrow();
  });

  it("accepts bundled and uploaded learning resources", () => {
    expect(assertSafeResourceUrl("/sample-files/atom-kurylysy-ulgisi.pptx")).toBe("/sample-files/atom-kurylysy-ulgisi.pptx");
    expect(assertSafeResourceUrl("/api/media/presentations%2Fsample.pptx")).toBe("/api/media/presentations%2Fsample.pptx");
    expect(assertSafeResourceUrl("https://example.com/task.pdf")).toBe("https://example.com/task.pdf");
    expect(() => assertSafeResourceUrl("https://example.com/script.exe")).toThrow();
  });
});
