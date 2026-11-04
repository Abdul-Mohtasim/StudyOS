import React from "react";
import { Check } from "lucide-react";
import { parseChecklistLine } from "./studyHelpers";

// A tiny, safe markdown renderer for notes. It builds React elements (never
// raw HTML), so note text can't inject markup. Supported:
//   **bold**  *italic*  `code`   # / ## / ### headings
//   - bullets   1. numbered   - [ ] / - [x] checklists (clickable)

const INLINE = /(\*\*[^*\n]+\*\*|\*[^*\s][^*\n]*\*|`[^`\n]+`)/g;

function renderInline(text, keyPrefix) {
  return text.split(INLINE).map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (!part) return null;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return <code key={key}>{part.slice(1, -1)}</code>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    return <React.Fragment key={key}>{part}</React.Fragment>;
  });
}

const BULLET = /^\s*[-*]\s+(.*)$/;
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/;
const HEADING = /^(#{1,3})\s+(.*)$/;

export default function MarkdownView({ content, onToggleCheck }) {
  const lines = String(content || "").split("\n");
  const blocks = [];
  let list = null;

  const closeList = () => {
    if (list) {
      blocks.push(list);
      list = null;
    }
  };

  lines.forEach((line, index) => {
    const checklist = parseChecklistLine(line);

    if (checklist) {
      if (!list || list.type !== "check") {
        closeList();
        list = { type: "check", items: [] };
      }
      list.items.push({ index, ...checklist });
      return;
    }

    const bullet = BULLET.exec(line);
    if (bullet) {
      if (!list || list.type !== "ul") {
        closeList();
        list = { type: "ul", items: [] };
      }
      list.items.push({ index, text: bullet[1] });
      return;
    }

    const numbered = NUMBERED.exec(line);
    if (numbered) {
      if (!list || list.type !== "ol") {
        closeList();
        list = { type: "ol", items: [] };
      }
      list.items.push({ index, text: numbered[1] });
      return;
    }

    closeList();

    if (!line.trim()) return;

    const heading = HEADING.exec(line);
    if (heading) {
      blocks.push({ type: "h", level: heading[1].length, text: heading[2], index });
      return;
    }

    blocks.push({ type: "p", text: line, index });
  });

  closeList();

  return (
    <div className="note-md">
      {blocks.map((block, blockIndex) => {
        const key = `b${blockIndex}`;

        if (block.type === "h") {
          return (
            <p key={key} className={`md-heading md-h${block.level}`}>
              {renderInline(block.text, key)}
            </p>
          );
        }

        if (block.type === "p") {
          return <p key={key}>{renderInline(block.text, key)}</p>;
        }

        if (block.type === "ul" || block.type === "ol") {
          const Tag = block.type;
          return (
            <Tag key={key} className={`md-list md-${block.type}`}>
              {block.items.map((item) => (
                <li key={item.index}>{renderInline(item.text, `${key}-${item.index}`)}</li>
              ))}
            </Tag>
          );
        }

        return (
          <ul key={key} className="md-list md-checklist">
            {block.items.map((item) => (
              <li key={item.index} className={item.checked ? "is-checked" : ""}>
                <button
                  type="button"
                  className="md-check"
                  role="checkbox"
                  aria-checked={item.checked}
                  disabled={!onToggleCheck}
                  onClick={() => onToggleCheck && onToggleCheck(item.index)}
                >
                  {item.checked && <Check size={11} strokeWidth={3} aria-hidden="true" />}
                  <span className="sr-only">
                    {item.checked ? "Mark not done" : "Mark done"}
                  </span>
                </button>
                <span>{renderInline(item.text, `${key}-${item.index}`)}</span>
              </li>
            ))}
          </ul>
        );
      })}
    </div>
  );
}
