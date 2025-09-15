#' Hedonic dashboard generator
#'
#' This script shows how to bundle a set of pre-rendered ggplot outputs
#' into a static HTML page that you can host or share.  Adjust the
#' `plots` data frame so that the `file` column points to the PNG files
#' you created with `ggsave()` (or another graphics device).
#'
#' Run it from an R session:
#'
#' ```r
#' source("build_dashboard.R")
#' generate_dashboard(plots)
#' ```
#'
#' By default the script creates `hedonic_dashboard.html` in the same
#' directory.  You can open the file directly in a browser or deploy it
#' with any static web host.

# Build the table describing your plots ---------------------------------

plots <- data.frame(
  file = c(
    "plots/analise_resumo.png",
    "plots/padrao_dados_faltantes.png",
    "plots/distribuicao_dimensoes.png",
    "plots/mudancas_longitudinais_control.png",
    "plots/mudancas_longitudinais_surgery.png",
    "plots/metricas_rede.png",
    "plots/correlacoes_robusto.png",
    "plots/imc_vs_hedonico.png",
    "plots/distribuicao_mudancas.png",
    "plots/fluxo_participantes.png"
  ),
  title = c(
    "Análise Hedônica - Resumo Visual",
    "Padrão de Dados Faltantes por Grupo e Tempo",
    "Distribuição das Dimensões Hedônicas por Tempo e Grupo",
    "Mudanças Longitudinais - Control",
    "Mudanças Longitudinais - Surgery",
    "Métricas de Rede ao Longo do Tempo",
    "Correlações entre Dimensões (Método Robusto)",
    "Mudança no IMC vs Mudança Hedônica",
    "Distribuição das Mudanças",
    "Fluxo de Participantes - Dados Completos em 5D"
  ),
  stringsAsFactors = FALSE
)

# If you prefer captions that differ from the card title, add a column
# called `caption` to the data frame and populate it.  When the column is
# missing, the `title` will be reused as the caption.

if (!"caption" %in% names(plots)) {
  plots$caption <- plots$title
}


# Dashboard builder ------------------------------------------------------

generate_dashboard <- function(plot_table,
                               output_path = "hedonic_dashboard.html",
                               page_title = "Análise Hedônica - Resumo Visual",
                               background_color = "#f5f6fa",
                               text_color = "#1f2933") {
  stopifnot(all(c("file", "title", "caption") %in% names(plot_table)))

  template_header <- c(
    "<!DOCTYPE html>",
    "<html lang=\"pt-BR\">",
    "  <head>",
    "    <meta charset=\"utf-8\">",
    "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">",
    sprintf("    <title>%s</title>", page_title),
    "    <style>",
    "      body {",
    "        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;",
    sprintf("        background-color: %s;", background_color),
    sprintf("        color: %s;", text_color),
    "        margin: 0;",
    "        padding: 0 0 3rem 0;",
    "      }",
    "      header {",
    "        padding: 2rem 1rem 1rem;",
    "        text-align: center;",
    "      }",
    "      header h1 {",
    "        margin: 0;",
    "        font-size: 2.4rem;",
    "      }",
    "      header p {",
    "        margin: 0.5rem auto 0;",
    "        max-width: 720px;",
    "        font-size: 1rem;",
    "        line-height: 1.5;",
    "      }",
    "      main {",
    "        display: grid;",
    "        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));",
    "        gap: 1.5rem;",
    "        padding: 0 1.5rem;",
    "      }",
    "      figure.plot-card {",
    "        background: #ffffff;",
    "        border-radius: 12px;",
    "        box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);",
    "        overflow: hidden;",
    "        display: flex;",
    "        flex-direction: column;",
    "      }",
    "      figure.plot-card img {",
    "        width: 100%;",
    "        height: auto;",
    "        display: block;",
    "      }",
    "      figure.plot-card figcaption {",
    "        padding: 0.75rem 1rem 1rem;",
    "        font-size: 0.95rem;",
    "        line-height: 1.4;",
    "      }",
    "      @media (min-width: 1280px) {",
    "        main {",
    "          grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));",
    "        }",
    "      }",
    "    </style>",
    "  </head>",
    "  <body>",
    sprintf("    <header>\n      <h1>%s</h1>\n      <p>Todos os gráficos são exportados previamente a partir do R e agregados nesta página para facilitar a exploração compartilhada dos resultados.</p>\n    </header>", page_title),
    "    <main>"
  )

  template_footer <- c(
    "    </main>",
    "  </body>",
    "</html>"
  )

  cards <- vapply(
    seq_len(nrow(plot_table)),
    function(i) {
      row <- plot_table[i, ]
      sprintf(
        paste0(
          "      <figure class=\"plot-card\">\n",
          "        <img src=\"%s\" alt=\"%s\">\n",
          "        <figcaption>%s</figcaption>\n",
          "      </figure>"
        ),
        row$file,
        html_escape(row$title),
        html_escape(row$caption)
      )
    },
    character(1)
  )

  writeLines(c(template_header, cards, template_footer), con = output_path, useBytes = TRUE)
  invisible(output_path)
}


# Helper -----------------------------------------------------------------

html_escape <- function(text) {
  text <- gsub("&", "&amp;", text, fixed = TRUE)
  text <- gsub("<", "&lt;", text, fixed = TRUE)
  text <- gsub(">", "&gt;", text, fixed = TRUE)
  text <- gsub('"', "&quot;", text, fixed = TRUE)
  text
}


# Execute when run interactively -----------------------------------------

if (interactive()) {
  message("Generating dashboard at hedonic_dashboard.html")
  generate_dashboard(plots)
}

