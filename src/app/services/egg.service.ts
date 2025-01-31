import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import * as superagent from 'superagent';
import { ERROR_MESSAGES } from '../error_messages';
import { SessionService } from './session.service';
import { ToastManagerService } from './toast-manager.service';
import { IComment } from '../interfaces/IComment';

@Injectable({
  providedIn: 'root',
})
export class EggService {
  constructor(
    private sessionService: SessionService,
    private router: Router,
    private toastService: ToastManagerService
  ) {}

  get(
    eggKeys = null,
    options: { enableRecent?: number | boolean,
      enableInterest?: number | boolean,
      isDraft?: number | boolean } = Object.create({isDraft: false})
  ) {
    return new Promise((resolve, reject) => {
      if (this.sessionService.sessionToken) {
        options.enableRecent = false;
        options.enableInterest = false;
      } else {
        options.enableRecent = true;
        options.enableInterest = true;
      }

      if (eggKeys.length) {
        let pitchRequest;
        if (options.isDraft === false) {
          if (typeof eggKeys === 'string') eggKeys = [eggKeys];
          pitchRequest = superagent.get(
            [
              environment.farmhouse,
              [
                eggKeys.join('^'),
                [
                  'enable_recent=' + options.enableRecent,
                  'enable_interest=' + options.enableInterest,
                ].join('&'),
              ].join('?'),
            ].join('/')
          );
        } else {
          pitchRequest = superagent.get(
            [
              environment.farmhouse,
              'pitch',
              'draft',
              eggKeys
            ].join('/')
          );
        }

        if (this.sessionService.sessionToken) {
          pitchRequest.set(
            'Authorization',
            ['Bearer', this.sessionService.sessionToken].join(' ')
          );
        }

        pitchRequest.end((_, response) => {
          if (response.statusCode == 200) {
            resolve(response.body.data);
          } else {
            this.router.navigateByUrl(
              ['/errors', response.statusCode].join('/')
            );
          }
        });
      } else {
        resolve([]);
      }
    });
  }

  getFeatured(count = null) {
    return new Promise((resolve, _) => {
      superagent
        .get([environment.farmhouse, 'featured?count=' + count].join('/'))
        .end((_, response) => {
          if (response) {
            if (response.statusCode === 200) {
              resolve(response.body.data);
            } else {
              this.toastService.show(
                response.body.reason || 'Something went wrong.'
              );
            }
          } else {
            this.toastService.show("You're not connected to the internet.");
          }
        });
    });
  }

  bookmark(eggKey) {
    return new Promise((resolve) => {
      if (this.sessionService.sessionToken) {
        superagent
          .put([environment.farmhouse, eggKey, 'bookmark'].join('/'))
          .set(
            'Authorization',
            ['Bearer', this.sessionService.sessionToken].join(' ')
          )
          .end((_, response) => {
            if (response) {
              if (response.statusCode == 200) {
                resolve(response.body.data);
              } else {
                this.toastService.show(
                  response.body.data.reason || ERROR_MESSAGES.UNEXPECTED_ERROR
                );
              }
            } else {
              this.toastService.show(ERROR_MESSAGES.NO_INTERNET);
            }
          });
      } else {
        this.router.navigate(['signin'], {
          queryParams: { completeAction: 'bookmark', key: eggKey },
        });
      }
    });
  }

