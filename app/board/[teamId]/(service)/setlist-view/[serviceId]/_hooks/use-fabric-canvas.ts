import { useEffect, useRef, useState } from 'react';
import {
  Canvas,
  StaticCanvas,
  Path,
  IText,
  FabricObject,
} from 'fabric';
import type {
  AnnotationObject,
  FreehandObject,
  FreehandPoint,
  TextObject,
} from '@/models/sheet_annotation';
import type { ImageBounds } from './use-image-bounds';

interface UseFabricCanvasOptions {
  canvasElRef: React.RefObject<HTMLCanvasElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  objects: AnnotationObject[];
  bounds: ImageBounds;
  interactive?: boolean; // true for editor canvas, false for readonly
}

interface UseFabricCanvasReturn {
  fabricCanvas: Canvas | StaticCanvas | null;
  fabricObjectMap: React.MutableRefObject<Map<string, FabricObject>>;
  skipNextSync: React.MutableRefObject<boolean>;
  isReady: boolean;
}

/**
 * Denormalize a point from 0-1 normalized space to canvas pixel space
 */
function denormalize(
  point: FreehandPoint,
  bounds: ImageBounds
): { x: number; y: number } {
  return {
    x: point.x * bounds.visibleWidth,
    y: point.y * bounds.visibleHeight,
  };
}

/**
 * Normalize a canvas point to 0-1 space
 */
function normalize(
  canvasPoint: { x: number; y: number },
  bounds: ImageBounds
): FreehandPoint {
  return {
    x: canvasPoint.x / bounds.visibleWidth,
    y: canvasPoint.y / bounds.visibleHeight,
  };
}

/**
 * Convert FreehandObject to fabric.Path
 */
