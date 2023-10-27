import { Component, Input, OnInit } from '@angular/core';
import { IFaq } from 'src/app/interfaces/IFaq';

@Component({
  selector: 'app-faqs',
  templateUrl: './faqs.component.html',
  styleUrls: ['./faqs.component.scss'],
})
export class FaqsComponent implements OnInit {
  @Input() faqs: IFaq[] = [];

  constructor() {}

  ngOnInit() {}

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
}
