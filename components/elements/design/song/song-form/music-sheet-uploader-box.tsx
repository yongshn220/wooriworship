import { ImageFileContainer } from "@/components/constants/types";
import { Button } from "@/components/ui/button";
import { ImagePlus, FileUp, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadedImageFileCard } from "@/components/elements/util/image/uploaded-image-file-card";
import MultipleImageUploader from "@/components/elements/util/image/multiple-image-uploader";
import PdfUploader from "@/components/elements/util/image/pdf-uploader";
import React from "react";

const MUSIC_KEYS = [
  "C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B",
  "Cm", "C#m", "Dm", "D#m", "Ebm", "Em", "Fm", "F#m", "Gm", "G#m", "Abm", "Am", "A#m", "Bbm", "Bm",
];

interface Props {
  tempId: string
  musicKey: string
  musicNote: string
  setMusicKey: (tempId: string, key: string) => void
  setMusicNote: (tempId: string, note: string) => void
  imageFileContainers: Array<ImageFileContainer>
  handleAddImageFileContainer: (tempId: string, container: ImageFileContainer) => void
  handleRemoveImageFileContainer: (tempId: string, index: number) => void
  handleRemoveMusicSheetContainer: (tempId: string) => void
}

export function MusicSheetUploaderBox({
  tempId,
  imageFileContainers,
  musicKey,
  musicNote,
  setMusicKey,
  setMusicNote,
  handleAddImageFileContainer,
  handleRemoveImageFileContainer,
  handleRemoveMusicSheetContainer,
}: Props) {
  function updateImageFileContainer(newContainer: ImageFileContainer) {
    handleAddImageFileContainer(tempId, newContainer)
  }

  return (
    <div className="space-y-4">
      {/* Key + Note Row */}
      <div className="flex gap-3">
        <div className="w-28 shrink-0">
          <Select value={musicKey} onValueChange={(value) => setMusicKey(tempId, value)}>
            <SelectTrigger className="h-10 rounded-xl bg-secondary/40 border-border">
              <SelectValue placeholder="Key" />
            </SelectTrigger>
            <SelectContent className="z-[10000]">
              {MUSIC_KEYS.map((key) => (
                <SelectItem key={key} value={key}>{key}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Input
          placeholder="e.g. Female key"
          value={musicNote}
          onChange={(e) => setMusicNote(tempId, e.target.value)}
          className="h-10 rounded-xl bg-secondary/40 border-border text-sm"
        />
      </div>

      {/* Image Grid */}
      {imageFileContainers?.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {imageFileContainers.map((imageFileContainer, i) => (
            <div key={i} className="relative">
              <UploadedImageFileCard
                imageFileContainer={imageFileContainer}
                index={i}
                handleRemoveImage={(index: number) => handleRemoveImageFileContainer(tempId, index)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Upload Zone */}
      <div className="flex gap-2">
        <MultipleImageUploader imageFileContainers={imageFileContainers} updateImageFileContainer={updateImageFileContainer} maxNum={5} className="flex-1">
          <div className="flex items-center justify-center gap-2 h-12 rounded-xl border-2 border-dashed border-border bg-secondary/20 text-sm text-muted-foreground hover:border-primary/40 hover:bg-primary/5 cursor-pointer transition-colors">
            <ImagePlus className="w-4 h-4" />
            Image
          </div>
        </MultipleImageUploader>
        <PdfUploader imageFileContainers={imageFileContainers} updateImageFileContainer={updateImageFileContainer} maxNum={5} className="flex-1">
          <div className="flex items-center justify-center gap-2 h-12 rounded-xl border-2 border-dashed border-border bg-secondary/20 text-sm text-muted-foreground hover:border-primary/40 hover:bg-primary/5 cursor-pointer transition-colors">
            <FileUp className="w-4 h-4" />
            PDF
          </div>
        </PdfUploader>
      </div>

      {/* Delete Sheet */}
      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
          onClick={() => handleRemoveMusicSheetContainer(tempId)}
        >
          <Trash2 className="w-3.5 h-3.5 mr-1" />
          Delete Sheet
        </Button>
      </div>
    </div>
  )
}
