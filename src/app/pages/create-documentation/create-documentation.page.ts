import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IEgg } from 'src/app/interfaces/IEgg';
import { EggService } from 'src/app/services/egg.service';
import { SessionService } from 'src/app/services/session.service';
import { TitleService } from 'src/app/services/title.service';
import { environment } from 'src/environments/environment';
import * as superagent from 'superagent';
import * as nanoid from 'nanoid';
import { ToastManagerService } from 'src/app/services/toast-manager.service';

@Component({
  selector: 'app-create-documentation',
  templateUrl: './create-documentation.page.html',
  styleUrls: ['./create-documentation.page.scss'],
})
export class CreateDocumentationPage implements OnInit {
  @ViewChild('FileSelector')
  fileSelector: ElementRef<HTMLInputElement>;

  draft_key: string;
  draft: IEgg;

  // Documentation upload.
  // Company registration certificate
  registrationUploadProgress = 0;
  isRegistrationUploaded = false;
  selectedRegistrationCertificate: File | { filename: string; url: string };

  company_documentations = {
    type: 'company_documentation',
    documents: [], // {name, type, progress, uploaded, size}
    readyState: [],
  };
  // Included documents should be: Registation certification, Tax, Proof of Bank and Proof of physical address

  director_documentations = {
    type: 'directors_documentation',
    documents: [], // {name, type, progress, uploaded}
    readyState: [],
  };
  // Included documents should be certified identification document by a recognized Oath.

  constructor(
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
    private pitchService: EggService,
    private sessionService: SessionService,
    private toastService: ToastManagerService
  ) {}

  ngOnInit() {
    this.titleService.onTitleChange.next('Documentation | Create: Hetchfund');

    this.activatedRoute.queryParamMap.subscribe((paramMap) => {
      this.draft_key = paramMap.get('draft_key');
      this.pitchService.getSavedDraft(this.draft_key).then((draft) => {
        this.draft = draft;
        this.company_documentations =
          this.draft?.review_documents?.company_documentations.documents !==
          undefined
            ? this.draft?.review_documents?.company_documentations
            : this.company_documentations;
        this.director_documentations =
          this.draft?.review_documents?.director_documentations.documents !==
          undefined
            ? this.draft?.review_documents?.director_documentations
            : this.director_documentations;
      });
    });
  }

  uploadFile(fileAttachment: File, documentType: string, taskId: string) {
    superagent
      .post([environment.media_resources, 'upload'].join('/'))
      .set(
        'Authorization',
        ['Bearer', this.sessionService.sessionToken].join(' ')
      )
      .attach('file', fileAttachment)
      .on('progress', (event) => {
        if (this.director_documentations.type == documentType) {
          const taskIndex = this.director_documentations.documents.findIndex(
            (d) => d.id === taskId
          );
          if (taskIndex !== -1) {
            this.director_documentations.documents[taskIndex].progress =
              event?.percent;
          }
        } else {
          const taskIndex = this.company_documentations.documents.findIndex(
            (d) => d.id === taskId
          );
          if (taskIndex !== -1) {
            this.company_documentations.documents[taskIndex].progress =
              event?.percent;
          }
        }
      })
      .end((_, response) => {
        this.fileSelector.nativeElement.value = '';
        if (response) {
          if (response.statusCode === 200) {
            if (this.director_documentations.type == documentType) {
              const taskIndex =
                this.director_documentations.documents.findIndex(
                  (d) => d.id === taskId
                );
              if (taskIndex !== -1) {
                this.director_documentations.documents[taskIndex].uploaded =
                  true;
                this.director_documentations.documents[taskIndex].url =
                  response.body?.file?.file;
                this.director_documentations.readyState[taskIndex] = true;
              }
            } else {
              const taskIndex = this.company_documentations.documents.findIndex(
                (d) => d.id === taskId
              );
              if (taskIndex !== -1) {
                this.company_documentations.documents[taskIndex].uploaded =
                  true;
                this.company_documentations.documents[taskIndex].url =
                  response.body?.file?.file;
                this.company_documentations.readyState[taskIndex] = true;
              }
            }

            this.save();
          } else {
            this.toastService.show(
              response.body.reason || 'Something went wrong while uploading.'
            );
          }
        } else {
          this.toastService.show("You're not connected to the internet.");
        }
      });
  }

