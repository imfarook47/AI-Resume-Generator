import {
  useState,
  useEffect
} from "react";

import {
  useNavigate
} from "react-router-dom";

import jsPDF from "jspdf";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";
import ReactMarkdown from "react-markdown";

import {
  generateResumeFromGroq
} from "../services/groq";

// PDF WORKER
pdfjsLib.GlobalWorkerOptions.workerSrc =
  new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

function Dashboard() {

  const navigate =
    useNavigate();

  const [file, setFile] =
    useState(null);

  const [
    jobDescription,
    setJobDescription
  ] = useState("");

  const [
    generatedResume,
    setGeneratedResume
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [
    resumeHistory,
    setResumeHistory
  ] = useState([]);

  // ROUTE PROTECTION
  useEffect(() => {

    const user =
      localStorage.getItem(
        "userEmail"
      );

    if (!user) {

      navigate("/");
    }

    fetchResumeHistory();

  }, []);

  // FETCH HISTORY
  const fetchResumeHistory =
    async () => {

      try {

        const response =
          await fetch(
            `http://localhost:8080/api/resume/user/${localStorage.getItem("userEmail")}`
          );

        const data =
          await response.json();

        setResumeHistory(data);

      } catch (error) {

        console.log(error);
      }
    };

  // LOGOUT
  const handleLogout = () => {

    localStorage.removeItem(
      "userEmail"
    );

    navigate("/");
  };

  // FILE CHANGE
  const handleFileChange =
    (e) => {

      setFile(
        e.target.files[0]
      );
    };

  // TXT
  const extractTextFromTxt =
    async (file) => {

      return await file.text();
    };

  // DOCX
  const extractTextFromDocx =
    async (file) => {

      const arrayBuffer =
        await file.arrayBuffer();

      const result =
        await mammoth.extractRawText({
          arrayBuffer,
        });

      return result.value;
    };

  // PDF
  const extractTextFromPdf =
    async (file) => {

      const arrayBuffer =
        await file.arrayBuffer();

      const pdf =
        await pdfjsLib.getDocument({
          data: arrayBuffer,
        }).promise;

      let text = "";

      for (
        let i = 1;
        i <= pdf.numPages;
        i++
      ) {

        const page =
          await pdf.getPage(i);

        const content =
          await page.getTextContent();

        const strings =
          content.items.map(
            (item) => item.str
          );

        text += strings.join(" ");
      }

      return text;
    };

  // EXTRACT TEXT
  const extractTextFromFile =
    async (file) => {

      const fileType =
        file.name
          .split(".")
          .pop()
          .toLowerCase();

      if (fileType === "txt") {

        return await extractTextFromTxt(
          file
        );
      }

      if (fileType === "docx") {

        return await extractTextFromDocx(
          file
        );
      }

      if (fileType === "pdf") {

        return await extractTextFromPdf(
          file
        );
      }

      throw new Error(
        "Unsupported file type"
      );
    };

  // GENERATE RESUME
  const handleGenerate =
    async () => {

      if (!file) {

        alert(
          "Please upload resume"
        );

        return;
      }

      if (!jobDescription) {

        alert(
          "Please enter job description"
        );

        return;
      }

      try {

        setLoading(true);

        // EXTRACT RESUME TEXT
        const resumeText =
          await extractTextFromFile(
            file
          );

        // AI PROMPT
        const prompt = `
You are an expert ATS Resume Builder.

Create a professional ATS optimized resume.

Resume:
${resumeText}

Job Description:
${jobDescription}

Use sections:
- Professional Summary
- Skills
- Experience
- Projects
- Education
- Certifications
- ATS Keywords

Give clean markdown formatting.
`;

        // AI RESPONSE
        const aiResume =
          await generateResumeFromGroq(
            prompt
          );

        setGeneratedResume(
          aiResume
        );

        // SAVE DATABASE
        await fetch(
          "https://ai-resume-generator-3.onrender.com/api/resume/save",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              email:
                localStorage.getItem(
                  "userEmail"
                ),

              jobDescription:
                jobDescription,

              generatedResume:
                aiResume,
            }),
          }
        );

        // REFRESH HISTORY
        fetchResumeHistory();

        alert(
          "Resume generated successfully"
        );

      } catch (error) {

        console.log(error);

        alert(
          "Resume generation failed"
        );

      } finally {

        setLoading(false);
      }
    };

  // DOWNLOAD PDF
  const handleDownloadPdf =
    () => {

      try {

        const pdf =
          new jsPDF(
            "p",
            "mm",
            "a4"
          );

        const content =
          document.getElementById(
            "resume-preview"
          ).innerText;

        const splitText =
          pdf.splitTextToSize(
            content,
            180
          );

        pdf.text(
          splitText,
          10,
          10
        );

        pdf.save(
          "AI_Resume.pdf"
        );

      } catch (error) {

        console.log(error);

        alert(
          "PDF download failed"
        );
      }
    };

  return (

    <div className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-700 text-white p-10 rounded-3xl shadow-xl mb-10">

          <div className="flex justify-between items-center">

            <div>

              <h1 className="text-5xl font-bold">

                AI Resume Generator

              </h1>

              <p className="mt-4 text-lg text-gray-200">

                Generate ATS optimized resumes instantly using AI.

              </p>

            </div>

            <button
              onClick={
                handleLogout
              }
              className="bg-red-500 hover:bg-red-600 px-6 py-3 rounded-2xl font-semibold"
            >

              Logout

            </button>

          </div>

        </div>

        {/* MAIN CARD */}
        <div className="bg-white p-10 rounded-3xl shadow-xl">

          {/* FILE */}
          <div className="mb-8">

            <label className="block text-xl font-semibold mb-4">

              Upload Resume

            </label>

            <input
              type="file"
              onChange={
                handleFileChange
              }
              className="w-full border border-gray-300 p-4 rounded-2xl"
            />

            {
              file && (

                <p className="mt-3 text-green-600">

                  Uploaded:
                  {" "}
                  {file.name}

                </p>
              )
            }

          </div>

          {/* JOB DESCRIPTION */}
          <div className="mb-8">

            <label className="block text-xl font-semibold mb-4">

              Job Description

            </label>

            <textarea
              rows="10"
              placeholder="Paste job description..."
              value={
                jobDescription
              }
              onChange={(e) =>
                setJobDescription(
                  e.target.value
                )
              }
              className="w-full border border-gray-300 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
            />

          </div>

          {/* BUTTON */}
          <button
            onClick={
              handleGenerate
            }
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl text-lg font-semibold"
          >

            {
              loading
                ? "Generating..."
                : "Generate Resume"
            }

          </button>

        </div>

        {/* GENERATED RESUME */}
        {
          generatedResume && (

            <div
              id="resume-preview"
              className="bg-white p-10 rounded-3xl shadow-xl mt-10"
            >

              <h2 className="text-3xl font-bold mb-6">

                Generated Resume

              </h2>

              <div className="bg-gray-50 border border-gray-300 rounded-2xl p-8">

                <div className="prose max-w-none">

                  <ReactMarkdown>
                    {generatedResume}
                  </ReactMarkdown>

                </div>

              </div>

              {/* PDF BUTTON */}
              <button
                onClick={
                  handleDownloadPdf
                }
                className="mt-6 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-semibold"
              >

                Download PDF

              </button>

            </div>
          )
        }

        {/* HISTORY */}
        {
          resumeHistory.length > 0 && (

            <div className="bg-white p-10 rounded-3xl shadow-xl mt-10">

              <h2 className="text-3xl font-bold mb-6">

                Resume History

              </h2>

              <div className="space-y-5">

                {
                  resumeHistory.map(
                    (
                      resume,
                      index
                    ) => (

                      <div
                        key={index}
                        className="border border-gray-300 p-5 rounded-2xl"
                      >

                        <p className="font-bold text-lg">

                          Date:
                          {" "}
                          {resume.createdDate}

                        </p>

                        <p className="mt-2 text-gray-600">

                          {
                            resume.jobDescription
                              ?.substring(
                                0,
                                150
                              )
                          }
                          ...

                        </p>

                      </div>
                    )
                  )
                }

              </div>

            </div>
          )
        }

      </div>

    </div>
  );
}

export default Dashboard;