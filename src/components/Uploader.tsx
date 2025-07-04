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

  const uploadFile = async (file: File) => {
    setFiles((prevFiles) =>
      prevFiles.map((f) => (f.file === file ? { ...f, uploading: true } : f)),
    );

    try {
      const res = await fetch("/api/s3/upload", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });

      if (!res.ok) {
        toast.error("Failed to get presigned url");

        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f.file === file
              ? { ...f, uploading: false, progress: 0, error: true }
              : f,
          ),
        );

        return;
      }

      const { presignedUrl, key } = await res.json();

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setFiles((prevFiles) =>
              prevFiles.map((f) =>
                f.file === file
                  ? { ...f, progress: Math.round(percentComplete), key: key }
                  : f,
              ),
            );
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 204) {
            setFiles((prevFiles) =>
              prevFiles.map((f) =>
                f.file === file
                  ? { ...f, uploading: false, progress: 100, error: false }
                  : f,
              ),
            );

            toast.success("File uploaded successfully");

            resolve();
          } else {
            reject(new Error(`Upload failed with status: ${xhr.status}`));
          }
        };

        xhr.onerror = () => {
          reject(new Error("Upload failed"));
        };

        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });
    } catch {
      toast.error("Failed to upload file(s)");

      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.file === file
            ? { ...f, uploading: false, progress: 0, error: true }
            : f,
        ),
      );
    }
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
            <p>{file.progress}%</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default Uploader;
