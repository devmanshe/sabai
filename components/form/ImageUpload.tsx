"use client";

import React from "react"
import { useDropzone } from "react-dropzone";
import { UploadCloud, X } from "lucide-react";
import Image from "next/image";
import {Dialog, DialogContent} from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";

type ImageUploadProps = {
  value: any[];
  onChange: (files: any[]) => void;
  multiple?: boolean;
  disabled?: boolean;
};

export function ImageUpload({ value = [], onChange, multiple = false, disabled = false }: ImageUploadProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    disabled,
    onDrop: (acceptedFiles) => {
      if(disabled) return;
      onChange([...value, ...acceptedFiles]);
    },
  });

  const [previewImage, setPreviewImage] = React.useState<string | null>(null)

  const handleRemove = (index: number) => {
    const newFiles = value.filter((_, i) => i !== index);
    onChange(newFiles);
  };

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed !rounded-[10px] p-8 transition-all flex flex-col items-center justify-center cursor-pointer
        ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
        ${disabled ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}
      `}
    >
      <input {...getInputProps()} />
      {/* Header */}
      <div className="bg-gray-100 p-4 rounded-full mb-4">
        <UploadCloud className="w-8 h-8 text-gray-500" />
      </div>
      <h3 className="font-bold text-gray-700">Add item image</h3>
      <p className="text-sm text-gray-400 mt-1">
        Drop an image or <span className="text-blue-500">browse</span> it from your computer
      </p>

      {/* Preview */}
      {value.length > 0 && (
        <div className="flex gap-3 mt-4 flex-wrap justify-center">
          {value.map((file, index) => {
            // const isExistingURL = typeof file === "string" ? file : file instanceof File || file instanceof Blob ? URL.createObjectURL(file) : file?.url;
            // const previewUrl = isExistingURL ? file : URL.createObjectURL(file);
            let previewUrl = "";
            if(typeof file === "string"){
              previewUrl = file;
            } else if (file instanceof File || file instanceof Blob) {
              previewUrl = URL.createObjectURL(file);
            } else if (file && typeof file === "object" && file.url){
              previewUrl = file.url;
            }

            if(!previewUrl) return null;
            return (
              <div
                key={index}
                className="relative w-20 h-20"
                onClick={(e) => {e.stopPropagation(); setPreviewImage(previewUrl)}}
              >
                <div className="w-full h-full rounded-lg border overflow-hidden bg-gray-50">
                  <Image
                    src={previewUrl}
                    alt="preview"
                    fill
                    unoptimized
                    className="object-cover !rounded-[5px]"
                    onError={() => console.error("Gagal Memuat gambar url")}
                  />
                </div>

                <button
                  type="button"
                  className="absolute -top-2 -right-2 bg-black text-white rounded-full w-6 h-6 flex items-center justify-center shadow"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if(disabled) return;
                    handleRemove(index);
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}

          <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
            <DialogTitle></DialogTitle>
            <DialogContent className="max-w-4xl p-0" onClick={(e) => e.stopPropagation()}>
              {previewImage && (
                <img src={previewImage} alt="Preview" className="w-full max-h-[85vh] object-contain mx-auto"/>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}