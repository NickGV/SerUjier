/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  type DocumentProps,
} from '@react-pdf/renderer';

import type {
  CountExportInput,
  DetailPdfInput,
  DetailExportRow,
  ListPdfInput,
  TotalsSummaryRow,
} from './types';
import { formatDate, formatDateLong, formatDateTime } from './utils';

const RECORDS_PER_PAGE = 25;

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontFamily: 'Helvetica',
    fontSize: 9,
    lineHeight: 1.3,
  },
  pageLandscape: {
    padding: 20,
    fontFamily: 'Helvetica',
    fontSize: 7,
    lineHeight: 1.2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  logo: {
    width: 30,
    height: 30,
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
  },
  subtitle: {
    fontSize: 10,
    color: '#475569',
  },
  section: {
    marginBottom: 10,
  },
  metadataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  metadataItem: {
    width: '48%',
  },
  label: {
    fontSize: 8,
    color: '#64748b',
  },
  value: {
    fontSize: 9,
    fontWeight: 600,
  },
  summaryHeader: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#4472C4',
    color: '#ffffff',
    fontSize: 7,
    fontWeight: 700,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 3,
    paddingHorizontal: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  cellTiny: {
    width: '4%',
  },
  cellSm: {
    width: '5%',
  },
  cellNarrow: {
    width: '6%',
  },
  cellSmall: {
    width: '8%',
  },
  cellMed: {
    width: '10%',
  },
  cellMedWide: {
    width: '12%',
  },
  cellWide: {
    width: '16%',
  },
  cellXWide: {
    width: '22%',
  },
  cellFlex: {
    flexGrow: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#64748b',
  },
});

function resolveDetailRows(input: DetailPdfInput): DetailExportRow[] {
  if (input.action === 'asistentes') {
    return input.asistentes;
  }
  if (input.action === 'faltantes') {
    return input.faltantes;
  }
  return [...input.asistentes, ...input.faltantes];
}

function buildTotalsSection(totals: TotalsSummaryRow[]) {
  return totals.map((row) => (
    <View key={row.label} style={styles.summaryRow}>
      <Text>{row.label}</Text>
      <Text>{row.value}</Text>
    </View>
  ));
}