  selectFile(documentType: string, givenTaskId: string = undefined): void {
    this.fileSelector.nativeElement.click();

    this.fileSelector.nativeElement.onchange = () => {
      // Create the upload task in memory.
      const id = givenTaskId || nanoid.nanoid();

      if (this.director_documentations.type == documentType) {
        // To prevent duplicates.
        const existingIndex = this.director_documentations.documents.findIndex(
          (_id) => _id?.id == id
        );
        if (existingIndex !== -1) {
          this.director_documentations.documents[existingIndex] = {
            id,
            name: this.fileSelector.nativeElement.files[0].name,
            type: this.fileSelector.nativeElement.files[0].type,
            size: this.fileSelector.nativeElement.files[0].size,
            progress: 0,
            uploaded: false,
            url: null,
            status: null,
            comments: null,
          };
          return (this.director_documentations.readyState[existingIndex] =
            false);
        }

        const index =
          this.director_documentations.documents.push({
            id,
            name: this.fileSelector.nativeElement.files[0].name,
            type: this.fileSelector.nativeElement.files[0].type,
            size: this.fileSelector.nativeElement.files[0].size,
            progress: 0,
            uploaded: false,
            url: null,
            status: null,
            comments: null,
          }) - 1;

        this.director_documentations.readyState[index] = false;
      } else {
        // To prevent duplicates.
        const existingIndex = this.company_documentations.documents.findIndex(
          (_id) => _id?.id == id
        );
        if (existingIndex !== -1) {
          this.company_documentations.documents.splice(existingIndex, 1);
          this.company_documentations.documents[existingIndex] = {
            id,
            name: this.fileSelector.nativeElement.files[0].name,
            type: this.fileSelector.nativeElement.files[0].type,
            size: this.fileSelector.nativeElement.files[0].size,
            progress: 0,
            uploaded: false,
            url: null,
            status: null,
            comments: null,
          };
          return (this.company_documentations.readyState[existingIndex] =
            false);
        } else {
          const index =
            this.company_documentations.documents.push({
              id,
              name: this.fileSelector.nativeElement.files[0].name,
              type: this.fileSelector.nativeElement.files[0].type,
              size: this.fileSelector.nativeElement.files[0].size,
              progress: 0,
              uploaded: false,
              url: null,
              status: null,
              comments: null,
            }) - 1;

          this.company_documentations.readyState[index] = false;
        }
      }

      // Send the task for an upload.
      this.uploadFile(
        this.fileSelector.nativeElement.files[0],
        documentType,
        id
      );
    };
  }

  removeSelectedFile(fileId: number | string, isCompanyDocument = true) {
    // Find the document type.
    let field = 'company_documentations';
    if (!isCompanyDocument) {
      field = 'director_documentations';
    }

    // Remove the file from the selected field.
    const removeIndex = this[field].documents.findIndex((v) => v.id === fileId);
    if (removeIndex !== -1) {
      this[field].documents.splice(removeIndex, 1);
      this[field].readyState.splice(removeIndex, 1);
    }

    // Save the changes in the remote database.
    superagent
      .patch(
        [environment.farmhouse, 'pitch', 'draft', this.draft_key].join('/')
      )
      .set(
        'Authorization',
        ['Bearer', this.sessionService.sessionToken].join(' ')
      )
      .send({
        review_documents: {
          company_documentations: this.company_documentations,
          director_documentations: this.director_documentations,
        },
        draft_progress: {
          documentations: {
            required: true,
            // Confirm all number of documents have been uploaded and added
            value:
              this.company_documentations.documents.length === 4 &&
              this.director_documentations.documents.length ===
                this.draft.other_curators.length + 1,
          },
        },
      })
      .end((_, response) => {
        if (response) {
          if (response.statusCode === 200) {
            if (isCompanyDocument) {
              this.toastService.show(
                'Company documentation successfully removed.'
              );
            } else {
              this.toastService.show(
                'Director documentation successfully removed.'
              );
            }
          } else {
            this.toastService.show(
              response.body.reason ||
                'Something went wrong while processing your request.'
            );
          }
        } else {
          this.toastService.show("You're not connected to the internet.");
        }
      });
  }

  save(isFromButton = false) {
    return new Promise((resolve, reject) => {
      // Process the documents uploaded for each category, directors and company
      const directorDocumentsReady =
        this.all(this.director_documentations.readyState) &&
        this.director_documentations.readyState.length !== 0;
      const companyDocumentsReady =
        this.all(this.company_documentations.readyState) &&
        this.company_documentations.readyState.length !== 0;

      console.log();

      if (directorDocumentsReady || companyDocumentsReady) {
        superagent
          .patch(
            [environment.farmhouse, 'pitch', 'draft', this.draft_key].join('/')
          )
          .set(
            'Authorization',
            ['Bearer', this.sessionService.sessionToken].join(' ')
          )
          .send({
            review_documents: {
              company_documentations: this.company_documentations,
              director_documentations: this.director_documentations,
            },
            draft_progress: {
              documentations: {
                required: true,
                // Confirm all number of documents have been uploaded and added
                value:
                  this.company_documentations.documents.length === 4 &&
                  this.director_documentations.documents.length ===
                    this.draft.other_curators.length + 1,
              },
            },
          })
          .end((_, response) => {
            if (response) {
              console.log(response);
              if (response.statusCode === 200) {
                if (isFromButton) {
                  this.toastService.show('Documentations have been updated.');
                }
                resolve(null);
              } else {
                this.toastService.show(
                  response.body.reason ||
                    'Something went wrong while saving the changes.'
                );
              }
            } else {
              this.toastService.show(
                'Unable to save possible changes. No internet connection available.'
              );
            }
          });
      } else {
        alert('Not ready for a save');
        return;
      }
    });
  }

  all(conditions: boolean[]) {
    let state = true;
    for (let condition of conditions) {
      if (condition === false) {
        return false;
      }
    }

    return true;
  }
}
