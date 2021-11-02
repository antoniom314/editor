import { Injectable } from '@angular/core';
import Konva from 'konva';
import { Layer } from 'konva/lib/Layer';
import { Text } from 'konva/lib/shapes/Text';
import { Transformer } from 'konva/lib/shapes/Transformer';
import { Stage } from 'konva/lib/Stage';
import { TextBarData } from '../data-structures';

@Injectable({
  providedIn: 'root',
})
export class TextService {
  // page: any;

  boldSelected: boolean = false;
  italicSelected: boolean = false;
  underlineSelected: boolean = false;

  constructor() {}

  // createStage(page: any): Stage {
  //   this.page = page;
  //   const width = this.page?.nativeElement.getBoundingClientRect().width;
  //   const height = this.page?.nativeElement.getBoundingClientRect().height;

  //   const stage = new Konva.Stage({
  //     container: 'page',
  //     width: width,
  //     height: height,
  //   });
  //   return stage;
  // }

  // createLayer(stage: Stage) {
  //   let layer = new Konva.Layer();
  //   stage.add(layer);
  //   return layer;
  // }

  addText(
    name: string,
    textData: TextBarData,
    layer: Layer,
    stage: Stage
  ): Text {
    const text: Text = new Konva.Text({
      name: name,
      x: 20,
      y: 60,
      text: 'double click to type',
      width: 240,
      padding: 20,
      align: 'center',
      draggable: true,
      // strokeWidth: 2,
      // placeholder: 'Click to type',
      fontStyle: textData.fontData.fontStyle,
      fontSize: textData.fontData.fontSize,
      fontFamily: textData.fontData.fontFamily,
      fill: textData.fill,
      stroke: textData.stroke,
    });
    layer.add(text);

    text.listening();
    layer.drawHit();

    return text;
  }

  addTextTransformer(name: string, text: Text, stage: Stage): Transformer {
    const transformer: Transformer = new Konva.Transformer();
    transformer.addName(name);

    transformer.nodes([text]);

    transformer.boundBoxFunc((oldBox, newBox) => {
      newBox.width = Math.max(30, newBox.width);
      return newBox;
    });

    this.addHoverListener(text);

    this.addSelectListener(text, transformer);

    text.addEventListener('transform', () => {
      // reset scale, so only with is changing by transformer
      text.setAttrs({
        width: text.width() * text.scaleX(),
        scaleX: 1,
      });
    });

    text.addEventListener('dblclick dbltap', () => {
      this.addTextEditListener(text, transformer, stage);
    });

    return transformer;
  }

  changeTextProperties(textData: TextBarData, text: Text) {
    if (text != null) {
      text.fontStyle(textData.fontData.fontStyle);
      text.fontFamily(textData.fontData.fontFamily);
      text.fontSize(textData.fontData.fontSize);
      text.fill(textData.fill);
      text.stroke(textData.stroke);
    }
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

  addTextEditListener(text: Text, transformer: Transformer, stage: any) {
    // hide text node and transformer:
    text.hide();
    transformer.hide();

    // create textarea over canvas with absolute position
    // first we need to find position for textarea
    // how to find it?

    // at first lets find position of text node relative to the stage:
    const textPosition = text.absolutePosition();

    // so position of textarea will be the sum of positions above:
    const areaPosition = {
      x: stage.container().offsetLeft + textPosition.x + 24,
      y: stage.container().offsetTop + textPosition.y + 19,
    };

    // create textarea and style it
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    // apply many styles to match text on canvas as close as possible
    // remember that text rendering on canvas and on the textarea can be different
    // and sometimes it is hard to make it 100% the same. But we will try...
    textarea.value = text.text();
    textarea.style.position = 'absolute';
    textarea.style.top = areaPosition.y + 'px';
    textarea.style.left = areaPosition.x + 'px';
    textarea.style.width = text.width() - text.padding() * 2 + 'px';
    textarea.style.height = text.height() - text.padding() * 2 + 5 + 'px';
    textarea.style.fontSize = text.fontSize() + 'px';
    textarea.style.border = 'none';
    textarea.style.padding = '0px';
    textarea.style.margin = '0px';
    textarea.style.overflow = 'hidden';
    textarea.style.background = 'none';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.lineHeight = text.lineHeight().toString();
    textarea.style.fontFamily = text.fontFamily();
    textarea.style.transformOrigin = 'left top';
    textarea.style.textAlign = text.align();
    textarea.style.color = text.fill();
    const rotation = text.rotation();
    let transform = '';
    if (rotation) {
      transform += 'rotateZ(' + rotation + 'deg)';
    }

    let px = 0;

    const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    if (isFirefox) {
      px += 2 + Math.round(text.fontSize() / 20);
    }
    transform += 'translateY(-' + px + 'px)';

    textarea.style.transform = transform;

    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 3 + 'px';

    textarea.focus();

    function removeTextarea() {
      textarea.parentNode!.removeChild(textarea);
      window.removeEventListener('click tap', handleOutsideClick);
      text.show();
      transformer.show();
      transformer.forceUpdate();
    }

    function setTextareaWidth(newWidth: any) {
      if (!newWidth) {
        newWidth = <any>text.width * text.fontSize();
      }

      const isSafari = /^((?!chrome|android).)*safari/i.test(
        navigator.userAgent
      );
      const isFirefox =
        navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
      if (isSafari || isFirefox) {
        newWidth = Math.ceil(newWidth);
      }

      const isEdge =
        document.DOCUMENT_NODE ||
        /Edge/.test(navigator.userAgent) ||
        /Edg/.test(navigator.userAgent);
      if (isEdge) {
        newWidth += 1;
      }
      textarea.style.width = newWidth + 'px';
    }

    textarea.addEventListener('keydown', (e) => {
      if (e.keyCode === 13 && !e.shiftKey) {
        text.text(textarea.value);
        removeTextarea();
      }

      if (e.keyCode === 27) {
        removeTextarea();
      }
    });

    textarea.addEventListener('keydown', (e) => {
      const scale = text.getAbsoluteScale().x;
      setTextareaWidth(text.width() * scale);
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + text.fontSize() + 'px';
    });

    function handleOutsideClick(e: any) {
      if (e.target !== textarea) {
        text.text(textarea.value);
        removeTextarea();
      }
    }
    setTimeout(() => {
      window.addEventListener('click', handleOutsideClick);
    });
  }
}
