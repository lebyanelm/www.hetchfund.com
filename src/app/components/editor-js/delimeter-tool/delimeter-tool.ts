export class CustomDelimeterTool {
  static get toolbox() {
    return {
      title: 'Delimeter',
      icon: '***',
    };
  }

  render() {
    const dotsElement = document.createElement('span');
    dotsElement.innerHTML = '<h1>***</h1>';
    dotsElement.className = 'delimeter-tool';
    return dotsElement;
  }

  save(blockContent) {
    return {
      url: blockContent.innerHTML,
    };
  }
}
