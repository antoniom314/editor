import { Injectable } from '@angular/core';
import Konva from 'konva';
import { Stage } from 'konva/lib/Stage';

@Injectable({
  providedIn: 'root'
})
export class CanvasService {
  page: any;

  constructor() { }

  createStage(page: any): Stage {
    this.page = page;
    const width = this.page?.nativeElement.getBoundingClientRect().width;
    const height = this.page?.nativeElement.getBoundingClientRect().height;

    const stage = new Konva.Stage({
      container: 'page',
      width: width,
      height: height,
    });
    return stage;
  }

  createLayer(stage: Stage) {
    let layer = new Konva.Layer();
    stage.add(layer);
    return layer;
  }
}
