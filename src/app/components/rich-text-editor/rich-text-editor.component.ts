import { Component, Input, OnDestroy, OnInit } from '@angular/core';
// EDITOR JS
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import NestedList from '@editorjs/nested-list';
import Marker from '@editorjs/marker';
import Table from '@editorjs/table';
import Embed from '@editorjs/embed';
import { CustomDelimeterTool } from 'src/app/components/editor-js/delimeter-tool/delimeter-tool';
import { CustomImageTool } from 'src/app/components/editor-js/image-tool/image-tool';
import Strikethrough from '@sotaproject/strikethrough';
import { environment } from 'src/environments/environment';
import { SessionService } from 'src/app/services/session.service';
import { Observable, Subject } from 'rxjs';

// Imported from the index.html file.

@Component({
  selector: 'app-rich-text-editor',
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.scss'],
})
export class CustomRichTextEditorComponent implements OnInit {
  @Input() isReadOnly = false;
  @Input() isAwaitData: boolean = false;

  _data: Subject<any> = new Subject();
  editor: EditorJS;

  ngOnInit() {
    this._data.subscribe((data) => {
      if (!this.editor) this.editor = this.initEditor(data);
    });
  }
  ngAfterViewInit(): void {
    if (!this.isAwaitData) {
      this.editor = this.initEditor();
    }
  }

  initEditor(data: any = null) {
    return new EditorJS({
      autofocus: true,
      inlineToolbar: true,
      placeholder: 'Start editing your pitch story',
      holder: 'editor',
      tools: {
        header: {
          class: Header,
          inlineToolbar: true,
        },
        nestedList: NestedList,
        image: CustomImageTool,
        delimeter: CustomDelimeterTool,
        strikethrough: Strikethrough,
        marker: Marker,
        table: Table,
        embed: Embed,
      },
      data: data,
      onReady: () => {
        // If read only mode is toggled on, disable edits on the editor.
        if (this.isReadOnly) {
          let editable_elements = document.querySelectorAll(
            '*[contenteditable=true]'
          );
          editable_elements.forEach((el) =>
            el.removeAttribute('contenteditable')
          );

          let icon_settings = document.querySelectorAll(
            '.ce-toolbar__plus, .ce-toolbar__settings-btn'
          );
          icon_settings.forEach((el) => el.remove());

          // Turn off events for the image selector
          let imageSelectors = document.querySelectorAll('#image-selector');
          imageSelectors.forEach((el: HTMLDivElement) => (el.onclick = null));
        }
      },
    });
  }

  constructor(private sessionService: SessionService) {}

  saveStoryChanges() {
    return new Promise((resolve, reject) => {
      this.editor.save().then((data) => resolve(data));
    });
  }

  save() {
    return new Promise((resolve, reject) => {
      if (this.editor) {
        this.editor.save().then((data) => resolve(data));
      } else {
        resolve({});
      }
    });
  }

  setData(data) {
    this._data.next(data);
  }
}
