import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { IFaq } from 'src/app/interfaces/IFaq';
import { LoaderService } from 'src/app/services/loader.service';
import { SessionService } from 'src/app/services/session.service';
import { ToastManagerService } from 'src/app/services/toast-manager.service';
import { environment } from 'src/environments/environment';
import * as superagent from "superagent";

@Component({
  selector: 'app-faqs',
  templateUrl: './faqs.component.html',
  styleUrls: ['./faqs.component.scss'],
})
export class FaqsComponent implements OnInit {
  @ViewChild("Question") questionInput: ElementRef<HTMLTextAreaElement>;
  @ViewChild("Answer") answerInput: ElementRef<HTMLTextAreaElement>;
  
  @Input() pitch_key: string;
  @Input() is_able_to_add: boolean = false;
  @Input() _faqs: string[] = [];
  faqs: IFaq[] = [];

  constructor(private toastManagerService: ToastManagerService, private sessionService: SessionService, private loaderService: LoaderService) {}

  ngOnInit() {
    const loaderIdx = this.loaderService.showLoader();

    superagent
      .get([environment.farmhouse, 'pitches', 'faqs', this._faqs.join(',')].join('/'))
      .end((_, response) => {
        this.loaderService.hideLoader(loaderIdx);
        
        if (response){
          if (response.statusCode === 200) {
             this.faqs = response.body.data;
          } else {
            this.toastManagerService.show(response.body.reason || "Something went wrong. Please reload this page.", false, true);
          }
        } else {
          this.toastManagerService.show("Seems you're disconnected from the internet.", false, true);
        }
      })
  }

  openFAQAnswerConent(
    questionElement: HTMLElement,
    answerElement: HTMLElement
  ) {
    questionElement.classList.toggle('active');
    answerElement.classList.toggle('active');

    if (answerElement.style.maxHeight) {
      answerElement.style.maxHeight = null;
    } else {
      answerElement.style.maxHeight = answerElement.scrollHeight + 'px';
    }
  }

  addFAQ() {
    const loaderIdx = this.loaderService.showLoader()
    
    const faq = { question: this.questionInput.nativeElement.value,
                  answer: this.answerInput.nativeElement.value,
                  _for: this.pitch_key };
    if (faq.question && faq.answer) {
      superagent
        .post([environment.farmhouse, 'pitches', this.pitch_key, 'faqs'].join("/"))
        .set('Authorization', ['Bearer', this.sessionService.sessionToken].join(' '))
        .send(faq)
        .end((_, response) => {
          this.loaderService.hideLoader(loaderIdx);

          if (response) {
            if (response.statusCode === 200) {
              this.faqs.push(response.body.data);
              this.toastManagerService.show("FAQ added succesfully.");

              this.questionInput.nativeElement.value = "";
              this.answerInput.nativeElement.value = "";
            } else {
              this.toastManagerService.show(response.body.reason || 'Something went wrong.', false, true);
            }
          } else {
            this.toastManagerService.show("Seems you're disconnected from the internet.", false, true);
          }
        });
    } else {
      if (!faq.question && !faq.answer) {
        this.toastManagerService.show("Question and Answer field are required for an FAQ.", false, true);
        return;
      }
      
      if (!faq.question) {
        this.toastManagerService.show("Question field is required for an FAQ.", false, true);
      }

      if (!faq.answer) {
        this.toastManagerService.show("Answer field is required for an FAQ.", false, true);
      }
    }
  }
}
