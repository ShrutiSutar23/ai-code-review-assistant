import { useState } from "react";
import axios from "axios";

function UploadPage() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please choose a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://127.0.0.1:5000/upload", formData);
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.error || "Upload failed.");
    }
  };

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>Upload Your Code</h1>
      <input type="file" onChange={handleFileChange} />
      <br /><br />
      <button onClick={handleUpload}>Upload</button>
      <p>{message}</p>
    </div>
  );
}

export default UploadPage;