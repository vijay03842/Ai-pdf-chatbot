import { useRef, useState } from "react";

const PDF_ONLY_ERROR = "Only PDF files are allowed.";

function isValidPdfFile(file) {
  return (
    file &&
    (
      file.name.toLowerCase().endsWith(".pdf") ||
      file.type === "application/pdf"
    )
  );
}

export default function UploadTab({
  onUpload,
  isUploading,
  uploadError,
  uploadSuccess,
  uploadedFileName,
}) {
  const inputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [validationError, setValidationError] = useState("");

  const clearSelection = () => {
    setSelectedFile(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleFileSelection = (file) => {
    setValidationError("");

    if (!file) {
      clearSelection();
      return;
    }

    if (!isValidPdfFile(file)) {
      setValidationError(PDF_ONLY_ERROR);
      clearSelection();
      return;
    }

    setSelectedFile(file);
  };

  const handleInputChange = (event) => {
    handleFileSelection(event.target.files?.[0]);
  };

  const handleUploadClick = async () => {
    if (!selectedFile || !isValidPdfFile(selectedFile)) {
      setValidationError(PDF_ONLY_ERROR);
      return;
    }

    await onUpload(selectedFile);

    clearSelection();
  };

  const displayError = validationError || uploadError;

  return (
    <div className="flex flex-col gap-3">

      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          PDF Document Source
        </p>

        <p className="text-[11px] text-zinc-400 mt-1">
          Upload a PDF to query.
        </p>
      </div>

      {/* File input */}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Choose */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="w-full rounded-lg border border-[#4d4d4d] bg-[#212121] py-2 text-xs font-semibold hover:bg-[#2d2d2d] disabled:opacity-50"
      >
        {selectedFile ? "Change PDF File" : "Choose PDF File"}
      </button>

      {/* Selected file */}
      {selectedFile && (
        <>
          <div className="rounded-lg bg-[#212121] border border-[#2d2d2d] p-2 flex items-center justify-between">

            <span className="text-xs truncate">
              📄 {selectedFile.name}
            </span>

            <button
              type="button"
              onClick={clearSelection}
              disabled={isUploading}
              className="text-xs text-zinc-500 hover:text-white ml-2"
            >
              Cancel
            </button>

          </div>

          <button
            type="button"
            onClick={handleUploadClick}
            disabled={isUploading}
            className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 py-2 text-xs font-semibold disabled:opacity-50"
          >
            {isUploading
              ? "Uploading & Indexing..."
              : "Upload & Analyze"}
          </button>
        </>
      )}

      {/* Error */}
      {displayError && (
        <div className="rounded-lg border border-red-900 bg-red-950/20 p-2 text-xs text-red-400">
          {displayError}
        </div>
      )}

      {/* Success */}
      {uploadSuccess && uploadedFileName && (
        <div className="rounded-lg border border-green-900 bg-green-950/20 p-2 text-xs text-green-400">

          <p className="font-bold">
            ✓ Upload Success
          </p>

          <p className="text-zinc-400 truncate mt-1">
            {uploadedFileName}
          </p>

        </div>
      )}

    </div>
  );
}