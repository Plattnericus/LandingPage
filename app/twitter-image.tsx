import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = "Nexor / Plattnericus - Build. Deploy. Secure.";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#17100c",
          color: "#ede0d4",
          padding: 72,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#c9aa8c",
            fontSize: 30,
          }}
        >
          <span>{siteConfig.domain}</span>
          <span>Fullstack · DevOps · Security</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 132, lineHeight: 0.92, fontWeight: 740 }}>
            Nexor
          </div>
          <div style={{ color: "#ddb892", fontSize: 48 }}>
            Build. Deploy. Secure.
          </div>
        </div>
        <div style={{ color: "#c9aa8c", fontSize: 32, maxWidth: 860 }}>
          Building reliable software, infrastructure and security-focused
          systems.
        </div>
      </div>
    ),
    size,
  );
}
