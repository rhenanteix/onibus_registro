import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Documentação</h1>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/docs/api" className="border p-6 rounded hover:border-blue-500">
            <h2 className="text-xl font-semibold mb-2">Documentação da API</h2>
            <p className="text-gray-600">Swagger UI interativo</p>
          </Link>
          <Link href="/roadmap" className="border p-6 rounded hover:border-blue-500">
            <h2 className="text-xl font-semibold mb-2">Roadmap, Versões e Melhorias</h2>
            <p className="text-gray-600">Versões, melhorias e changelog</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