export function buildDetailPdfDocument(
  input: DetailPdfInput
): React.ReactElement<DocumentProps> {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {input.logoBase64 ? (
              <Image style={styles.logo} src={input.logoBase64} />
            ) : null}
            <View>
              <Text style={styles.title}>SerUjier</Text>
              <Text style={styles.subtitle}>Informe de Asistencia</Text>
            </View>
          </View>
          <Text>{formatDateLong(input.fecha)}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.metadataGrid}>
            <View style={styles.metadataItem}>
              <Text style={styles.label}>Servicio</Text>
              <Text style={styles.value}>{input.servicio}</Text>
            </View>
            <View style={styles.metadataItem}>
              <Text style={styles.label}>Fecha</Text>
              <Text style={styles.value}>{formatDate(input.fecha)}</Text>
            </View>
            <View style={styles.metadataItem}>
              <Text style={styles.label}>Ujier(es)</Text>
              <Text style={styles.value}>{input.ujieres}</Text>
            </View>
            <View style={styles.metadataItem}>
              <Text style={styles.label}>
                {input.action === 'faltantes'
                  ? 'Total faltantes'
                  : 'Total asistentes'}
              </Text>
              <Text style={styles.value}>
                {input.action === 'faltantes'
                  ? input.faltantesCount
                  : input.totalAsistentes}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.summaryHeader}>Totales por categoria</Text>
          {buildTotalsSection(input.totalesPorCategoria)}
        </View>

        <View style={styles.section}>
          <View style={styles.tableHeader}>
            <Text style={[styles.cellFlex, styles.cellSm]}>#</Text>
            <Text style={[styles.cellFlex, styles.cellXWide]}>Nombre</Text>
            <Text style={[styles.cellFlex, styles.cellMed]}>Categoría</Text>
            <Text style={[styles.cellFlex, styles.cellMed]}>Estado</Text>
          </View>
          {resolveDetailRows(input).map((row, index) => (
            <View
              key={`${row.nombre}-${index}`}
              style={styles.tableRow}
              wrap={false}
            >
              <Text style={[styles.cellFlex, styles.cellSm]}>{index + 1}</Text>
              <Text style={[styles.cellFlex, styles.cellXWide]}>
                {row.nombre}
              </Text>
              <Text style={[styles.cellFlex, styles.cellMed]}>
                {row.categoria}
              </Text>
              <Text style={[styles.cellFlex, styles.cellMed]}>
                {row.estado}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
            fixed
          />
          <Text>{`Generado: ${formatDateTime(new Date())}`}</Text>
        </View>
      </Page>
    </Document>
  );
}

export function buildConteoPdfDocument(
  input: CountExportInput
): React.ReactElement<DocumentProps> {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View>
              <Text style={styles.title}>SerUjier</Text>
              <Text style={styles.subtitle}>Conteo de Asistencia</Text>
            </View>
          </View>
          <Text>{formatDateLong(input.fecha)}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.metadataGrid}>
            <View style={styles.metadataItem}>
              <Text style={styles.label}>Servicio</Text>
              <Text style={styles.value}>{input.servicio}</Text>
            </View>
            <View style={styles.metadataItem}>
              <Text style={styles.label}>Fecha</Text>
              <Text style={styles.value}>{formatDate(input.fecha)}</Text>
            </View>
            <View style={styles.metadataItem}>
              <Text style={styles.label}>Ujier(es)</Text>
              <Text style={styles.value}>{input.ujieres}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.summaryHeader}>Totales por categoria</Text>
          {buildTotalsSection(input.totalesPorCategoria)}
        </View>

        <View style={styles.section}>
          <View style={styles.summaryRow}>
            <Text style={{ fontWeight: 700 }}>Total Asistentes</Text>
            <Text style={{ fontWeight: 700 }}>{input.asistentesCount}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={{ fontWeight: 700 }}>Total Faltantes</Text>
            <Text style={{ fontWeight: 700 }}>{input.faltantesCount}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
            fixed
          />
          <Text>{`Generado: ${formatDateTime(new Date())}`}</Text>
        </View>
      </Page>
    </Document>
  );
}

function buildListTableRows(
  records: ListPdfInput['records'],
  startIndex: number
) {
  return records.map((record, idx) => {
    const absIndex = startIndex + idx + 1;
    const ujieres = Array.isArray(record.ujier)
      ? record.ujier.join(', ')
      : record.ujier;

    return (
      <View key={`${record.id}-${idx}`} style={styles.tableRow} wrap={false}>
        <Text style={styles.cellTiny}>{absIndex}</Text>
        <Text style={styles.cellSmall}>{formatDate(record.fecha)}</Text>
        <Text style={styles.cellMedWide}>{record.servicio}</Text>
        <Text style={styles.cellMedWide}>{ujieres}</Text>
        <Text style={styles.cellNarrow}>{record.hermanos}</Text>
        <Text style={styles.cellNarrow}>{record.hermanas}</Text>
        <Text style={styles.cellNarrow}>{record.ninos}</Text>
        <Text style={styles.cellNarrow}>{record.adolescentes}</Text>
        <Text style={styles.cellNarrow}>{record.amigos}</Text>
        <Text style={styles.cellNarrow}>{record.heRestauracion || 0}</Text>
        <Text style={styles.cellNarrow}>{record.hermanosVisitas || 0}</Text>
        <Text style={styles.cellNarrow}>{record.total}</Text>
      </View>
    );
  });
}

