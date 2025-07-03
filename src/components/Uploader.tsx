/* eslint-disable react/no-unescaped-entities */
"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "./ui/card";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

const Uploader = () => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  return (
    <Card
      className={cn(
        "relative h-64 w-full border-2 border-dashed transition-colors duration-200 ease-in-out",
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
