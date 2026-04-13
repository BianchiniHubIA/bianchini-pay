import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import type { DropZoneId, PlacedBlock } from "./types";
import { DraggableBlock } from "./DraggableBlock";

interface DropZoneProps {
  id: DropZoneId;
  label: string;
  blocks: PlacedBlock[];
  onRemoveBlock: (index: number) => void;
  onSelectBlock: (zoneId: DropZoneId, index: number) => void;
  selectedBlock?: { zoneId: DropZoneId; index: number } | null;
  isCompact?: boolean;
}

export function DropZone({ id, label, blocks, onRemoveBlock, onSelectBlock, selectedBlock, isCompact }: DropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  const hasBlocks = blocks.length > 0;

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border-2 border-dashed transition-all ${
        isOver
          ? "border-primary bg-primary/5"
          : hasBlocks
          ? "border-transparent"
          : "border-muted-foreground/15 hover:border-muted-foreground/25"
      } ${isCompact ? "min-h-[40px]" : "min-h-[50px]"}`}
    >
      {hasBlocks ? (
        <div className="space-y-1.5 p-1">
          {blocks.map((block, i) => (
            <DraggableBlock
              key={`${id}-${block.type}-${i}`}
              id={`placed-${id}-${i}`}
              type={block.type}
              isPlaced
              onRemove={() => onRemoveBlock(i)}
              onClick={() => onSelectBlock(id, i)}
              isSelected={selectedBlock?.zoneId === id && selectedBlock?.index === i}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full py-3 gap-1.5">
          <Plus className="h-3 w-3 text-muted-foreground/40" />
          <span className="text-[10px] text-muted-foreground/40 font-medium">{label}</span>
        </div>
      )}
    </div>
  );
}
