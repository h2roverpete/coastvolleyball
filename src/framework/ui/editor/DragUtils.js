export function onMouseMove(e) {
  const percent = getCursorPercent(e, 'horizontal')
  e.target.style.cursor = percent < 0.25 ? 'move' : 'pointer';
}

export function onDragStart(e, data) {
  if (!e.dataTransfer.getData('application/json')) {
    e.target.style.cursor = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify(data));
  }
  e.stopPropagation()
}

export function getCursorPercent(e, direction) {
  const x = e.nativeEvent.offsetX;
  const y = e.nativeEvent.offsetY;
  const width = e.nativeEvent.target.offsetWidth;
  const height = e.nativeEvent.target.offsetHeight;
  return direction === 'vertical' ? y / height : x / width;
}

let savedDropStyle = undefined;

export function onDragOver(e, dropData, direction) {
  if (!savedDropStyle) {
    savedDropStyle = {...e.target.style};
  }
  const percent = getCursorPercent(e, direction);
  if (direction === 'vertical') {
    e.target.style.borderStyle = 'solid';
    e.target.style.borderColor = 'white';
    if (percent < 0.40) {
      e.target.style.borderWidth = '2px 0 0 0';
    } else if (percent < 0.60) {
      e.target.style.borderWidth = '0 2px 0 0';
    } else {
      e.target.style.borderWidth = '0 0 2px 0';

    }
  } else if (direction === 'horizontal') {
    e.target.style.borderStyle = 'solid';
    if (percent < 0.40) {
      e.target.style.borderWidth = '0 0 0 2px';
    } else if (percent < 0.60) {
      e.target.style.borderWidth = '0 0 2px 0';
    } else {
      e.target.style.borderWidth = '0 2px 0 0';
    }
  }
  e.preventDefault();
  e.stopPropagation();
}

export function onDragLeave(e) {
  if (savedDropStyle) {
    e.target.style = savedDropStyle;
    savedDropStyle = null;
  }
  e.stopPropagation();
}

export function onDragEnd(e) {
  if (savedDropStyle) {
    e.target.style = savedDropStyle;
    savedDropStyle = null;
  }
  e.stopPropagation();
}