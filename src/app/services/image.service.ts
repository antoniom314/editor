import { Injectable } from '@angular/core';
import Konva from 'konva';
import { Layer } from 'konva/lib/Layer';
import { RectPosition } from '../data-structures';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private imageFile: any;
  private moviePosterImageUrl: any;

  constructor() {}

  setSelectedImage(imageFile: any): void {
    this.imageFile = imageFile;
  }

  setMoviePosterImageUrl(moviePosterImageUrl: any) {
    this.moviePosterImageUrl = moviePosterImageUrl;
  }

  createImage(name: string, layer: Layer, page: any, rect: RectPosition | null): void {
    const width = page?.nativeElement.getBoundingClientRect().width;
    const imageObj = new Image();
    imageObj.crossOrigin = 'Anonymous';

    if (this.moviePosterImageUrl) {
      imageObj.src = this.moviePosterImageUrl;
    }

    if (this.imageFile) {
      let binaryData = [];
      binaryData.push(this.imageFile);
      let fileObject = new File(binaryData, 'image.jpg');
      let URL = window.webkitURL || window.URL;
      let url = URL.createObjectURL(fileObject);
      imageObj.src = url;
    }

    console.log(imageObj.src);


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
      // It will not be deleted when selected
      if (this.moviePosterImageUrl) {
        // Add random name
        name = 'poster'
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
