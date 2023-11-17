import { environment } from 'src/environments/environment';
import * as superagent from 'superagent';
import ToolConstructable, { OutputData } from '@editorjs/editorjs';
import { SessionService } from 'src/app/services/session.service';

// UPLOADCARE API INTERGRATION.
import { UploadClient } from '@uploadcare/upload-client'
import { ToastManagerService } from 'src/app/services/toast-manager.service';
const uploadcareClient = new UploadClient({ publicKey: environment.UPLOADCARE_PUBLIC_KEY })

export class CustomImageTool {
  data;
  config;
  selectedImage;
  readOnly;

  constructor({ data, config, readOnly }, private toastService: ToastManagerService) {
    this.data = data;
    this.config = config;
  }

  static get toolbox() {
    return {
      title: 'YouTube Video Embed',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path d="M508.64 148.79c0-45-33.1-81.2-74-81.2C379.24 65 322.74 64 265 64h-18c-57.6 0-114.2 1-169.6 3.6C36.6 67.6 3.5 104 3.5 149 1 184.59-.06 220.19 0 255.79q-.15 53.4 3.4 106.9c0 45 33.1 81.5 73.9 81.5 58.2 2.7 117.9 3.9 178.6 3.8q91.2.3 178.6-3.8c40.9 0 74-36.5 74-81.5 2.4-35.7 3.5-71.3 3.4-107q.34-53.4-3.26-106.9zM207 353.89v-196.5l145 98.2z"/></svg>'
    };
  }

  render(data: OutputData): HTMLDivElement {
    console.log(this.data, data)
    // Elements responsible for selecting the image file.
    const imageSelectorButton: any = document.createElement('div');
    const imageSelectorInput = document.createElement('input');

    // Add elements to the selector button.
    imageSelectorButton.className = 'formfield';
    imageSelectorButton.id = 'youtube-video-selector';

    imageSelectorButton.innerHTML = `<div class="media-selector" style="display: ${
      this.data?.cdnUrl === undefined ? 'block' : 'none'
    }">
                                        <ion-icon name="image-sharp"></ion-icon>
                                        <span class="paragraph-text-style"
                                          >Selected file: <b class="selected-image-name">Click to select a file.</b></span>

                                        <span class="paragraph-text-style">
                                          ${
                                            this.data?.cdnUrl
                                              ? imageSelectorInput?.files?.[0]
                                                  .name
                                              : 'File upload limit: 200MB'
                                          }
                                        </span>


                                        <div
                                          class="upload-progress"
                                          width="0"
                                        ></div>
                                        <div class="image-loader" style="display: none"><div class="flexbox flexbox-center"><div class="spinner"></div></div></div>
                                      </div>
                                      
                                      <img width="100%" style="display: ${
                                        this.data?.cdnUrl !== undefined
                                          ? 'block'
                                          : 'none'
                                      }" class="image-preview" src="${
      this.data?.cdnUrl
    }">
                                      `;

    // Hide file input element.
    imageSelectorInput.type = 'file';
    imageSelectorInput.setAttribute('hidden', '');

    // Attach selector events.
    imageSelectorButton.onclick = () => {
      imageSelectorInput.click();
    };

    imageSelectorInput.onchange = () => {
      // Update the selected file name
      imageSelectorButton.getElementsByClassName(
        'selected-image-name'
      )[0].innerText = imageSelectorInput.files?.[0].name;

      // Upload the file.
      uploadcareClient.uploadFile(imageSelectorInput.files[0]).then((uploadResult) => {
        console.log("File uploaded: ", uploadResult)
        if (uploadResult) {
            this.data = uploadResult;

            // Show and add the source of the uploaded image to the preview element.
            const previewImage =
              imageSelectorButton.getElementsByClassName('image-preview')[0];

            previewImage.style.display = 'block';
            previewImage.src = this.data.cdnUrl;

            // Hide the selection element.
            const innerSelectionElement =
              imageSelectorButton.getElementsByClassName('media-selector')[0];
            innerSelectionElement.style.display = 'none';
        } else {
          this.toastService.show("Something went wrong while uploading the image");
        }
      }).catch((error) => {
        console.log("File upload failed: ", error);
        this.toastService.show("Something went wrong while uploading.");
      })

      superagent
        .post([environment.media_resources, 'upload'].join('/'))
        .set(
          'Authorization',
          ['Bearer', window.localStorage.getItem('session-token')].join(' ')
        )
        .attach('file', imageSelectorInput.files[0])
        .on('progress', (event) => {
          imageSelectorButton.getElementsByClassName(
            'upload-progress'
          )[0].style.width = [event.percent, '%'].join('');
        })
        .end((_, response) => {
          if (response) {
            if (response.statusCode === 200) {
              this.data = response.body.data;

              // Show and add the source of the uploaded image to the preview element.
              const previewImage =
                imageSelectorButton.getElementsByClassName('image-preview')[0];

              previewImage.style.display = 'block';
              previewImage.src = this.data.url;

              // Hide the selection element.
              const innerSelectionElement =
                imageSelectorButton.getElementsByClassName('media-selector')[0];
              innerSelectionElement.style.display = 'none';
            } else {
              if (response.statusCode === 500) {
                console.log('Something went wrong.');
              } else {
                console.log(response.body.reason);
              }
            }
          } else {
            console.log('Server connection closed for some reason.');
          }
        });
    };

    // Create the wrapper tool.
    const wrapper = document.createElement('div');
    wrapper.className = 'formfields';

    wrapper.appendChild(imageSelectorInput);
    wrapper.appendChild(imageSelectorButton);

    return wrapper;
  }

  toggleReadonly(s) {
    this.readOnly = s;
    return this.readOnly;
  }

  save() {
    return this.data;
  }
}
