import {
  ArrowLeftRight,
  Cloud,
  Container,
  GitBranch,
  Globe,
  Server,
  Workflow,
} from "lucide-react";
import { pipelineNodes } from "@/lib/content";

const NODE_POSITIONS = [
  { x: 6, y: 30 },
  { x: 21, y: 60 },
  { x: 36, y: 30 },
  { x: 51, y: 60 },
  { x: 66, y: 30 },
  { x: 81, y: 60 },
  { x: 94, y: 30 },
];

const NODE_ICONS = [GitBranch, Workflow, Container, Server, ArrowLeftRight, Cloud, Globe];

/** Desktop: node chips on a wave path drawn by DrawSVG, packets on MotionPath.
    Mobile: a vertical rail with the same story. */
export default function PipelineDiagram() {
  return (
    <>
      <div className="pipeline" aria-label="GitHub to CI/CD to Docker to VPS to Reverse Proxy to Cloudflare to Live App">
        <svg className="pipeline-svg" viewBox="0 0 1000 300" fill="none" aria-hidden="true">
          <path
            id="pipe-path"
            className="pipe-line"
            d="M60 90 C 135 90, 135 180, 210 180 S 285 90, 360 90 S 435 180, 510 180 S 585 90, 660 90 S 735 180, 810 180 S 885 90, 940 90"
          />
          <circle r="6" className="packet" />
          <circle r="5" className="packet" />
          <circle r="4" className="packet" />
          <circle r="5" className="packet packet-loop" />
        </svg>
        {pipelineNodes.map((label, index) => {
          const Icon = NODE_ICONS[index];
          const { x, y } = NODE_POSITIONS[index];
          return (
            <div key={label} className="pipe-node" style={{ left: `${x}%`, top: `${y}%` }}>
              <span className="pipe-node-icon">
                <Icon aria-hidden="true" />
              </span>
              <span className="pipe-node-label">{label}</span>
            </div>
          );
        })}
      </div>

      <ol className="pipeline-vertical" aria-hidden="true">
        {pipelineNodes.map((label, index) => {
          const Icon = NODE_ICONS[index];
          return (
            <li key={label} className="pipe-vnode">
              <span className="pipe-node-icon">
                <Icon aria-hidden="true" />
              </span>
              <span className="pipe-node-label">{label}</span>
            </li>
          );
        })}
      </ol>
    </>
  );
}
