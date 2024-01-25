interface Rect {
  width: number;
  height: number;
}

interface PackedRect extends Rect {
  x: number;
  y: number;
}

class MaxRectsPacker {
  private freeRectangles: Rect[] = [];
  private packedRectangles: PackedRect[] = [];

  constructor(private maxWidth: number, private maxHeight: number) {
    // Initialize with the full available space
    this.freeRectangles.push({ width: maxWidth, height: maxHeight });
  }

  pack(rectangles: Rect[]): PackedRect[] | null {
    // Sort the input rectangles by decreasing max side (non-increasing order)
    rectangles.sort((a, b) => Math.max(b.width, b.height) - Math.max(a.width, a.height));

    for (const rect of rectangles) {
      // Try to find a free rectangle to place the current sprite
      const nodeIndex = this.findBestFreeRectangle(rect);

      if (nodeIndex !== -1) {
        // Split the free rectangle and place the sprite
        const newNode = this.splitFreeRectangle(nodeIndex, rect);
        this.packedRectangles.push({ x: newNode.x, y: newNode.y, width: rect.width, height: rect.height });
      } else {
        // Unable to pack the sprite, return null
        return null;
      }
    }

    // All rectangles are packed successfully
    return this.packedRectangles;
  }

  private findBestFreeRectangle(rect: Rect): number {
    let bestScore = Number.MAX_SAFE_INTEGER;
    let bestNodeIndex = -1;

    for (let i = 0; i < this.freeRectangles.length; i++) {
      const score = this.scoreRectangle(this.freeRectangles[i], rect);

      if (score < bestScore) {
        bestScore = score;
        bestNodeIndex = i;
      }
    }

    return bestNodeIndex;
  }

  private scoreRectangle(freeRect: Rect, rect: Rect): number {
    const width = freeRect.width - rect.width;
    const height = freeRect.height - rect.height;

    return width < 0 || height < 0 ? Number.MAX_SAFE_INTEGER : Math.min(width, height);
  }

  private splitFreeRectangle(nodeIndex: number, rect: Rect): PackedRect {
    const freeRect = this.freeRectangles[nodeIndex];

    // Remove the chosen free rectangle from the list
    this.freeRectangles.splice(nodeIndex, 1);

    // Add the new rectangles resulting from the split (if any)
    if (freeRect.width > rect.width) {
      this.freeRectangles.push({
        width: freeRect.width - rect.width,
        height: rect.height,
      });
    }

    if (freeRect.height > rect.height) {
      this.freeRectangles.push({
        width: freeRect.width,
        height: freeRect.height - rect.height,
      });
    }

    // Return the position of the packed sprite
    return { x: freeRect.width - rect.width, y: freeRect.height - rect.height, ...rect };
  }
}

// Example Usage:

const maxWidth = 1024;
const maxHeight = 1024;

const rectangles: Rect[] = [
  { width: 64, height: 64 },
  { width: 128, height: 64 },
  { width: 64, height: 128 },
  // Add more rectangles as needed
];

const packer = new MaxRectsPacker(maxWidth, maxHeight);
const packedRectangles = packer.pack(rectangles);

if (packedRectangles !== null) {
  console.log("Sprites packed successfully:");
  console.log(packedRectangles);
} else {
  console.log("Unable to pack all sprites.");
}
