import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { EggComponent } from './egg/egg.component';
import { LoaderComponent } from './loader/loader.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { ConsentComponent } from './consent/consent.component';
import { CommentsSectionComponent } from './comments-section/comments-section.component';
import { CustomRichTextEditorComponent } from './rich-text-editor/rich-text-editor.component';
import { VideoComponent } from './video/video.component';
import { FormsModule } from '@angular/forms';
import { CreateBottomFooterComponent } from './create-bottom-footer/create-bottom-footer.component';
import { GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import { HetchersListComponent } from './hetchers-list/hetchers-list.component';
import { SocialButtonsComponent } from './social-buttons/social-buttons.component';
import { CommentComponent } from './comment/comment.component';
import { CommentActionButtonsComponent } from './comment-action-buttons/comment-action-buttons.component';
import { MilestonesBandComponent } from './milestones-band/milestones-band.component';
import { FaqsComponent } from './faqs/faqs.component';
import { CurrenciesSelectorComponent } from './currencies-selector/currencies-selector.component';
import { SettingsHelpContentComponent } from './settings-help-content/settings-help-content.component';
import { PitchCreateStepsComponent } from './pitch-create-steps/pitch-create-steps.component';

@NgModule({
  declarations: [
    HeaderComponent,
    EggComponent,
    LoaderComponent,
    FooterComponent,
    EditProfileComponent,
    ConsentComponent,
    CommentsSectionComponent,
    CustomRichTextEditorComponent,
    VideoComponent,
    CreateBottomFooterComponent,
    HetchersListComponent,
    SocialButtonsComponent,
    CommentComponent,
    CommentActionButtonsComponent,
    MilestonesBandComponent,
    FaqsComponent,
    CurrenciesSelectorComponent,
    SettingsHelpContentComponent,
    PitchCreateStepsComponent,
  ],
  imports: [CommonModule, FormsModule, GoogleSigninButtonModule],
  exports: [
    HeaderComponent,
    EggComponent,
    LoaderComponent,
    FooterComponent,
    EditProfileComponent,
    ConsentComponent,
    CommentsSectionComponent,
    CustomRichTextEditorComponent,
    VideoComponent,
    CreateBottomFooterComponent,
    HetchersListComponent,
    SocialButtonsComponent,
    CommentComponent,
    CommentActionButtonsComponent,
    MilestonesBandComponent,
    FaqsComponent,
    CurrenciesSelectorComponent,
    SettingsHelpContentComponent,
    PitchCreateStepsComponent,
  ],
  schemas: [],
  providers: [],
})
export class ComponentsModule {}
