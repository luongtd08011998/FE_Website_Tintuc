"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import {
  Box,
  IconButton,
  Divider,
  Tooltip,
  Paper,
  Popover,
} from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import FormatAlignJustifyIcon from "@mui/icons-material/FormatAlignJustify";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import TableChartIcon from "@mui/icons-material/TableChart";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import CodeIcon from "@mui/icons-material/Code";
import { useEffect, useRef, useState } from "react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  minHeight?: number;
}

export default function RichTextEditor({
  value,
  onChange,
  minHeight = 300,
}: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Image,
      Link.configure({ openOnClick: false }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // sync external value reset (e.g. when edit page loads default values)
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // table picker state
  const [tableAnchor, setTableAnchor] = useState<HTMLElement | null>(null);
  const [hovered, setHovered] = useState({ rows: 0, cols: 0 });
  const MAX_ROWS = 8;
  const MAX_COLS = 8;

  // html source mode
  const [htmlMode, setHtmlMode] = useState(false);
  const [rawHtml, setRawHtml] = useState("");

  if (!editor) return null;

  const btn = (
    active: boolean,
    onClick: () => void,
    title: string,
    icon: React.ReactNode,
  ) => (
    <Tooltip title={title}>
      <IconButton
        size="small"
        onClick={onClick}
        sx={{
          borderRadius: 1,
          bgcolor: active ? "action.selected" : "transparent",
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        {icon}
      </IconButton>
    </Tooltip>
  );

  return (
    <Paper variant="outlined" sx={{ borderRadius: 1 }}>
      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 0.25,
          px: 1,
          py: 0.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "grey.50",
        }}
      >
        {/* History */}
        {btn(
          false,
          () => editor.chain().focus().undo().run(),
          "Hoàn tác",
          <UndoIcon fontSize="small" />,
        )}
        {btn(
          false,
          () => editor.chain().focus().redo().run(),
          "Làm lại",
          <RedoIcon fontSize="small" />,
        )}

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Heading */}
        {([1, 2, 3] as const).map((level) => (
          <span key={level} style={{ display: "contents" }}>
            {btn(
              editor.isActive("heading", { level }),
              () => editor.chain().focus().toggleHeading({ level }).run(),
              `Tiêu đề ${level}`,
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  minWidth: 20,
                  textAlign: "center",
                }}
              >
                H{level}
              </span>,
            )}
          </span>
        ))}

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Inline */}
        {btn(
          editor.isActive("bold"),
          () => editor.chain().focus().toggleBold().run(),
          "In đậm (Ctrl+B)",
          <FormatBoldIcon fontSize="small" />,
        )}
        {btn(
          editor.isActive("italic"),
          () => editor.chain().focus().toggleItalic().run(),
          "In nghiêng (Ctrl+I)",
          <FormatItalicIcon fontSize="small" />,
        )}
        {btn(
          editor.isActive("underline"),
          () => editor.chain().focus().toggleUnderline().run(),
          "Gạch chân (Ctrl+U)",
          <FormatUnderlinedIcon fontSize="small" />,
        )}

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Align */}
        {btn(
          editor.isActive({ textAlign: "left" }),
          () => editor.chain().focus().setTextAlign("left").run(),
          "Căn trái",
          <FormatAlignLeftIcon fontSize="small" />,
        )}
        {btn(
          editor.isActive({ textAlign: "center" }),
          () => editor.chain().focus().setTextAlign("center").run(),
          "Căn giữa",
          <FormatAlignCenterIcon fontSize="small" />,
        )}
        {btn(
          editor.isActive({ textAlign: "right" }),
          () => editor.chain().focus().setTextAlign("right").run(),
          "Căn phải",
          <FormatAlignRightIcon fontSize="small" />,
        )}
        {btn(
          editor.isActive({ textAlign: "justify" }),
          () => editor.chain().focus().setTextAlign("justify").run(),
          "Căn đều",
          <FormatAlignJustifyIcon fontSize="small" />,
        )}

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Lists */}
        {btn(
          editor.isActive("bulletList"),
          () => editor.chain().focus().toggleBulletList().run(),
          "Danh sách gạch đầu dòng",
          <FormatListBulletedIcon fontSize="small" />,
        )}
        {btn(
          editor.isActive("orderedList"),
          () => editor.chain().focus().toggleOrderedList().run(),
          "Danh sách số thứ tự",
          <FormatListNumberedIcon fontSize="small" />,
        )}
        {btn(
          editor.isActive("blockquote"),
          () => editor.chain().focus().toggleBlockquote().run(),
          "Trích dẫn",
          <FormatQuoteIcon fontSize="small" />,
        )}

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Table picker */}
        <Tooltip title="Chèn bảng">
          <IconButton
            size="small"
            onClick={(e) => setTableAnchor(e.currentTarget)}
            sx={{ borderRadius: 1, "&:hover": { bgcolor: "action.hover" } }}
          >
            <TableChartIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Popover
          open={Boolean(tableAnchor)}
          anchorEl={tableAnchor}
          onClose={() => setTableAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <Box sx={{ p: 1.5 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: `repeat(${MAX_COLS}, 22px)`,
                gap: "3px",
                mb: 0.5,
              }}
            >
              {Array.from({ length: MAX_ROWS * MAX_COLS }).map((_, i) => {
                const r = Math.floor(i / MAX_COLS) + 1;
                const c = (i % MAX_COLS) + 1;
                const active = r <= hovered.rows && c <= hovered.cols;
                return (
                  <Box
                    key={i}
                    onMouseEnter={() => setHovered({ rows: r, cols: c })}
                    onMouseLeave={() => setHovered({ rows: 0, cols: 0 })}
                    onClick={() => {
                      editor
                        .chain()
                        .focus()
                        .insertTable({
                          rows: r,
                          cols: c,
                          withHeaderRow: true,
                        })
                        .run();
                      setTableAnchor(null);
                      setHovered({ rows: 0, cols: 0 });
                    }}
                    sx={{
                      width: 22,
                      height: 22,
                      border: "1px solid",
                      borderColor: active ? "primary.main" : "grey.300",
                      bgcolor: active ? "primary.light" : "transparent",
                      cursor: "pointer",
                      borderRadius: 0.5,
                    }}
                  />
                );
              })}
            </Box>
            <Box
              sx={{
                fontSize: 11,
                color: "text.secondary",
                textAlign: "center",
              }}
            >
              {hovered.rows > 0
                ? `${hovered.rows} × ${hovered.cols}`
                : "Di chuột để chọn kích thước"}
            </Box>
          </Box>
        </Popover>
        {btn(
          false,
          () => editor.chain().focus().setHorizontalRule().run(),
          "Đường kẻ ngang",
          <HorizontalRuleIcon fontSize="small" />,
        )}

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* HTML source toggle */}
        <Tooltip title={htmlMode ? "Quay lại soạn thảo" : "Chỉnh sửa HTML"}>
          <IconButton
            size="small"
            onClick={() => {
              if (!htmlMode) {
                // entering html mode: capture current html
                setRawHtml(editor.getHTML());
                setHtmlMode(true);
              } else {
                // leaving html mode: push raw html back into editor
                editor.commands.setContent(rawHtml, { emitUpdate: false });
                onChange(rawHtml);
                setHtmlMode(false);
              }
            }}
            sx={{
              borderRadius: 1,
              bgcolor: htmlMode ? "action.selected" : "transparent",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <CodeIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Editor area */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          minHeight,
          display: htmlMode ? "none" : undefined,
          "& .tiptap": {
            outline: "none",
            minHeight,
            "& p": { margin: "0.25em 0" },
            "& h1": {
              fontSize: "1.8em",
              fontWeight: 700,
              margin: "0.5em 0 0.25em",
            },
            "& h2": {
              fontSize: "1.4em",
              fontWeight: 700,
              margin: "0.5em 0 0.25em",
            },
            "& h3": {
              fontSize: "1.15em",
              fontWeight: 700,
              margin: "0.5em 0 0.25em",
            },
            "& ul": { paddingLeft: "1.5em" },
            "& ol": { paddingLeft: "1.5em" },
            "& blockquote": {
              borderLeft: "4px solid #ccc",
              paddingLeft: "1em",
              color: "text.secondary",
              fontStyle: "italic",
              margin: "0.5em 0",
            },
            "& table": {
              borderCollapse: "collapse",
              width: "100%",
              margin: "0.5em 0",
            },
            "& td, & th": {
              border: "1px solid #ccc",
              padding: "6px 12px",
              minWidth: 80,
            },
            "& th": { bgcolor: "#f5f5f5", fontWeight: 700 },
            "& hr": {
              border: "none",
              borderTop: "2px solid #e0e0e0",
              margin: "1em 0",
            },
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>

      {/* HTML source textarea */}
      {htmlMode && (
        <Box
          component="textarea"
          value={rawHtml}
          onChange={(e) => {
            setRawHtml(e.target.value);
            onChange(e.target.value);
          }}
          spellCheck={false}
          sx={{
            display: "block",
            width: "100%",
            minHeight,
            px: 2,
            py: 1.5,
            border: "none",
            outline: "none",
            fontFamily: "monospace",
            fontSize: 13,
            lineHeight: 1.6,
            resize: "vertical",
            bgcolor: "grey.50",
            color: "text.primary",
            boxSizing: "border-box",
          }}
        />
      )}
    </Paper>
  );
}
