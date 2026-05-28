// Minimal .xlsx generator — no external dependencies.
// An .xlsx file is a ZIP archive of XML files (Office Open XML).

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ crc32Table[(crc ^ data[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const crc32Table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crc32Table[i] = c;
}

const encoder = new TextEncoder();

function str(s: string): Uint8Array {
  return encoder.encode(s);
}

function zip(files: Record<string, Uint8Array>): Uint8Array {
  const entries = Object.entries(files).map(([name, data]) => ({
    nameBytes: str(name),
    data,
    crc: crc32(data),
  }));

  const localSize = entries.reduce((s, e) => s + 30 + e.nameBytes.length + e.data.length, 0);
  const centralSize = entries.reduce((s, e) => s + 46 + e.nameBytes.length, 0);
  const buf = new Uint8Array(localSize + centralSize + 22);
  const dv = new DataView(buf.buffer);

  let off = 0;
  const offsets: number[] = [];

  // Local file headers
  for (const e of entries) {
    offsets.push(off);
    dv.setUint32(off, 0x04034b50, true); off += 4;
    dv.setUint16(off, 20, true); off += 2;
    dv.setUint16(off, 0, true); off += 2;
    dv.setUint16(off, 0, true); off += 2;
    dv.setUint16(off, 0, true); off += 2;
    dv.setUint16(off, 0, true); off += 2;
    dv.setUint32(off, e.crc, true); off += 4;
    dv.setUint32(off, e.data.length, true); off += 4;
    dv.setUint32(off, e.data.length, true); off += 4;
    dv.setUint16(off, e.nameBytes.length, true); off += 2;
    dv.setUint16(off, 0, true); off += 2;
    buf.set(e.nameBytes, off); off += e.nameBytes.length;
    buf.set(e.data, off); off += e.data.length;
  }

  // Central directory
  const cdStart = off;
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    dv.setUint32(off, 0x02014b50, true); off += 4;
    dv.setUint16(off, 20, true); off += 2;
    dv.setUint16(off, 20, true); off += 2;
    dv.setUint16(off, 0, true); off += 2;
    dv.setUint16(off, 0, true); off += 2;
    dv.setUint16(off, 0, true); off += 2;
    dv.setUint16(off, 0, true); off += 2;
    dv.setUint32(off, e.crc, true); off += 4;
    dv.setUint32(off, e.data.length, true); off += 4;
    dv.setUint32(off, e.data.length, true); off += 4;
    dv.setUint16(off, e.nameBytes.length, true); off += 2;
    dv.setUint16(off, 0, true); off += 2;
    dv.setUint16(off, 0, true); off += 2;
    dv.setUint16(off, 0, true); off += 2;
    dv.setUint16(off, 0, true); off += 2;
    dv.setUint32(off, 0, true); off += 4;
    dv.setUint32(off, offsets[i], true); off += 4;
    buf.set(e.nameBytes, off); off += e.nameBytes.length;
  }

  // End of central directory
  dv.setUint32(off, 0x06054b50, true); off += 4;
  dv.setUint16(off, 0, true); off += 2;
  dv.setUint16(off, 0, true); off += 2;
  dv.setUint16(off, entries.length, true); off += 2;
  dv.setUint16(off, entries.length, true); off += 2;
  dv.setUint32(off, centralSize, true); off += 4;
  dv.setUint32(off, cdStart, true); off += 4;
  dv.setUint16(off, 0, true); off += 2;

  return buf;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function exportToXlsx(
  rows: Record<string, string | number>[],
  sheetName: string,
  filename: string,
) {
  if (rows.length === 0) return;

  const headers = Object.keys(rows[0]);

  // Build worksheet XML with inline strings
  let sheetData = "";
  for (let r = 0; r <= rows.length; r++) {
    sheetData += "<row>";
    for (let c = 0; c < headers.length; c++) {
      const col = String.fromCharCode(65 + (c % 26));
      if (r === 0) {
        sheetData += `<c r="${col}1" t="inlineStr"><is><t>${esc(headers[c])}</t></is></c>`;
      } else {
        const val = rows[r - 1][headers[c]];
        if (typeof val === "number") {
          sheetData += `<c r="${col}${r + 1}"><v>${val}</v></c>`;
        } else {
          sheetData += `<c r="${col}${r + 1}" t="inlineStr"><is><t>${esc(String(val))}</t></is></c>`;
        }
      }
    }
    sheetData += "</row>";
  }

  const worksheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetData>${sheetData}</sheetData>
</worksheet>`;

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`;

  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="${esc(sheetName)}" sheetId="1" r:id="rId1"/></sheets>
</workbook>`;

  const wbRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`;

  const zipped = zip({
    "[Content_Types].xml": str(contentTypes),
    "_rels/.rels": str(rels),
    "xl/workbook.xml": str(workbook),
    "xl/_rels/workbook.xml.rels": str(wbRels),
    "xl/worksheets/sheet1.xml": str(worksheet),
  });

  const blob = new Blob([zipped], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