function createFreehandPath(obj: FreehandObject, bounds: ImageBounds): Path {
  if (obj.points.length === 0) {
    // Empty path - create invisible placeholder
    const path = new Path('M 0 0', {
      stroke: obj.color,
      strokeWidth: obj.strokeWidth,
      fill: undefined,
      opacity: obj.opacity ?? 1,
      selectable: false,
      evented: false,
    });
    (path as unknown as Record<string, unknown>).data = { id: obj.id, type: 'freehand' };
    return path;
  }

  const denormalizedPoints = obj.points.map((p) => denormalize(p, bounds));
  const pathString =
    'M ' +
    denormalizedPoints
      .map((p, i) => (i === 0 ? `${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
      .join(' ');

  const path = new Path(pathString, {
    stroke: obj.color,
    strokeWidth: obj.strokeWidth,
    fill: undefined,
    opacity: obj.opacity ?? 1,
    selectable: false,
    evented: false,
  });

  (path as unknown as Record<string, unknown>).data = { id: obj.id, type: 'freehand' };
  return path;
}

/**
 * Convert TextObject to fabric.IText
 */
function createTextObject(obj: TextObject, bounds: ImageBounds): IText {
  const denormalized = denormalize({ x: obj.x, y: obj.y }, bounds);

  const text = new IText(obj.text, {
    left: denormalized.x,
    top: denormalized.y,
    fontSize: obj.fontSize,
    fontWeight: obj.fontWeight,
    fill: obj.color,
    width: obj.width,
    selectable: false,
    evented: false,
  });

  (text as unknown as Record<string, unknown>).data = { id: obj.id, type: 'text' };
  return text;
}

/**
 * Check if freehand object properties have changed
 */
function freehandChanged(
  obj: FreehandObject,
  fabricPath: Path,
  bounds: ImageBounds
): boolean {
  if (!fabricPath.path) return true;

  // Compare path points
  const denormalizedPoints = obj.points.map((p) => denormalize(p, bounds));
  const currentPath = fabricPath.path;

  if (currentPath.length !== obj.points.length) return true;

  for (let i = 0; i < obj.points.length; i++) {
    const cmd = currentPath[i];
    const pt = denormalizedPoints[i];
    if (!cmd) return true;

    const [command, x, y] = cmd;
    if (Math.abs((x as number) - pt.x) > 0.5 || Math.abs((y as number) - pt.y) > 0.5) {
      return true;
    }
  }

  // Compare style properties
  return (
    fabricPath.stroke !== obj.color ||
    fabricPath.strokeWidth !== obj.strokeWidth ||
    fabricPath.opacity !== (obj.opacity ?? 1)
  );
}

/**
 * Check if text object properties have changed
 */
function textChanged(
  obj: TextObject,
  fabricText: IText,
  bounds: ImageBounds
): boolean {
  const denormalized = denormalize({ x: obj.x, y: obj.y }, bounds);

  return (
    fabricText.text !== obj.text ||
    Math.abs((fabricText.left ?? 0) - denormalized.x) > 0.5 ||
    Math.abs((fabricText.top ?? 0) - denormalized.y) > 0.5 ||
    fabricText.fontSize !== obj.fontSize ||
    fabricText.fontWeight !== obj.fontWeight ||
    fabricText.fill !== obj.color ||
    fabricText.width !== obj.width
  );
}

export function useFabricCanvas({
  canvasElRef,
  containerRef,
  objects,
  bounds,
  interactive = true,
}: UseFabricCanvasOptions): UseFabricCanvasReturn {
  const [fabricCanvas, setFabricCanvas] = useState<Canvas | StaticCanvas | null>(
    null
  );
  const [isReady, setIsReady] = useState(false);

  const fabricObjectMap = useRef<Map<string, FabricObject>>(new Map());
  const skipNextSync = useRef(false);

  // Initialize canvas on mount
  useEffect(() => {
    const canvasEl = canvasElRef.current;
    if (!canvasEl) return;

    const canvas = interactive
      ? new Canvas(canvasEl, {
          width: bounds.visibleWidth,
          height: bounds.visibleHeight,
          selection: false,
          renderOnAddRemove: false,
        })
      : new StaticCanvas(canvasEl, {
          width: bounds.visibleWidth,
          height: bounds.visibleHeight,
          renderOnAddRemove: false,
        });

    setFabricCanvas(canvas);
    setIsReady(true);

    return () => {
      fabricObjectMap.current.clear();
      canvas.dispose();
      setFabricCanvas(null);
      setIsReady(false);
    };
  }, [canvasElRef, interactive]);

  // Resize canvas when bounds change
  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.setDimensions({
      width: bounds.visibleWidth,
      height: bounds.visibleHeight,
    });

    fabricCanvas.requestRenderAll();
  }, [fabricCanvas, bounds.visibleWidth, bounds.visibleHeight]);

  // Reconcile objects array with canvas
  useEffect(() => {
    if (!fabricCanvas || !isReady) return;

    // Skip sync if flag is set (to prevent loops)
    if (skipNextSync.current) {
      skipNextSync.current = false;
      return;
    }

    const incomingIds = new Set(objects.map((obj) => obj.id));
    const canvasIds = Array.from(fabricObjectMap.current.keys());

    // REMOVE: objects that are on canvas but not in incoming array
    for (const id of canvasIds) {
      if (!incomingIds.has(id)) {
        const fabricObj = fabricObjectMap.current.get(id);
        if (fabricObj) {
          fabricCanvas.remove(fabricObj);
          fabricObjectMap.current.delete(id);
        }
      }
    }

    // ADD or UPDATE
    for (let i = 0; i < objects.length; i++) {
      const obj = objects[i];
      const existingFabricObj = fabricObjectMap.current.get(obj.id);

      if (!existingFabricObj) {
        // ADD new object
        let newFabricObj: FabricObject;

        if (obj.type === 'freehand') {
          newFabricObj = createFreehandPath(obj, bounds);
        } else {
          newFabricObj = createTextObject(obj, bounds);
        }

        fabricCanvas.add(newFabricObj);
        fabricObjectMap.current.set(obj.id, newFabricObj);
      } else {
        // UPDATE existing object if changed
        let hasChanged = false;

        if (obj.type === 'freehand' && existingFabricObj instanceof Path) {
          hasChanged = freehandChanged(obj, existingFabricObj, bounds);
          if (hasChanged) {
            fabricCanvas.remove(existingFabricObj);
            const updated = createFreehandPath(obj, bounds);
            fabricCanvas.add(updated);
            fabricObjectMap.current.set(obj.id, updated);
          }
        } else if (obj.type === 'text' && existingFabricObj instanceof IText) {
          hasChanged = textChanged(obj, existingFabricObj, bounds);
          if (hasChanged) {
            fabricCanvas.remove(existingFabricObj);
            const updated = createTextObject(obj, bounds);
            fabricCanvas.add(updated);
            fabricObjectMap.current.set(obj.id, updated);
          }
        }
      }
    }

    // Reorder z-index to match array order
    const canvasObjects = fabricCanvas.getObjects();
    const orderedIds = objects.map((obj) => obj.id);

    // Sort canvas objects by their index in orderedIds
    const sortedObjects = canvasObjects
      .map((fabricObj) => {
        const data = (fabricObj as unknown as Record<string, unknown>).data as { id: string; type: string } | undefined;
        const id = data?.id;
        const index = id ? orderedIds.indexOf(id) : -1;
        return { fabricObj, index };
      })
      .filter(({ index }) => index >= 0)
      .sort((a, b) => a.index - b.index)
      .map(({ fabricObj }) => fabricObj);

    // Clear and re-add in correct order
    fabricCanvas.remove(...canvasObjects);
    fabricCanvas.add(...sortedObjects);

    fabricCanvas.requestRenderAll();
  }, [fabricCanvas, objects, bounds, isReady]);

  return {
    fabricCanvas,
    fabricObjectMap,
    skipNextSync,
    isReady,
  };
}
