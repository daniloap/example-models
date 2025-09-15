# Hedonic HTML dashboard

This example shows how to take a set of static PNG files created in R and group
them into a single responsive HTML page.  The workflow is:

1. Generate each figure in R as usual and export it with `ggsave()` (or
   `png()`, `pdf()`, etc.).
2. Update the `plots` data frame in [`build_dashboard.R`](build_dashboard.R)
   so each row points to one of the exported images.
3. Run the script to produce `hedonic_dashboard.html`.
4. Open the HTML file locally or publish it with any static web host.

```r
# From inside example-models/misc/hedonic_dashboard
source("build_dashboard.R")

# Optionally change captions before writing the HTML
plots$caption <- c(
  "Resumo geral das métricas hedônicas.",
  "Percentual de dados faltantes por dimensão.",
  "Distribuição das avaliações em cada tempo.",
  "Evolução das dimensões no grupo controle.",
  "Evolução das dimensões no grupo cirúrgico.",
  "Métricas de rede ao longo do tempo.",
  "Correlações robustas por tempo.",
  "Regressão das mudanças de IMC vs. hedônicas.",
  "Histogramas das variações.",
  "Contagem de participantes com dados completos."
)

generate_dashboard(plots, output_path = "hedonic_dashboard.html")
```

The generated page uses pure HTML/CSS, so it works offline and does not depend
on external frameworks.  You can adjust the layout by editing the `template_header`
section inside the script (for example, changing the grid breakpoint or card
styling).

### Exporting the graphs from R

The snippet below demonstrates a convenient pattern: after producing each plot,
call `ggsave()` to persist it to the `plots/` directory used in the dashboard.

```r
# Example for a single ggplot object called p
fs::dir_create("plots")
ggsave(filename = "plots/analise_resumo.png", plot = p, width = 14, height = 10, dpi = 300)
```

Repeat that step for all figures you want to include.  As long as the exported
file names match the entries in the `plots$file` column, rerunning
`generate_dashboard()` will rebuild the HTML page with the updated graphics.
