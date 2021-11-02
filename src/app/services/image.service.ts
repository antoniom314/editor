import { Injectable } from '@angular/core';
import Konva from 'konva';
import { Layer } from 'konva/lib/Layer';
import { RectPosition } from '../data-structures';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private imageFile: any;

  constructor() {}

  setSelectedImage(imageFile: any): void {
    this.imageFile = imageFile;
  }

  createImage(name: string, layer: Layer, page: any, rect: RectPosition | null): void {
    let width = page?.nativeElement.getBoundingClientRect().width;
    let imageObj = new Image();

    if (this.imageFile) {
      let binaryData = [];
      binaryData.push(this.imageFile);
      let fileObject = new File(binaryData, 'image.jpg');
      let URL = window.webkitURL || window.URL;
      let url = URL.createObjectURL(fileObject);
      imageObj.src = url;
    }

    imageObj.onload = () => {
      const aspectRatio = imageObj.height / imageObj.width;
      const height: number = aspectRatio * width;

      let image;
      if (rect != null) {
        image = new Konva.Image({
          name: name,
          x: rect.x,
          y: rect.y,
          image: imageObj,
          width: rect.width,
          height: rect.height,
          draggable: true,
        });
      } else {
        image = new Konva.Image({
          name: name,
          x: 0,
          y: 0,
          image: imageObj,
          width: width,
          height: height,
          draggable: true,
        });
      }
      const transformer = new Konva.Transformer();

      transformer.addName(name);
      layer.add(transformer);
      transformer.nodes([image]);

      this.addHoverListener(image);
      this.addSelectListener(image, transformer);

      layer.add(image);
    };
  }

  addSelectListener(item: any, transformer: any) {
    item.addEventListener('mouseup touchend', () => {
      if (transformer.isVisible()) {
        transformer.hide();
        item.draggable(false);
      } else {
        transformer.show();
        item.draggable(true);
      }
    });
  }

  addHoverListener(item: any): void {
    item.addEventListener('mouseover', () => {
      document.body.style.cursor = 'move';
    });
    item.addEventListener('mouseout', () => {
      document.body.style.cursor = 'default';
    });
  }
}
