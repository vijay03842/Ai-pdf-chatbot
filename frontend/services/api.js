import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export async function getHealth() {
  const response = await api.get("/");
  return response.data;
}

export async function uploadPdf(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function askQuestion(fileId, question) {
  const response = await api.get("/chat", {
    params: {
      file_id: fileId,
      question: question,
    },
  });

  return response.data;
}

export function getApiErrorMessage(error) {
  if (!error.response) {
    if (
      error.code === "ERR_NETWORK" ||
      error.message?.includes("Network Error")
    ) {
      return "Unable to reach the server. Make sure the backend is running on http://127.0.0.1:8000.";
    }

    return error.message || "An unexpected network error occurred.";
  }

  const data = error.response.data;
  console.log(data);

  if (typeof data === "string") return data;

  if (data?.Error) return data.Error;

  if (data?.detail) {
    return typeof data.detail === "string"
      ? data.detail
      : JSON.stringify(data.detail);
  }

  if (data?.message) return data.message;

  return `Request failed with status ${error.response.status}.`;
}

export default api;