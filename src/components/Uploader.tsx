/* eslint-disable react/no-unescaped-entities */
"use client";

import { maxFiles, maxFileSize } from "@/constants";
import { cn } from "@/lib/utils";
import { useCallback } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

const Uploader = () => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log(acceptedFiles);
  }, []);

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      const tooManyFiles = fileRejections.find(
        (fileRejection) => fileRejection.errors[0].code === "too-many-files",
      );

      const fileTooLarge = fileRejections.find(
        (fileRejection) => fileRejection.errors[0].code === "file-too-large",
      );

      if (tooManyFiles)
        toast.error(`You can only upload ${maxFiles} files at a time.`);

      if (fileTooLarge)
        toast.error(`The file size exceeds ${maxFileSize}MB limit.`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    maxFiles: maxFiles,
    maxSize: maxFileSize * 1024 * 1024,
    accept: { "image/*": [] },
  });
  return (
    <Card
      className={cn(
        "relative h-64 w-full border-2 border-dashed transition-colors duration-200 ease-in-out",
        isDragActive
          ? "border-primary bg-primary/10 border-solid"
          : "border-border hover:border-primary",
      )}
      {...getRootProps()}
    >
      <CardContent className="flex size-full flex-col items-center justify-center">
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-y-5">
            <p>Drag 'n' drop some files here, or click to select files</p>
            <Button>Select file(s)</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Uploader;
