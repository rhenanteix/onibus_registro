(async () => {
  const status = document.querySelector("#status");
  const select = document.querySelector("#line");
  const result = document.querySelector("#result");
  const cache = await caches.open("mobilidade-next-v1");
  const response = await cache.match("/api/catalog");
  if (!response) {
    status.textContent =
      "Nenhuma base salva. Visite o portal com internet e toque em atualizar dados antes de usar a consulta offline.";
    select.disabled = true;
    return;
  }
  const { data, meta } = await response.json();
  status.textContent = `Base documental de ${meta.updatedAt}. Consulta offline; confirme vigência com a operadora.`;
  for (const line of data.lines) {
    const option = document.createElement("option");
    option.value = line.id;
    option.textContent = `${line.id} · ${line.name}`;
    select.append(option);
  }
  const labels = {
    week: "Segunda a sexta",
    sat: "Sábado",
    sun: "Domingo e feriado",
    tuewedfri: "Terça, quarta e sexta",
  };
  function show() {
    result.replaceChildren();
    const id = select.value;
    for (const [day, directions] of Object.entries(data.schedules[id] || {})) {
      const article = document.createElement("article");
      const h = document.createElement("h2");
      h.textContent = labels[day] || day;
      article.append(h);
      directions.forEach((rows, d) => {
        const p = document.createElement("p");
        const line = data.lines.find((l) => l.id === id);
        p.textContent =
          `Saindo de ${line.origins[d] || "origem não informada"}: ` +
          rows
            .map(
              (r) =>
                `${r.time}${r.uncertain ? " ?" : ""}${r.note ? " (" + r.note + ")" : ""}${r.variant !== "Padrão" ? " — " + r.variant : ""}`,
            )
            .join(" · ");
        article.append(p);
      });
      result.append(article);
    }
    for (const journey of data.journeys[id] || []) {
      const a = document.createElement("article");
      const h = document.createElement("h3");
      h.textContent = `${journey.label} · sentido ${journey.direction + 1}`;
      a.append(h);
      const ol = document.createElement("ol");
      for (const p of journey.points) {
        const li = document.createElement("li");
        li.textContent = p.label;
        ol.append(li);
      }
      a.append(ol);
      result.append(a);
    }
  }
  select.addEventListener("change", show);
  show();
})().catch(() => {
  document.querySelector("#status").textContent =
    "Não foi possível consultar os dados salvos.";
});
