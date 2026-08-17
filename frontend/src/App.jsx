import { useEffect, useState } from "react";

import UploadTab from "./components/UploadTab";
import ChatTab from "./components/ChatTab";

import {
  askQuestion,
  getApiErrorMessage,
  getHealth,
  uploadPdf,
} from "../services/api";

function createMessage(role, content, options = {}) {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    ...options,
  };
}

export default function App() {
  // PDF state
  const [fileId, setFileId] = useState("");
  const [pdfUploaded, setPdfUploaded] = useState(false);
  const [pdfFileName, setPdfFileName] = useState("");
  const [uploadedChunks, setUploadedChunks] = useState(0);

  // Upload state
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Backend status
  const [backendStatus, setBackendStatus] = useState("checking");

  // -----------------------------
  // Check backend
  // -----------------------------
  useEffect(() => {
    getHealth()
      .then(() => setBackendStatus("online"))
      .catch(() => setBackendStatus("offline"));
  }, []);

  // -----------------------------
  // Upload PDF
  // -----------------------------
  const handleUpload = async (file) => {
    setUploadError("");
    setUploadSuccess(false);

    try {
      setIsUploading(true);

      const data = await uploadPdf(file);

      if (data?.Error) {
        setUploadError(data.Error);
        return;
      }

      if (!data?.file_id) {
        setUploadError("File ID was not returned.");
        return;
      }

      // Save file ID
      setFileId(data.file_id);

      // Save PDF info
      setPdfUploaded(true);
      setPdfFileName(file.name);
      setUploadedChunks(data.chunks || 0);

      // Success
      setUploadSuccess(true);

      // Clear old messages
      setMessages([]);
      setInputValue("");

      setBackendStatus("online");
    } catch (error) {
      setUploadError(getApiErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  };

  // -----------------------------
  // Send question
  // -----------------------------
  const handleSend = async () => {
    const question = inputValue.trim();

    if (!question || isLoading) {
      return;
    }

    if (!fileId) {
      setMessages((prev) => [
        ...prev,
        createMessage(
          "assistant",
          "Please upload a PDF first.",
          { isError: true }
        ),
      ]);

      return;
    }

    // Add user message
    setMessages((prev) => [
      ...prev,
      createMessage("user", question),
    ]);

    setInputValue("");
    setIsLoading(true);

    try {
      // Send file ID + question
      const data = await askQuestion(fileId, question);

      if (!data?.answer) {
        throw new Error("No answer returned.");
      }

      // Add AI response
      setMessages((prev) => [
        ...prev,
        createMessage("assistant", data.answer),
      ]);

      setBackendStatus("online");
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        createMessage(
          "assistant",
          getApiErrorMessage(error),
          { isError: true }
        ),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // -----------------------------
  // Reset
  // -----------------------------
  const handleReset = () => {
    setFileId("");
    setPdfUploaded(false);
    setPdfFileName("");
    setUploadedChunks(0);

    setUploadSuccess(false);
    setUploadError("");

    setMessages([]);
    setInputValue("");
  };

  // -----------------------------
  // Clear chat
  // -----------------------------
  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex h-screen bg-[#212121] text-white">

      {/* Sidebar */}
      <aside className="w-[260px] bg-[#171717] border-r border-[#2d2d2d] p-4">

        <h1 className="text-lg font-semibold mb-5">
          RAG PDF CHATBOT
        </h1>

        <button
          onClick={handleReset}
          className="w-full rounded-lg border border-[#4d4d4d] p-2.5 text-sm hover:bg-[#2d2d2d]"
        >
          + New Chat
        </button>

        {/* Upload */}
        <div className="mt-5">
          <UploadTab
            onUpload={handleUpload}
            isUploading={isUploading}
            uploadError={uploadError}
            uploadSuccess={uploadSuccess}
            uploadedFileName={pdfFileName}
          />
        </div>

        {/* PDF information */}
        {pdfUploaded && (
          <div className="mt-5 border-t border-[#2d2d2d] pt-4">

            <p className="text-xs text-zinc-500 mb-2">
              UPLOADED DOCUMENT
            </p>

            <div className="bg-[#212121] border border-[#2d2d2d] rounded-lg p-3">

              <p className="text-sm truncate">
                📄 {pdfFileName}
              </p>

              <p className="text-xs text-zinc-400 mt-1">
                Chunks: {uploadedChunks}
              </p>

            </div>
          </div>
        )}

        {/* Backend */}
        <div className="mt-5 text-xs text-zinc-400">

          <span
            className={`inline-block w-2 h-2 rounded-full mr-2 ${
              backendStatus === "online"
                ? "bg-green-500"
                : backendStatus === "offline"
                ? "bg-red-500"
                : "bg-yellow-500"
            }`}
          />

          Backend: {backendStatus}

        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col">

        <header className="h-14 flex items-center px-5 border-b border-[#2d2d2d]">
          <h2 className="font-semibold">
            RAG PDF Chatbot
          </h2>
        </header>

        <div className="flex-1 overflow-hidden">

          {pdfUploaded ? (
            <ChatTab
              pdfFileName={pdfFileName}
              messages={messages}
              inputValue={inputValue}
              onInputChange={setInputValue}
              onSend={handleSend}
              isLoading={isLoading}
              disabled={backendStatus === "offline"}
              onClearChat={clearChat}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">

                <h1 className="text-3xl font-bold mb-3">
                  RAG Chatbot
                </h1>

                <p className="text-zinc-400">
                  Upload a PDF and ask questions about it.
                </p>

              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}