function buildRecordsPages(
  input: ListPdfInput,
  totals: TotalsSummaryRow[]
): React.ReactElement[] {
  const pages: React.ReactElement[] = [];
  const recordCount = input.records.length;

  for (let i = 0; i < recordCount; i += RECORDS_PER_PAGE) {
    const slice = input.records.slice(i, i + RECORDS_PER_PAGE);
    const pageIndex = Math.floor(i / RECORDS_PER_PAGE);
    const totalPages = Math.ceil(recordCount / RECORDS_PER_PAGE);

    pages.push(
      <Page
        key={`page-${pageIndex}`}
        size="A4"
        orientation="landscape"
        style={styles.pageLandscape}
      >
        {pageIndex === 0 && (
          <>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                {input.logoBase64 ? (
                  <Image style={styles.logo} src={input.logoBase64} />
                ) : null}
                <View>
                  <Text style={styles.title}>SerUjier</Text>
                  <Text style={styles.subtitle}>{input.titulo}</Text>
                </View>
              </View>
              <Text>{input.filtroFecha}</Text>
            </View>

            <View style={styles.section}>
              <View style={styles.metadataGrid}>
                <View style={styles.metadataItem}>
                  <Text style={styles.label}>Servicio</Text>
                  <Text style={styles.value}>{input.filtroServicio}</Text>
                </View>
                <View style={styles.metadataItem}>
                  <Text style={styles.label}>Registros</Text>
                  <Text style={styles.value}>{input.stats.totalRegistros}</Text>
                </View>
                <View style={styles.metadataItem}>
                  <Text style={styles.label}>Promedio</Text>
                  <Text style={styles.value}>
                    {input.stats.promedioAsistencia}
                  </Text>
                </View>
                <View style={styles.metadataItem}>
                  <Text style={styles.label}>Mayor</Text>
                  <Text style={styles.value}>
                    {input.stats.mayorAsistencia}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.summaryHeader}>Totales por categoria</Text>
              {buildTotalsSection(totals)}
            </View>
          </>
        )}

        <View style={styles.section}>
          <View style={[styles.tableHeader]} fixed>
            <Text style={styles.cellTiny}>#</Text>
            <Text style={styles.cellSmall}>Fecha</Text>
            <Text style={styles.cellMedWide}>Servicio</Text>
            <Text style={styles.cellMedWide}>Ujier(es)</Text>
            <Text style={styles.cellNarrow}>Hnos</Text>
            <Text style={styles.cellNarrow}>Hnas</Text>
            <Text style={styles.cellNarrow}>Niños</Text>
            <Text style={styles.cellNarrow}>Adol</Text>
            <Text style={styles.cellNarrow}>Amig</Text>
            <Text style={styles.cellNarrow}>HeR</Text>
            <Text style={styles.cellNarrow}>HVis</Text>
            <Text style={styles.cellNarrow}>Total</Text>
          </View>
          {buildListTableRows(slice, i)}
        </View>

        <View style={styles.footer}>
          <Text fixed>{`Página ${pageIndex + 1} de ${totalPages}`}</Text>
          <Text fixed>{`Generado: ${formatDateTime(new Date())}`}</Text>
        </View>
      </Page>
    );
  }

  return pages;
}

export function buildListPdfDocument(
  input: ListPdfInput
): React.ReactElement<DocumentProps> {
  const totals: TotalsSummaryRow[] = [
    { label: 'Hermanos', value: input.stats.totalHermanos },
    { label: 'Hermanas', value: input.stats.totalHermanas },
    { label: 'Niños', value: input.stats.totalNinos },
    { label: 'Adolescentes', value: input.stats.totalAdolescentes },
    { label: 'Amigos', value: input.stats.totalAmigos },
    { label: 'He. Restauración', value: input.stats.totalHeRestauracion },
    { label: 'H. Visitas', value: input.stats.totalHermanosVisitas },
    { label: 'Total', value: input.stats.granTotal },
  ];

  const pages =
    input.records.length === 0
      ? [
          <Page key="empty" size="A4" style={styles.page}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                {input.logoBase64 ? (
                  <Image style={styles.logo} src={input.logoBase64} />
                ) : null}
                <View>
                  <Text style={styles.title}>SerUjier</Text>
                  <Text style={styles.subtitle}>{input.titulo}</Text>
                </View>
              </View>
              <Text>{input.filtroFecha}</Text>
            </View>
            <Text
              style={{ marginTop: 40, textAlign: 'center', color: '#94a3b8' }}
            >
              No hay registros para exportar
            </Text>
          </Page>,
        ]
      : buildRecordsPages(input, totals);

  return <Document>{pages}</Document>;
}
