import {
  BsFileEarmarkExcel,
  BsFileEarmarkImage,
  BsFileEarmarkMusic,
  BsFileEarmarkPdf, BsFileEarmarkPlay,
  BsFileEarmarkText, BsFileEarmarkWord,
  BsFileEarmarkZip,
} from "react-icons/bs";

export default function FileExtraIcon({type, size = 30, className}) {
  const found = IconList.find(item => item.value === type);
  return found?.icon(size, className);
}

export const IconList = [
  {value: 'image', label: 'Image', icon: (size, className) => <BsFileEarmarkImage size={size} className={className}/>},
  {value: 'text', label: 'Text', icon: (size, className) => <BsFileEarmarkText size={size} className={className}/>},
  {value: 'pdf', label: 'PDF', icon: (size, className) => <BsFileEarmarkPdf size={size} className={className}/>},
  {value: 'word', label: 'Word', icon: (size, className) => <BsFileEarmarkWord size={size} className={className}/>},
  {value: 'excel', label: 'Excel', icon: (size, className) => <BsFileEarmarkExcel size={size} className={className}/>},
  {value: 'music', label: 'Music', icon: (size, className) => <BsFileEarmarkMusic size={size} className={className}/>},
  {value: 'play', label: 'Play', icon: (size, className) => <BsFileEarmarkPlay size={size} className={className}/>},
  {value: 'zip', label: 'Zip', icon: (size, className) => <BsFileEarmarkZip size={size} className={className}/>},
]