  getRelated(primaryCategory: string, page: number = 0) {
    return new Promise((resolve, reject) => {
      superagent
        .get(
          [
            environment.farmhouse,
            'recommendations',
            primaryCategory.replace(/\s/g, '_').replace(/\//g, '^'),
          ].join('/')
        )
        .end((_, response) => {
          if (response) {
            if (response.statusCode == 200) {
              resolve(response.body.data);
            } else {
              reject(response.body.reason || ERROR_MESSAGES.UNEXPECTED_ERROR);
            }
          } else {
            reject(ERROR_MESSAGES.NO_INTERNET);
          }
        });
    });
  }

  getRecommended(count = 15) {
    return new Promise((resolve, reject) => {
      superagent
        .get([environment.farmhouse, 'recommended?count=' + count].join('/'))
        .set(
          'Authorization',
          ['Bearer', this.sessionService.sessionToken].join(' ')
        )
        .end((_, response) => {
          if (response) {
            if (response.statusCode == 200) {
              resolve(response.body.data);
            } else {
              reject(response.body.data.reason || 'Something went wrong.');
            }
          } else {
            reject(ERROR_MESSAGES.NO_INTERNET);
          }
        });
    });
  }

  // Retrieves contribution information
  getContribution(contributionId) {
    return new Promise((resolve, reject) => {
      superagent
        .get([environment.farmhouse, 'contribution', contributionId].join('/'))
        .set(
          'Authorization',
          ['Bearer', this.sessionService.sessionToken].join(' ')
        )
        .end((_, response) => {
          if (response) {
            if (response.statusCode == 200) {
              resolve(response.body.data);
            } else {
              reject(response.body.data.reason || 'Something went wrong.');
            }
          } else {
            reject(ERROR_MESSAGES.NO_INTERNET);
          }
        });
    });
  }

  getRewards(pitchKey: string) {
    return new Promise((resolve, reject) => {
      superagent
        .get([environment.farmhouse, 'rewards', pitchKey].join('/'))
        .end((_, response) => {
          if (response) {
            if (response.statusCode === 200) {
              resolve(response.body.data);
            } else {
              resolve([]);
            }
          } else {
            reject("You're not connected to the internet.");
          }
        });
    });
  }

  getComments(pitchKey: string): Promise<IComment[]> {
    // Fetch the comments of the pitch.
    return new Promise((resolve, _) => {
      superagent
        .get([environment.farmhouse, pitchKey, 'comments'].join('/'))
        .end((_, response) => {
          console.log(response);
          if (response) {
            if (response.statusCode === 200) {
              resolve(response.body.data);
            } else {
              this.toastService.show(
                response.body.reason ||
                  'Something went wrong while fetching the comments.'
              );
            }
          } else {
            this.toastService.show("You're not connected to the internet.");
          }
        });
    });
  }

  getCommentReplies(
    pitchKey: string,
    commentKey: string,
    from: string
  ): Promise<IComment[]> {
    return new Promise((resolve, _) => {
      superagent
        .get(
          [
            environment.farmhouse,
            pitchKey,
            'comments',
            commentKey,
            'replies?_from=' + from,
          ].join('/')
        )
        .end((_, response) => {
          console.log(response);
          if (response) {
            if (response.statusCode === 200) {
              resolve(response.body.data);
            } else {
              this.toastService.show(
                response.body.reason ||
                  'Something went wrong while fetching the comment replies.'
              );
            }
          } else {
            this.toastService.show("You're not connected to the internet.");
          }
        });
    });
  }

  addCommentReaction(
    pitchKey: string,
    commentKey: string,
    isLove: boolean = true
  ): Promise<IComment> {
    return new Promise((resolve, _) => {
      superagent
        .post(
          [
            environment.farmhouse,
            'pitch',
            pitchKey,
            'comments',
            commentKey,
            'reactions',
            isLove ? 'love' : 'unlove',
          ].join('/')
        )
        .set(
          'Authorization',
          ['Bearer', this.sessionService.sessionToken].join(' ')
        )
        .send({ isLove })
        .end((_, response) => {
          if (response) {
            if (response.statusCode === 200) {
              resolve(response.body.data);
            } else {
              if (response.statusCode === 500) {
                this.toastService.show(
                  'Something went wrong while updating the draft, please try again.'
                );
              } else {
                this.toastService.show(
                  response.body.reason ||
                    'Something went wrong when adding your reaction.'
                );
              }
            }
          } else {
            this.toastService.show('Please check your internet connection.');
          }
        });
    });
  }

  saveDraftEdits(data) {
    return new Promise((resolve, reject) => {
      superagent
        .patch([environment.farmhouse, 'pitch', 'draft', data.key].join('/'))
        .set(
          'Authorization',
          ['Bearer', this.sessionService.sessionToken].join(' ')
        )
        .send(data)
        .end((_, response) => {
          if (response) {
            if (response.statusCode === 200) {
              resolve(response.body.data);
            } else {
              if (response.statusCode === 500) {
                reject(
                  'Something went wrong while updating the draft, please try again.'
                );
              } else {
                reject(response.body.reason);
              }
            }
          } else {
            reject('Please check your internet connection.');
          }
        });
    });
  }

  getSavedDrafts() {
    return new Promise((resolve, reject) => {
      if (this.sessionService.sessionToken) {
        superagent
          .get([environment.farmhouse, 'pitch', 'drafts'].join('/'))
          .set(
            'Authorization',
            ['Bearer', this.sessionService.sessionToken].join(' ')
          )
          .end((_, response) => {
            if (response) {
              if (response.statusCode === 200) {
                resolve(response.body.data);
              } else {
                if (response.statusCode === 500) {
                  alert('Something went wrong.');
                } else {
                  resolve([]);
                }
              }
            } else {
              alert('No internet connection, server communication blocked.');
            }
          });
      }
    });
  }

  getSavedDraft(draftId: string) {
    return new Promise((resolve, reject) => {
      superagent
        .get([environment.farmhouse, 'pitch', 'draft', draftId].join('/'))
        .set(
          'Authorization',
          ['Bearer', this.sessionService.sessionToken].join(' ')
        )
        .end((_, response) => {
          if (response) {
            if (response.statusCode === 200) {
              resolve(response.body.data);
            } else {
              reject(response.statusCode);
            }
          } else {
            reject(0);
          }
        });
    });
  }

  deleteDraft(draftKey) {
    return new Promise((resolve, reject) => {
      superagent
        .delete([environment.farmhouse, 'pitch', 'draft', draftKey].join('/'))
        .set(
          'Authorization',
          ['Bearer', this.sessionService.sessionToken].join(' ')
        ).end((_, response) => {
          if (response) {
            if (response.statusCode === 200) {
              resolve(response);
            } else {
              this.toastService.show(response.body.reason || ERROR_MESSAGES.UNEXPECTED_ERROR, false, true);
            }
          } else {
            this.toastService.show(ERROR_MESSAGES.NO_INTERNET, false, true)
          }
        });
    });
  }

  getPitchRewards(pitchKey) {
    return new Promise((resolve, reject) => {
      superagent
        .get([environment.farmhouse, pitchKey, 'rewards'].join('/'))
        .end((_, response) => {
          if (response) {
            if (response.statusCode === 200) {
              resolve(response.body.data);
            } else {
              reject(
                response.body.reason ||
                  'Something went wrong, please reload the page.'
              );
            }
          } else {
            reject('Please check your internet connection.');
          }
        });
    });
  }

  getTrendingSearches() {
    return new Promise((resolve, reject) => {
      superagent
        .get([environment.farmhouse, 'search', 'trending'].join('/'))
        .end((_, response) => {
          if (response) {
            if (response.statusCode === 200) {
              resolve(response.body.data);
            } else {
              reject(
                response.body.reason ||
                  'Something went wrong, please reload the page.'
              );
            }
          } else {
            reject('Please check your internet connection.');
          }
        });
    });
  }

  getCurator(curator: string) {
    return new Promise((resolve, reject) => {
      superagent
        .get([environment.accounts, 'by_email', curator].join('/'))
        .end((_, response) => {
          if (response) {
            if (response.statusCode === 200) {
              resolve(response.body.data);
            } else {
              reject(
                response.body.reason ||
                  'Something went wrong, please reload the page.'
              );
            }
          } else {
            reject('Please check your internet connection.');
          }
        });
    });
  }

  shareLinkedin(url: string) {
    return 'https://www.linkedin.com/sharing/share-offsite/?url=' + url;
  }

  shareFacebook(url: string): string {
    return 'https://www.facebook.com/sharer/sharer.php?u=' + url;
  }

  shareTwitter(url: string): string {
    return 'https://www.facebook.com/sharer/sharer.php?u=' + url;
  }
}
