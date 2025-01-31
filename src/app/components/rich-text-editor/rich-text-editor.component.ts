import { Component, Input, OnDestroy, OnInit } from '@angular/core';
// EDITOR JS
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import NestedList from '@editorjs/nested-list';
import Checklist from '@editorjs/checklist';
import Warning from '@editorjs/warning';
import LinkTool from '@editorjs/link';
import Qoute from '@editorjs/quote';
import Marker from '@editorjs/marker';
import Table from '@editorjs/table';
import Embed from '@editorjs/embed';
import { CustomDelimeterTool } from 'src/app/components/editor-js/delimeter-tool/delimeter-tool';
import { CustomImageTool } from 'src/app/components/editor-js/image-tool/image-tool';
import Strikethrough from '@sotaproject/strikethrough';
import { environment } from 'src/environments/environment';
import { SessionService } from 'src/app/services/session.service';
import { Observable, Subject } from 'rxjs';
import { IRichTextEditorData } from 'src/app/IRichTextEditorData';

// Imported from the index.html file.

@Component({
  selector: 'app-rich-text-editor',
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.scss'],
})
export class CustomRichTextEditorComponent implements OnInit {
  @Input() isReadOnly = false;
  @Input() isAwaitData: boolean = false;
  @Input() isVisible: boolean = true;
  @Input() textSize: number = 16;

  _data: Subject<any> = new Subject();
  data = null;
  editor: EditorJS;
  currentFullscreenImage: string;

  ngOnInit() {
    this._data.subscribe((data) => {
      if (!this.editor && !this.isReadOnly) this.editor = this.initEditor(data);
    });
  }

  initEditor({data, isEditable}) {
    if (isEditable === true) {
      return new EditorJS({
        autofocus: false,
        inlineToolbar: true,
        placeholder: 'Start editing your pitch story',
        holder: 'editor',
        tools: {
          header: {
            class: Header,
            inlineToolbar: true,
          },
          nestedList: {
            class: NestedList,
            inlineToolbar: true
          },
          image: CustomImageTool,
          delimeter: CustomDelimeterTool,
          strikethrough: {
            class: Strikethrough,
            inlineToolbar: true
          },
          marker: {
            class: Marker,
            inlineToolbar: true
          },
          table: {
            class: Table,
            inlineToolbar: true
          },
          embed: {
            class: Embed,
            inlineToolbar: true,
            config: {
              services: {
                youtube: true
              }
            }
          },
          quote: {
            class: Qoute,
            inlineToolbar: true,
            config: {
              quotePlaceholder: 'Enter a quote',
              captionPlaceholder: 'Quote reference',
            },
          },
          warning: {
            class: Warning,
            inlineToolbar: true,
            config: {
              titlePlaceholder: 'Warning title',
              messagePlaceholder: 'Message',
            },
          },
          checklist: {
            class: Checklist,
            inlineToolbar: true
          },
        },
        data: data,
      });
    } else {
      this.isReadOnly = true;
      this.data = data?.blocks;
    }
  }

  constructor(private sessionService: SessionService) {}

  save() {
    return new Promise((resolve, reject) => {
      if (this.editor) {
        this.editor.save().then((data) => resolve(data));
      } else {
        resolve({});
      }
    });
  }

  setData(data: any, isEditable: boolean = false) {
    this._data.next({data, isEditable});
  }

  isImage(url: string): boolean {
    const extension = url.split('.').pop();
    if (extension !== "mp4") {
      return true;
    } else {
      return false;
    }
  }

  zoomInOut(imageUrl: string): void {
    if (!this.currentFullscreenImage) {
      this.currentFullscreenImage = imageUrl;
    } else {
      this.currentFullscreenImage = null;
    }
  }
}
