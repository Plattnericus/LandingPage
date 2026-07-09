import type { ReactNode } from "react";

type DeviceMockupProps = {
  variant: "macbook" | "iphone" | "browser";
  className?: string;
  url?: string;
  children?: ReactNode;
};

export default function DeviceMockup({ variant, className, url, children }: DeviceMockupProps) {
  const classes = ["device", `device-${variant}`, className ?? ""].filter(Boolean).join(" ");

  if (variant === "browser") {
    return (
      <div className={classes}>
        <div className="browser-bar">
          <span className="pv-traffic" />
          <span className="pv-traffic" />
          <span className="pv-traffic" />
          {url ? <span className="browser-url mono">{url}</span> : null}
        </div>
        <div className="device-viewport">{children}</div>
      </div>
    );
  }

  if (variant === "iphone") {
    return (
      <div className={classes}>
        <div className="device-screen">
          <span className="device-island" />
          <div className="device-viewport">{children}</div>
          <span className="device-homebar" />
        </div>
      </div>
    );
  }

  return (
    <div className={classes}>
      <div className="device-screen">
        <span className="device-notch">
          <i className="device-camera-dot" />
        </span>
        <div className="device-viewport">{children}</div>
      </div>
      <div className="device-base" />
    </div>
  );
}
