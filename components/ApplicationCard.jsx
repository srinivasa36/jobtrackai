"use client";
import { Draggable } from "@hello-pangea/dnd";
import { MapPin } from "lucide-react";
import { ScoreRing } from "./ui";
import { avatarColor, initials, timeAgo } from "@/lib/utils";

export default function ApplicationCard({ item, index, onOpen }) {
  return (
    <Draggable draggableId={item.id} index={index}>
      {(p, snap) => (
        <div
          ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps}
          onClick={() => onOpen(item)}
          className={`mb-2.5 cursor-pointer rounded-xl border bg-surface p-3.5 transition-colors ${
            snap.isDragging ? "border-brand shadow-pop" : "border-line shadow-card hover:border-brand/50"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-xs font-bold text-white" style={{ background: avatarColor(item.company) }}>
              {initials(item.company)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold leading-tight">{item.company}</p>
              <p className="mt-0.5 truncate text-xs text-muted">{item.role}</p>
            </div>
            {item.matchScore != null && <ScoreRing value={item.matchScore} />}
          </div>

          {item.skills?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {item.skills.slice(0, 3).map((s) => (
                <span key={s} className="rounded-md bg-subtle px-1.5 py-0.5 text-[11px] text-muted">{s}</span>
              ))}
              {item.skills.length > 3 && <span className="px-1 py-0.5 text-[11px] text-muted">+{item.skills.length - 3}</span>}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between text-[11px] text-muted">
            <span className="flex min-w-0 items-center gap-1 truncate">
              <MapPin size={11} className="shrink-0" />
              <span className="truncate">{item.location || "No location"}</span>
            </span>
            <span className="shrink-0">{timeAgo(item.updatedAt)}</span>
          </div>
        </div>
      )}
    </Draggable>
  );
}
