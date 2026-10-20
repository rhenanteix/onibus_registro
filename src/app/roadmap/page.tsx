import fs from "fs";
import path from "path";
import { marked } from "marked";

export default function RoadmapPage() {
  const roadmap = fs.readFileSync(path.join(process.cwd(), "ROADMAP.md"), "utf8");
  const changelog = fs.readFileSync(path.join(process.cwd(), "CHANGELOG.md"), "utf8");
  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Roadmap, Versões e Melhorias</h1>
        <div className="prose max-w-none mb-10" dangerouslySetInnerHTML={{ __html: marked.parse(roadmap) as string }} />
        <hr className="my-10" />
        <div id="changelog" className="prose max-w-none" dangerouslySetInnerHTML={{ __html: marked.parse(changelog) as string }} />
      </div>
    </div>
  );
}
