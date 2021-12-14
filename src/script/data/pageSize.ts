import { centimeterToPoint } from "../logic/dataHelper";

export class Size {
  private _width: number;
  private _height: number;
  private _max!: number;
  private _min!: number;

  public get width(): number {
    return this._width;
  }
  public set width(value: number) {
    this._width = value;
    this.updateMinMax();
  }

  public get height(): number {
    return this._height;
  }
  public set height(value: number) {
    this._height = value;
    this.updateMinMax();
  }

  public get max(): number {
    return this._max;
  }

  public get min(): number {
    return this._min;
  }

  constructor(width: number, height: number) {
    this._width = width;
    this._height = height;
    this.updateMinMax();
  }

  private updateMinMax() {
    this._max = Math.max(this._width, this._height);
    this._min = Math.min(this._width, this._height);
  }
}

const PlainA4 = [595.28, 841.89];
export const pageMargins = centimeterToPoint<[number, number]>([3.5, 2.5]);
export const A4 = new Size(
  PlainA4[0]! - pageMargins[0]! * 2,
  PlainA4[1]! - pageMargins[1]! * 2
);
