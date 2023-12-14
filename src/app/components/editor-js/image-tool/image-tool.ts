import { environment } from 'src/environments/environment';
import * as superagent from 'superagent';
import ToolConstructable, { OutputData } from '@editorjs/editorjs';
import { SessionService } from 'src/app/services/session.service';
import { nanoid } from 'nanoid';

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
      title: 'Image',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><rect width="14" height="14" x="5" y="5" stroke="currentColor" stroke-width="2" rx="4"></rect><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.13968 15.32L8.69058 11.5661C9.02934 11.2036 9.48873 11 9.96774 11C10.4467 11 10.9061 11.2036 11.2449 11.5661L15.3871 16M13.5806 14.0664L15.0132 12.533C15.3519 12.1705 15.8113 11.9668 16.2903 11.9668C16.7693 11.9668 17.2287 12.1705 17.5675 12.533L18.841 13.9634"></path><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.7778 9.33331H13.7867"></path></svg>',
    };
  }

  render(data: OutputData): HTMLDivElement {
    // Elements responsible for selecting the image file.
    const imageSelectorButton: any = document.createElement('div');
    const imageSelectorInput = document.createElement('input');

    // Add elements to the selector button.
    const selectorId = nanoid()
    imageSelectorButton.className = 'formfield';
    imageSelectorButton.id = 'image-selector';

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
                                                  .name || this.data?.cdnUrl
                                              : 'File upload limit: 200MB'
                                          }
                                        </span>


                                        <div
                                          class="upload-progress"
                                          id="${selectorId}"
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
      uploadcareClient.uploadFile(imageSelectorInput.files[0], { onProgress: function(event: any) {
        const progressElement = document.getElementById(selectorId);
        if (progressElement) {
          progressElement.style.width = event.value * 100 + '%';
        }
      }}).then((uploadResult) => {
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
