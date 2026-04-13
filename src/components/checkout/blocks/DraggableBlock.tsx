import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { BLOCK_DEFINITIONS, type BlockType } from "./types";

interface DraggableBlockProps {
  type: BlockType;
  id: string;
  isPlaced?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  isSelected?: boolean;
}

export function DraggableBlock({ type, id, isPlaced, onRemove, onClick, isSelected }: DraggableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { type, isPlaced },
  });

  const def = BLOCK_DEFINITIONS.find((b) => b.type === type);
  if (!def) return null;

  const Icon = def.icon;

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-grab active:cursor-grabbing transition-all ${
        isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
          : isDragging
          ? "border-primary/50 bg-primary/5 shadow-lg"
          : "border-border hover:border-primary/30 hover:bg-muted/30"
      }`}
    >
      <div
        {...listeners}
        {...attributes}
        className="flex items-center justify-center text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="h-8 w-8 rounded-md bg-muted/50 flex items-center justify-center shrink-0">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{def.label}</p>
        {!isPlaced && (
          <p className="text-[10px] text-muted-foreground truncate">{def.description}</p>
        )}
      </div>
      {isPlaced && onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
