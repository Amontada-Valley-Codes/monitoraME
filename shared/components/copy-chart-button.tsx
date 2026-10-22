"use client";

import { useState } from "react";
import { Copy, Download, FileSpreadsheet, FileText, ImageDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { downloadBlob, makeExport, type ExportDataset } from "@/shared/lib/export";

export function CopyChartButton({ title, target, dataset }: { title: string; target: () => HTMLElement | null; dataset: ExportDataset }) {
  const [busy, setBusy] = useState(false);

  async function copyChart() {
    const container = target();
    const source = container?.querySelector("svg");
    if (!source) {
      toast.error("Não foi possível localizar o gráfico para copiar.");
      return;
    }
    if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
      toast.error("Seu navegador não permite copiar gráficos como imagem.");
      return;
    }

    setBusy(true);
    try {
      const svg = source.cloneNode(true) as SVGSVGElement;
      const bounds = source.getBoundingClientRect();
      const chartWidth = Math.max(1, Math.round(bounds.width));
      const chartHeight = Math.max(1, Math.round(bounds.height));
      const width = Math.max(1100, chartWidth * 2);
      const scale = width / chartWidth;
      const height = Math.round(chartHeight * scale);
      const rowHeight = 42;
      const tableTop = height + 132;
      const footerTop = tableTop + 54 + dataset.rows.length * rowHeight;
      svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      svg.setAttribute("width", String(width));
      svg.setAttribute("height", String(footerTop + 52));
      svg.setAttribute("viewBox", `0 0 ${width} ${footerTop + 52}`);
      const originals = Array.from(source.querySelectorAll<SVGElement>("*"));
      svg.querySelectorAll<SVGElement>("*").forEach((element, index) => {
        const original = originals[index] ?? element;
        const computed = getComputedStyle(original);
        for (const property of ["fill", "stroke", "stroke-width", "opacity", "font-family", "font-size", "font-weight", "color"]) {
          const value = computed.getPropertyValue(property);
          if (value) element.style.setProperty(property, value);
        }
      });
      const background = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      background.setAttribute("width", String(width));
      background.setAttribute("height", String(footerTop + 52));
      background.setAttribute("fill", "#ffffff");
      svg.insertBefore(background, svg.firstChild);
      const chart = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      chart.setAttribute("x", "0");
      chart.setAttribute("y", "0");
      chart.setAttribute("width", String(width));
      chart.setAttribute("height", String(height));
      chart.setAttribute("viewBox", source.getAttribute("viewBox") ?? `0 0 ${width} ${height}`);
      while (svg.childNodes.length > 1) chart.appendChild(svg.childNodes[1]);
      svg.appendChild(chart);
      const text = (value: string, x: number, y: number, size = 17, weight = "400", color = "#26364d", anchor = "start") => {
        const node = document.createElementNS("http://www.w3.org/2000/svg", "text");
        node.setAttribute("x", String(x)); node.setAttribute("y", String(y)); node.setAttribute("fill", color);
        node.setAttribute("font-family", "Arial, sans-serif"); node.setAttribute("font-size", String(size));
        node.setAttribute("font-weight", weight); node.setAttribute("text-anchor", anchor); node.textContent = value;
        svg.appendChild(node);
      };
      const header = document.createElementNS("http://www.w3.org/2000/svg", "text");
      header.setAttribute("x", "32"); header.setAttribute("y", String(height + 48)); header.setAttribute("fill", "#102b52");
      header.setAttribute("font-family", "Arial, sans-serif"); header.setAttribute("font-size", "28"); header.setAttribute("font-weight", "700"); header.textContent = title;
      svg.appendChild(header);
      const columnWidths = dataset.columns.map(() => (width - 64) / dataset.columns.length);
      const columnX = (index: number) => 32 + columnWidths.slice(0, index).reduce((sum, item) => sum + item, 0);
      const tableHeader = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      tableHeader.setAttribute("x", "32"); tableHeader.setAttribute("y", String(tableTop)); tableHeader.setAttribute("width", String(width - 64)); tableHeader.setAttribute("height", "44"); tableHeader.setAttribute("rx", "6"); tableHeader.setAttribute("fill", "#edf3fb"); svg.appendChild(tableHeader);
      dataset.columns.forEach((column, index) => text(column, columnX(index) + 10, tableTop + 28, 15, "700"));
      dataset.rows.forEach((row, rowIndex) => {
        const y = tableTop + 44 + rowIndex * rowHeight;
        if (rowIndex % 2 === 1) { const stripe = document.createElementNS("http://www.w3.org/2000/svg", "rect"); stripe.setAttribute("x", "32"); stripe.setAttribute("y", String(y)); stripe.setAttribute("width", String(width - 64)); stripe.setAttribute("height", String(rowHeight)); stripe.setAttribute("fill", "#f8fafc"); svg.appendChild(stripe); }
        row.forEach((value, index) => text(String(value), columnX(index) + 10, y + 26, 14, "400", "#3d4d62"));
      });
      text(`Fonte: MonitoraME · ${new Date().toLocaleDateString("pt-BR")}`, 32, footerTop + 32, 14, "600", "#52627a");

      const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml;charset=utf-8" });
      const image = new Image();
      image.src = URL.createObjectURL(blob);
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = footerTop + 52;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas indisponível");
      context.drawImage(image, 0, 0, width, footerTop + 52);
      URL.revokeObjectURL(image.src);
      const png = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("PNG indisponível")), "image/png"));
      await navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
      toast.success("Gráfico copiado com a marca MonitoraME.");
    } catch {
      toast.error("Não foi possível copiar o gráfico. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  async function download(format: "csv" | "xlsx" | "pdf") {
    setBusy(true);
    try {
      const blob = await makeExport(format, dataset);
      downloadBlob(blob, `MonitoraME_${title.trim().replaceAll(/\s+/g, "_")}.${format}`);
      toast.success(`Dados do gráfico baixados em ${format.toUpperCase()}.`);
    } catch {
      toast.error("Não foi possível exportar os dados do gráfico.");
    } finally {
      setBusy(false);
    }
  }

  return <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button type="button" variant="outline" size="sm" className="min-h-9" disabled={busy} aria-label={`Exportar gráfico: ${title}`}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        <span className="hidden sm:inline">Exportar gráfico</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onSelect={() => void copyChart()}><Copy className="size-4" />Copiar imagem PNG</DropdownMenuItem>
      <DropdownMenuItem onSelect={() => void download("csv")}><FileText className="size-4" />Baixar dados CSV</DropdownMenuItem>
      <DropdownMenuItem onSelect={() => void download("xlsx")}><FileSpreadsheet className="size-4" />Baixar dados Excel</DropdownMenuItem>
      <DropdownMenuItem onSelect={() => void download("pdf")}><ImageDown className="size-4" />Baixar tabela em PDF</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>;
}
