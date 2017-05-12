import { inject, bindable } from 'aurelia-framework';

import 'jquery';

// adapted from https://css-tricks.com/drag-and-drop-file-uploading/
@inject(Element)
export class FileDropper {
  @bindable stagedFile;
  @bindable validateStagedFile;

  constructor(element) {
    this.element = element;
  }

  attached() {
    this.initializeDataModel();
    this.initializeDOMHooks();
    this.wireEventListeners();
  }

  initializeDataModel() {
    this.stagedFileErrors = [];
  }

  initializeDOMHooks() {
    this.$element = $(this.element);
    this.$dropzone = this.$element.find('.dropzone');
    this.$fileInput = this.$dropzone.find('input[type="file"]');
  }

  wireEventListeners() {
    const $fileInput = this.$fileInput;
    const $dropzone = this.$dropzone;

    const isAdvancedUpload = (() => {
      const div = document.createElement('div');
      return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
    })();

    $fileInput.on('change', (e) => {
      const fileList = e.target.files;
      this.handleNewFileList(fileList);
    });

    $dropzone.on('click', (e) => {
      $fileInput.click();
    });

    $fileInput.on('click', (e) => {
      e.stopPropagation();
    });

    if (isAdvancedUpload) {
      $dropzone.addClass('has-advanced-upload')
        .on('drag dragstart dragend dragover dragenter dragleave drop', (e) => {
          e.preventDefault();
          e.stopPropagation();
        })
        .on('dragover dragenter', () => {
          $dropzone.addClass('is-dragover');
        })
        .on('dragleave dragend drop', () => {
          $dropzone.removeClass('is-dragover');
        })
        .on('drop', (e) => {
          const fileList = e.originalEvent.dataTransfer.files;
          this.handleNewFileList(fileList);
        });
    }
  }

  handleNewFileList(fileList) {
    if (fileList.length) {
      const stagedFile = this.stagedFile = fileList[0];
      console.log(stagedFile);
      if (typeof this.validateStagedFile === 'function') {
        this.stagedFileErrors = validateStagedFile(stagedFile);
      } else {
        this.stagedFileErrors = [];
      }
    } else {
      this.stagedFile = null;
    }
  }

  get hasStagedFile() {
    return this.stagedFile;
  }

  get isStagedFileValid() {
    return this.stagedFile && !this.stagedFileErrors.length;
  }

  detached() {
    this.stagedFile = null;
  }

  getByteSizes(bytes) {
    return {
      kiloBytes: parseInt(Math.round(bytes / 1000.0, 0), 10),
      megaBytes: parseInt(Math.round(bytes / 1000000.0, 0), 10)
    };
  }

  getFileSizeString(file) {
    const byteSizes = this.getByteSizes(file.size);
    if (byteSizes.megaBytes) {
      return `~${byteSizes.megaBytes} MB`;
    }

    return `~${byteSizes.kiloBytes} MB`;
  }
}