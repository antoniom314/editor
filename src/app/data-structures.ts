import { Layer } from "konva/lib/Layer";
import { Shape } from "konva/lib/Shape";

export interface TextBarData {
  fontData: FontData;
  fill: string;
  stroke: string;
}

export interface FontData {
  fontStyle: string;
  fontFamily: string;
  fontSize: number;
}

export interface FontStyle {
  name: string,
  selected: boolean
}

export interface FontFamily {
  name: string ;
  category: string ;
  stack: string[];
}

export interface FontSizes {
  id: number;
  name: string;
}

export interface RectPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

