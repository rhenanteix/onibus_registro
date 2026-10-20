import { ArrowUpRight, Star } from "lucide-react";
import type { Line } from "@/types/transit";
export function LineCard({
  line,
  selected,
  favorite,
  onSelect,
  onFavorite,
}: {
  line: Line;
  selected: boolean;
  favorite: boolean;
  onSelect: () => void;
  onFavorite: () => void;
}) {
  return (
    <article className={`line-card ${selected ? "selected" : ""}`}>
      <button
        className="line-select"
        onClick={onSelect}
        aria-pressed={selected}
      >
        <span
          className={`line-code ${line.id.startsWith("R") ? "rural" : line.id.startsWith("U") ? "university" : ""}`}
        >
          {line.id}
        </span>
        <span>
          <strong>{line.name}</strong>
          <small>
            {line.kind} · {line.origins[0] ?? "Consultar origem"}
          </small>
        </span>
        <ArrowUpRight size={19} />
      </button>
      <button
        className="favorite icon-button"
        aria-label={`${favorite ? "Remover" : "Adicionar"} ${line.name} ${favorite ? "dos" : "aos"} favoritos`}
        aria-pressed={favorite}
        onClick={onFavorite}
      >
        <Star size={18} fill={favorite ? "currentColor" : "none"} />
      </button>
    </article>
  );
}
