import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import jsPDF from 'jspdf';
import { Layer } from 'konva/lib/Layer';
import { Text } from 'konva/lib/shapes/Text';
import { Transformer } from 'konva/lib/shapes/Transformer';
import { Stage } from 'konva/lib/Stage';
import {
  FontStyle,
  FontFamily,
  FontSizes,
  TextBarData,
  RectPosition,
} from '../data-structures';
import { FontFamiliesList, FontSizesList } from '../font-styles-data';
import { CanvasService } from '../services/canvas.service';
import { ImageService } from '../services/image.service';
import { TextService } from '../services/text.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'Editor';

  @ViewChild('page') page?: ElementRef<any>;
  @ViewChild('textBar') textBar?: ElementRef<any>;
  @ViewChild('bold') boldButton?: ElementRef<any>;
  @ViewChild('italic') italicButton?: ElementRef<HTMLButtonElement>;

  boldSelected: boolean = false;
  italicSelected: boolean = false;

  stage!: Stage;
  backgroundImageLayer!: Layer;
  foregroundImageLayer!: Layer;
  foregroundTextLayer!: Layer;

  elementNames: string[] = [];
  textElements: Map<string, Text> = new Map();

  constructor(
    private canvasService: CanvasService,
    private shapeService: TextService,
    private imageService: ImageService,
    private activatedRoute: ActivatedRoute
  ) {
    (async () => {
      await new Promise((f) => setTimeout(f, 1000));

      this.stage = this.canvasService.createStage(this.page);
      this.backgroundImageLayer = this.canvasService.createLayer(this.stage);
      this.foregroundImageLayer = this.canvasService.createLayer(this.stage);
      this.foregroundTextLayer = this.canvasService.createLayer(this.stage);

      this.activatedRoute.queryParams.subscribe((params) => {
        // Create Poster background if there is poster URL sended from Movies App
        if (params.image_url) {

          this.imageService.setMoviePosterImageUrl(params.image_url);
          this.imageService.createImage(
            this.randomString(),
            this.backgroundImageLayer,
            this.page,
            null
          );
        }


      });
    })();
  }

  ngOnInit(): void {}

  selectedFontFamily: string = 'Arial';
  fontStyles: FontFamily[] = FontFamiliesList;
  onSelectFontFamily() {
    this.updateTextElement();
  }

  selectedFontSize: any = 30;
  fontSizes: FontSizes[] = FontSizesList;
  onSelectFontSize() {
    this.updateTextElement();
  }

  selectedFillColor: any = '#FF0000';
  onSelectFillColor(event: Event) {
    this.selectedFillColor = (<HTMLInputElement>event.target).value;
    this.updateTextElement();
  }

  selectedStrokeColor: any = '#000000';
  onSelectStrokeColor(event: Event) {
    this.selectedStrokeColor = (<HTMLInputElement>event.target).value;
    this.updateTextElement();
  }

  randomString(): string {
    const min = 10000;
    const max = 90000;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
  }

  createForegroundText() {
    const name = this.randomString();
    const textBarData = this.getSelectedTextProperties();
    const text = this.shapeService.addText(
      name,
      textBarData,
      this.foregroundTextLayer,
      this.stage
    );
    const transformer = this.shapeService.addTextTransformer(
      name,
      text,
      this.stage
    );
    this.foregroundTextLayer.add(text);
    this.foregroundTextLayer.add(transformer);

    this.textElements.set(name, text);
  }
  createBackgroundImage() {
    this.imageService.createImage(
      this.randomString(),
      this.backgroundImageLayer,
      this.page,
      null
    );
  }
  createForegroundImage() {
    const rect: RectPosition = { x: 40, y: 40, width: 200, height: 120 };
    this.imageService.createImage(
      this.randomString(),
      this.foregroundImageLayer,
      this.page,
      rect
    );
  }

  createTextElement(name: string) {}

  deleteElements() {
    this.stage.find('Transformer').forEach((tr) => {
      if (tr.isVisible()) {
        const layer = tr.getParent();
        // Get transformer name
        const transName: string = tr.name();
        const texts = layer.find('Text');

        texts.forEach((text) => {
          // Get text name
          const textName = text.attrs.name;

          if (transName == textName) {
            console.log('deleted');
            console.log(text);

            text.destroy();
            tr.destroy();
          }
        });

        const images = layer.find('Image');
        console.log(images);

        images.forEach((image) => {
          // Get image name
          const imageName = image.attrs.name;
          console.log(imageName);

          if (transName == imageName) {
            console.log('deleted');
            console.log(image);

            image.destroy();
            tr.destroy();
          }
        });

        layer.draw();
      }
    });
  }

  updateTextElement() {
    const textBarData: TextBarData = this.getSelectedTextProperties();

    const transformers: Transformer[] =
      this.foregroundTextLayer.find('Transformer');

    transformers.forEach((transformer) => {
      if (transformer.isVisible()) {
        const texts = this.foregroundTextLayer.find('Text');

        texts.forEach((text) => {
          if (text.name() === transformer.name()) {
            const text = transformer.getNode();

            this.textElements.forEach((textElement) => {
              if (text.name() === textElement.name()) {
                this.shapeService.changeTextProperties(
                  textBarData,
                  textElement
                );
              }
            });
          }
        });
      }
    });
  }

  getSelectedTextProperties(): TextBarData {
    const size: number = +this.selectedFontSize;
    const textData: TextBarData = {
      fontData: {
        fontStyle: this.getSelectedFontStyle(),
        fontFamily: this.selectedFontFamily,
        fontSize: size,
      },
      fill: this.selectedFillColor,
      stroke: this.selectedStrokeColor,
    };
    return textData;
  }

  getSelectedFontStyle(): string {
    let selectedFontStyle = '';
    const fontStyles: FontStyle[] = [
      { name: 'bold', selected: this.boldSelected },
      { name: 'italic', selected: this.italicSelected },
    ];
    fontStyles.forEach((style) => {
      if (style.selected)
        selectedFontStyle = selectedFontStyle + ' ' + style.name;
    });
    if (selectedFontStyle === '') {
      selectedFontStyle = 'normal';
    }

    return selectedFontStyle;
  }

  boldClicked() {
    this.boldSelected = !this.boldSelected;
    this.updateTextElement();
  }
  italicClicked() {
    this.italicSelected = !this.italicSelected;
    this.updateTextElement();
  }
  // underlineClicked() {
  //   this.underlineSelected = !this.underlineSelected;
  // }

  async downloadPDF() {
    this.unselectAll();

    const stageURL = this.stage.toDataURL({ pixelRatio: 3 });
    const pdf = new jsPDF('p', 'px');
    const imageProperties = pdf.getImageProperties(stageURL);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight =
      (imageProperties.height * pdfWidth) / imageProperties.width;

    pdf.addImage(stageURL, 0, 0, pdfWidth, pdfHeight);
    pdf.save('downloadPDF.pdf');
  }

  downloadJPG() {
    this.unselectAll();
    const stageURL = this.stage.toDataURL({ pixelRatio: 3 });
    this.downloadURI(stageURL, 'downloadJPG.jpg');
  }

  downloadURI(url: any, name: any) {
    const item: any = { link: document.createElement('a') };
    item.link.download = name;
    item.link.href = url;
    document.body.appendChild(item.link);
    item.link.click();
    document.body.removeChild(item.link);
    delete item.link;
  }

  fileSelected(event: any) {
    this.imageService.setSelectedImage(event.target.files[0]);
  }
  unselectAll() {
    this.stage.find('Transformer').forEach((tr) => {
      if (tr.isVisible()) {
        tr.hide();
        // const layer = tr.getParent();
        // layer.draw();
      }
    });
  }
}
