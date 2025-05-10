export type Rectangle = {
  readonly width: number;
  readonly height: number;
  readonly rot: boolean;
  readonly x: number;
  readonly y: number;
};

class Bin<T extends Rectangle = Rectangle> {
  private readonly freeRects: Rectangle[];
  public readonly packedRects: T[];
  public binArea: Rectangle;
  constructor(private readonly maxWidth: number, private readonly maxHeight: number) {
    this.freeRects = [];
    this.freeRects.push({
      x: 0,
      y: 0,
      rot: false,
      width: maxWidth,
      height: maxHeight,
    });
    this.binArea = {
      x: 0,
      y: 0,
      rot: false,
      width: 0,
      height: 0,
    };
    this.packedRects = [];
  }

  public get width() {
    return this.binArea.width;
  }

  public get height() {
    return this.binArea.height;
  }

  private canContainRect(rect1: Rectangle, rect2: Rectangle) {
    return (
      rect2.x >= rect1.x &&
      rect2.y >= rect1.y &&
      rect2.x + rect2.width <= rect1.x + rect1.width &&
      rect2.y + rect2.height <= rect1.y + rect1.height
    );
  }

  public tryAdd(rect: T) {
    const index = this.findBestFreeRectangle(rect);
    if (index !== -1) {
      const packedRect = this.splitFreeRectangle(index, rect);
      //resize bin area
      this.updateBinArea(packedRect);
      return true;
    }

    return false;
  }

  private getRectangleScore(freeRect: Rectangle, rect: Rectangle): number {
    const width = freeRect.width - rect.width;
    const height = freeRect.height - rect.height;

    return width < 0 || height < 0 ? Number.MAX_SAFE_INTEGER : Math.min(width, height);
  }

  private splitFreeRectangle(nodeIndex: number, rect: T) {
    const freeRect = this.freeRects[nodeIndex];

    // Remove the chosen free rectangle from the list
    this.freeRects.splice(nodeIndex, 1);

    // Add the new rectangles resulting from the split (if any)
    if (freeRect.width > rect.width) {
      this.freeRects.push({
        width: freeRect.width - rect.width,
        height: rect.height,
        x: freeRect.x + rect.width,
        y: freeRect.y,
        rot: false,
      });
    }

    if (freeRect.height > rect.height) {
      this.freeRects.push({
        width: freeRect.width,
        height: freeRect.height - rect.height,
        x: freeRect.x,
        y: freeRect.y + rect.height,
        rot: false,
      });
    }

    const packedRect = {
      ...rect,
      x: freeRect.x,
      y: freeRect.y,
      rot: false,
      width: rect.width,
      height: rect.height,
    };
    this.packedRects.push(packedRect);
    return packedRect;
  }

  private findBestFreeRectangle(rect: Rectangle): number {
    let bestScore = Number.MAX_SAFE_INTEGER;
    let bestNodeIndex = -1;

    for (let i = 0; i < this.freeRects.length; i++) {
      const freeTect = this.freeRects[i];
      const score = this.getRectangleScore(freeTect, rect);

      if (score < bestScore) {
        bestScore = score;
        bestNodeIndex = i;
      }
    }

    return bestNodeIndex;
  }

  private updateBinArea(rect: Rectangle) {
    if (this.canContainRect(this.binArea, rect)) {
      return false;
    }
    let width = Math.max(this.binArea.width, rect.x + rect.width);
    let height = Math.max(this.binArea.height, rect.y + rect.height);

    // // try rotating
    // const rw = Math.max(this.binArea.width, rect.x + rect.height);
    // const rh = Math.max(this.binArea.height, rect.y + rect.width);

    // //rotation rectangle fits better
    // if (rw * rh < width * height) {
    //   width = rw;
    //   height = rh;
    // }

    //compute power of 2 width and height
    width = Math.pow(2, Math.ceil(Math.log(width) * Math.LOG2E));
    height = Math.pow(2, Math.ceil(Math.log(height) * Math.LOG2E));

    if (width > this.maxWidth || height > this.maxHeight) {
      return false;
    }
    this.binArea = {
      x: 0,
      y: 0,
      width: width,
      height: height,
      rot: false,
    };
    return true;
  }
}

export class MaxRectsPacker<T extends Rectangle = Rectangle> {
  private readonly bins: Bin<T>[] = [];

  constructor(private maxWidth: number, private maxHeight: number) {
    const initialBin = new Bin<T>(maxWidth, maxHeight);

    this.bins.push(initialBin);
  }

  public getBins(): Bin<T>[] {
    return this.bins;
  }

  public pack(rectangles: T[]): void {
    // Sort the input rectangles by decreasing max side (non-increasing order)
    rectangles.sort((a, b) => Math.max(b.width, b.height) - Math.max(a.width, a.height));
    for (const rect of rectangles) {
      if (rect.width > this.maxWidth || rect.height > this.maxHeight) {
        throw new Error(
          `Rectangle too large maxWidth: ${this.maxWidth} maxHeight: ${this.maxHeight} Rect width: ${rect.width}, Rect height: ${rect.height}`
        );
      }
      this.packRectInAvailableBins(rect);
    }
  }

  private packRectInAvailableBins(rect: T) {
    let binCount = 0;
    while (binCount < this.bins.length) {
      const bin = this.bins[binCount];
      const canHandle = bin.tryAdd(rect);
      if (canHandle) {
        return;
      }
      binCount++;
    }

    // no space available in current bins, create a new one.
    const newBin = new Bin<T>(this.maxWidth, this.maxHeight);
    newBin.tryAdd(rect);
    this.bins.push(newBin);
  }
}
