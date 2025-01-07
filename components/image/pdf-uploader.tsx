import { v4 as uuid } from 'uuid';
import {useState} from "react";
import {usePDFJS} from "@/components/hook/use-pdfjs";
import * as PDFJS from "pdfjs-dist";
import {ImageFileContainer} from "@/components/constants/types";
import {toast} from "@/components/ui/use-toast";

interface Props {
  imageFileContainers: Array<ImageFileContainer>;
  updateImageFileContainer: Function;
  maxNum: number;
  children: any;
}

export default function PdfUploader({imageFileContainers, updateImageFileContainer, maxNum, children}: Props) {
  const [uploaderId, _] = useState(uuid())
  const [pdfjs, setPDFjs] = useState<typeof PDFJS>(null)

  usePDFJS(async (pdfjs) => {
    console.log(pdfjs)
    setPDFjs(pdfjs)
  })
  const handleFileChange = async (event: any) => {
    if (!pdfjs) return;

    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e: any) => {
        const typedArray = new Uint8Array(e.target.result);
        const pdf = await pdfjs.getDocument(typedArray).promise;
        const numPages = pdf.numPages;
        const totalImages = imageFileContainers?.length + numPages
        if (totalImages <= maxNum) {
          for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const imageId = uuid();
            const newImageFileContainer: ImageFileContainer = { id: imageId, file: null, url: "", isLoading: true, isUploadedInDatabase: false }
            updateImageFileContainer(newImageFileContainer)
            const imageBlob = await renderPageAsImage(pdf, pageNum);
            const imageFile = new File([imageBlob], `pdf-image-${pageNum}.jpg`, { type: 'image/jpeg' });
            const imageUrl = URL.createObjectURL(imageFile);
            updateImageFileContainer({...newImageFileContainer, file: imageFile, url: imageUrl, isLoading: false})
          }
        }
        else {
          toast({description: `Pages exceed the maximum number : ${maxNum}`})
        }
      }
      reader.readAsArrayBuffer(file);
    }
  }

  const renderPageAsImage = async (pdf: PDFJS.PDFDocumentProxy, pageNum: number): Promise<Blob> => {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context!,
      viewport: viewport,
    };

    await page.render(renderContext).promise;

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/jpeg'); // Use 'image/png' for PNG format
    });
  };

  return (
    <div className="w-full h-full">
      <input
        type="file"
        id={uploaderId}
        name="Image"
        style={{display: 'none'}}
        accept="application/pdf"
        onChange={handleFileChange}
        multiple
      />
      <label htmlFor={uploaderId}>
        {children}
      </label>
    </div>
  )
}
