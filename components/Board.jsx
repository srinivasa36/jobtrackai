"use client";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { STATUSES } from "@/lib/constants";
import ApplicationCard from "./ApplicationCard";

export default function Board({ items, onMove, onOpen, onAdd }) {
  const onDragEnd = ({ source, destination, draggableId }) => {
    if (!destination || destination.droppableId === source.droppableId) return;
    onMove(draggableId, destination.droppableId);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6">
        {STATUSES.map((col) => {
          const cards = items.filter((i) => i.status === col.id);
          return (
            <section key={col.id} aria-label={col.label} className="w-[300px] shrink-0 snap-start rounded-2xl border border-line bg-subtle/60 p-2.5">
              <div className="mb-2.5 flex items-center justify-between px-1.5 pt-1">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                  {col.label}
                  <span className="rounded-md bg-surface px-1.5 py-0.5 text-xs font-medium text-muted">{cards.length}</span>
                </div>
                <button onClick={() => onAdd(col.id)} aria-label={`Add to ${col.label}`}
                  className="rounded-md p-1 text-muted transition hover:bg-surface hover:text-fg"><Plus size={16} /></button>
              </div>
              <Droppable droppableId={col.id}>
                {(p, snap) => (
                  <div ref={p.innerRef} {...p.droppableProps}
                    className={`min-h-[140px] rounded-xl p-0.5 transition-colors ${snap.isDraggingOver ? "bg-brand/5 ring-2 ring-dashed ring-brand/30" : ""}`}>
                    {cards.map((item, index) => <ApplicationCard key={item.id} item={item} index={index} onOpen={onOpen} />)}
                    {p.placeholder}
                    {cards.length === 0 && !snap.isDraggingOver && (
                      <div className="grid h-24 place-items-center rounded-xl border border-dashed border-line text-xs text-muted">Nothing here yet</div>
                    )}
                  </div>
                )}
              </Droppable>
            </section>
          );
        })}
      </div>
    </DragDropContext>
  );
}
