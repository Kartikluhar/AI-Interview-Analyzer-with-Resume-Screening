import { useState } from "react";
import { motion } from "framer-motion";
import {
  UploadCloud,
  FileText,
  BrainCircuit,
} from "lucide-react";
import toast from "react-hot-toast";
import API from "../services/api";

function UploadResume() {
  const [title, setTitle] = useState("");
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!title) {
      toast.error("Enter resume title");
      return;
    }

    if (!resume) {
      toast.error("Select resume file");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("title", title);
      formData.append("file", resume);
      formData.append(
        "user",
        localStorage.getItem("user_id")
      );

      const token =
        localStorage.getItem("access");

      await API.post("/resumes/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(
        "Resume uploaded successfully"
      );

      setTitle("");
      setResume(null);
    } catch (error) {
      console.log(error);
      console.log(error.response);
      console.log(error.response.data);
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-6 px-4">
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{ duration: 0.5 }}
        className="
        w-full
        max-w-xl
        glass-card
        rounded-[24px]
        p-6
        md:p-10
        shadow-2xl"
      >
        <div className="flex justify-center mb-6">
          <div className="p-3.5 rounded-2xl bg-accent/10 border border-accent/20">
            <BrainCircuit
              size={48}
              className="text-accent"
            />
          </div>
        </div>

        <h1
          className="
          text-white
          text-3xl
          font-extrabold
          text-center
          tracking-tight"
        >
          Upload Resume
        </h1>

        <p
          className="
          text-center
          text-secondary-text
          mt-2
          font-medium"
        >
          Smart AI Resume Screening & ATS Scoring
        </p>

        <div className="mt-8 space-y-6">
          <div>
            <label className="text-xs text-secondary-text font-semibold uppercase tracking-wider block mb-2 ml-1">
              Resume Title
            </label>

            <input
              type="text"
              placeholder="e.g. Senior Frontend Developer Resume"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              className="
              w-full
              p-4
              rounded-2xl
              glass-input
              text-white
              placeholder-secondary-text
              focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-secondary-text font-semibold uppercase tracking-wider block mb-2 ml-1">
              Upload Resume
            </label>

            <label
              className="
              cursor-pointer
              flex
              flex-col
              items-center
              justify-center
              border-2
              border-dashed
              border-accent/30
              bg-primary-bg/50
              rounded-2xl
              h-56
              hover:border-accent
              hover:bg-white/5
              transition-all
              duration-300"
            >
              <UploadCloud
                size={48}
                className="text-accent"
              />

              <span className="text-white font-semibold mt-3">
                Click or drag file to upload
              </span>

              <span className="text-xs text-secondary-text mt-1.5 font-medium">
                Supports PDF, DOCX or DOC (Max 5MB)
              </span>

              <input
                hidden
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) =>
                  setResume(
                    e.target.files[0]
                  )
                }
              />
            </label>
          </div>

          {resume && (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95
              }}
              animate={{
                opacity: 1,
                scale: 1
              }}
              className="
              flex
              items-center
              gap-3
              bg-white/5
              border
              border-border-custom
              p-4
              rounded-2xl"
            >
              <div className="p-2 bg-success/15 border border-success/20 rounded-xl text-success">
                <FileText size={20} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {resume.name}
                </p>

                <p className="text-secondary-text text-xs font-semibold mt-0.5">
                  {(
                    resume.size /
                    1024 /
                    1024
                  ).toFixed(2)}{" "}
                  MB
                </p>
              </div>
            </motion.div>
          )}

          <div className="pt-2">
            <motion.button
              whileHover={!loading ? {
                scale: 1.02,
                y: -1
              } : {}}
              whileTap={!loading ? {
                scale: 0.98,
              } : {}}
              onClick={handleUpload}
              disabled={loading}
              className="
              w-full
              py-4
              rounded-2xl
              font-semibold
              text-white
              bg-gradient-to-r
              from-accent
              to-accent-hover
              shadow-lg
              shadow-accent/20
              disabled:opacity-50
              disabled:cursor-not-allowed
              cursor-pointer
              transition-all"
            >
              {loading
                ? "Uploading..."
                : "Upload Resume"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default UploadResume;