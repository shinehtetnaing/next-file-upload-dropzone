/* eslint-disable react/no-unescaped-entities */
"use client";

import { maxFiles, maxFileSize } from "@/constants";
import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

const Uploader = () => {
  const [files, setFiles] = useState<
    Array<{
      id: string;
      file: File;
      uploading: boolean;
      progress: number;
      key?: string;
      isDeleting: boolean;
      error: boolean;
      objectUrl?: string;
    }>
  >([]);

  const uploadFile = (file: File) => {
    console.log("uploading", file);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length) {
      setFiles((prevFiles) => [
        ...prevFiles,
        ...acceptedFiles.map((file) => ({
          id: uuidv4(),
          file,
          uploading: false,
          progress: 0,
          isDeleting: false,
          error: false,
          objectUrl: URL.createObjectURL(file),
        })),
      ]);
    }

    acceptedFiles.forEach(uploadFile);
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
    <>
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

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
        {files.map((file) => (
          <div key={file.id}>
            <img src={file.objectUrl} alt="image" />
          </div>
        ))}
      </div>
    </>
  );
};

export default Uploader;
