import { environment } from 'src/environments/environment';
import * as superagent from 'superagent';
import ToolConstructable, { OutputData } from '@editorjs/editorjs';
import { SessionService } from 'src/app/services/session.service';

export class CustomImageTool {
  data;
  config;
  selectedImage;
  readOnly;

  constructor({ data, config, readOnly }) {
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
    imageSelectorButton.className = 'formfield';
    imageSelectorButton.id = 'image-selector';

    imageSelectorButton.innerHTML = `<div class="media-selector" style="display: ${
      this.data?.url === undefined ? 'block' : 'none'
    }">
                                        <ion-icon name="image-sharp"></ion-icon>
                                        <span class="paragraph-text-style"
                                          >Selected file: <b class="selected-image-name">Click to select a file.</b></span>

                                        <span class="paragraph-text-style">
                                          ${
                                            this.data?.url
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
                                        this.data?.url !== undefined
                                          ? 'block'
                                          : 'none'
                                      }" class="image-preview" src="${
      this.data?.url
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
