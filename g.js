"use client"

import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
// import Logo from "../../public/logo.png";

export default function InternshipPortal() {
  const [step, setStep] = useState(1);
  const [resumeText, setResumeText] = useState("");
  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState("");
  const [text, setText] = useState("");

 

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type.startsWith("image/")) {
      // Handle profile picture preview
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    } else if (file.type === "application/pdf") {
      // Handle resume upload
      setFormData((prev) => ({ ...prev, resume: file }));

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/parse-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.text) {
        setResumeText(data.text);
      } else {
        alert("Error parsing PDF");
      }
    }
  };




  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    phone: "",
    address: "",
    email: "",
    university: "",
    period: "",
    domain: "",
    department: "",
    gender: "",
    emergencyContact: "",
    linkedin: "",
    profilePic: null,
    resume: null,
  });

  const universities = ["Karachi University", "IBA Karachi", "NED University", "FAST Karachi", "SZABIST Karachi"];
  const domains = ["AI", "Machine Learning", "Web Development", "Mobile Development", "Data Science"];
  const departments = ["Computer Science", "Software Engineering", "Information Technology", "Data Engineering"];

  const particlesConfig = {
    particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: { value: ["#4F46E5", "#10B981", "#EF4444"] },
      shape: { type: "circle" },
      opacity: { value: 0.7 },
      size: { value: 3 },
      links: {
        enable: true,
        distance: 150,
        color: "#ffffff",
        opacity: 0.4,
        width: 1
      },
      move: {
        enable: true,
        speed: 3, // Default speed
        direction: "none",
        random: false,
        straight: false,
        out_mode: "out",
        bounce: false,
      }
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: { enable: true, mode: "repulse" }, // Repulse effect when hovered
        onclick: { enable: true, mode: "push" },
        resize: true
      },
      modes: {
        grab: { distance: 200, links: { opacity: 1 } },
        repulse: { distance: 100, duration: 0.4 }, // Moves particles away on hover
        push: { particles_nb: 4 }
      }
    },
    retina_detect: true
  };

  useEffect(() => {
    const initializeParticles = () => {
      if (typeof window !== "undefined" && window.particlesJS) {
        window.particlesJS("particles-js", particlesConfig);
      }
    };

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js";
    script.async = true;
    script.onload = initializeParticles;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
      const particlesContainer = document.getElementById("particles-js");
      if (particlesContainer) particlesContainer.innerHTML = "";
    };
  }, []);


  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpeg', '.png']
    },
    onDrop: async ([file]) => {
      if (!file) return;

      if (file.type.startsWith("image/")) {
        const imageUrl = URL.createObjectURL(file);
        setPreviewImage(imageUrl);
        setFormData(prev => ({ ...prev, profilePic: file }));
      } 
      else if (file.type === "application/pdf") {
        const formData = new FormData();
        formData.append("file", file);

        try {
          const response = await fetch("/api/parse-pdf", {
            method: "POST",
            body: formData,
          });
          
          const data = await response.json();
          if (data.text) {
            setResumeText(data.text);
            setFormData(prev => ({ ...prev, resume: file }));
          }
        } catch (error) {
          alert("Error parsing PDF");
        }
      }
    }
  });

  const readPdf = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const data = await pdfParse(buffer);
    return data.text;
  };

  const validateStep = () => {
    let errors = {};
    if (step === 1) {
      if (!formData.firstName) errors.firstName = "First Name is required";
      if (!formData.email.match(/^[\w-]+@[\w-]+\.[\w-]+$/)) errors.email = "Invalid email";
      if (!formData.phone.match(/^\d{11}$/)) errors.phone = "Invalid phone number";
    }
    if (step === 2) {
      if (!formData.university) errors.university = "University selection is required";
      if (!formData.domain) errors.domain = "Domain is required";
    }
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep(prev => Math.min(prev + 1, 3));
  };

  const handleSubmit = async () => {
    try {
      // Convert form data to FormData
      const data = new FormData();
      
      // Append all fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          data.append(key, value, value.name);
        } else if (value !== null && value !== undefined) {
          data.append(key, value);
        }
      });
  
      // Submit to backend
      const response = await fetch('http://localhost:5000/api/save-intern', {
        method: 'POST',
        body: data,
      });
  
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Submission failed');
      }
  
      alert(result.message || "Application Submitted Successfully!");
      
      // Reset form after successful submission
      setFormData({
        firstName: "",
        lastName: "",
        // ... reset all other fields
      });
      setStep(1);
      setPreviewImage("");
      setResumeText("");
  
    } catch (error) {
      console.error('Submission error:', error);
      alert(error.message || "Error submitting application");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      <div id="particles-js" className="absolute inset-0 pointer-events-none" />
      
      <div className="relative z-10 flex justify-center items-center min-h-screen">
        <div className="w-full max-w-4xl bg-gray-800 bg-opacity-90 backdrop-blur-lg p-8 rounded-xl shadow-2xl mx-4 my-8">
        <div className="flex justify-between  content-center">
            <div className=" w-20 h-16 bg-gray-700 rounded-lg flex items-center justify-center text-sm mb-8">
            <Image width={200} height={200} src={"/ncailogo.png"} alt="Profile Preview"  className="rounded-2xl"/>
            </div>
            <h1 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            NCAI INTERNSHIP PORTAL
          </h1>
          </div>
          


          <div className="space-y-6">
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    name="firstName"
                    placeholder="First Name *"
                    className="w-full p-3 bg-gray-700 rounded-lg"
                    onChange={handleChange}
                  />
                  {errors.firstName && <span className="text-red-400 text-sm">{errors.firstName}</span>}
                </div>
                <input
                  name="lastName"
                  placeholder="Last Name"
                  className="w-full p-3 bg-gray-700 rounded-lg"
                  onChange={handleChange}
                />
               
                <div>
                  <input
                    name="phone"
                    placeholder="Phone Number *"
                    className="w-full p-3 bg-gray-700 rounded-lg"
                    onChange={handleChange}
                  />
                  {errors.phone && <span className="text-red-400 text-sm">{errors.phone}</span>}
                </div>
                <input
                  name="address"
                  placeholder="Address"
                  className="w-full p-3 bg-gray-700 rounded-lg"
                  onChange={handleChange}
                />
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email *"
                    className="w-full p-3 bg-gray-700 rounded-lg"
                    onChange={handleChange}
                  />
                  {errors.email && <span className="text-red-400 text-sm">{errors.email}</span>}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <select
                    name="university"
                    className="w-full p-3 bg-gray-700 rounded-lg"
                    onChange={handleChange}
                  >
                    <option value="">Select University *</option>
                    {universities.map(uni => (
                      <option key={uni} value={uni}>{uni}</option>
                    ))}
                  </select>
                  {errors.university && <span className="text-red-400 text-sm">{errors.university}</span>}
                </div>
                <input
                  type="date"
                  name="period"
                  placeholder="Internship Period (e.g., 3 months)"
                  className="w-full p-3 bg-gray-700 rounded-lg"
                  onChange={handleChange}
                />
                <div>
                  <select
                    name="domain"
                    className="w-full p-3 bg-gray-700 rounded-lg"
                    onChange={handleChange}
                  >
                    <option value="">Select Domain *</option>
                    {domains.map(domain => (
                      <option key={domain} value={domain}>{domain}</option>
                    ))}
                  </select>
                  {errors.domain && <span className="text-red-400 text-sm">{errors.domain}</span>}
                </div>
                <select
                  name="department"
                  className="w-full p-3 bg-gray-700 rounded-lg"
                  onChange={handleChange}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <input
                  name="linkedin"
                  placeholder="LinkedIn Profile URL"
                  className="w-full p-3 bg-gray-700 rounded-lg"
                  onChange={handleChange}
                />
               
              </div>
            )}

            {step === 3 && (
             <div className="space-y-4">
             <div {...getRootProps()} className="border-2 border-dashed border-gray-600 p-8 text-center rounded-lg cursor-pointer">
               <input {...getInputProps()} />
               <p>Drag & drop profile picture and resume here, or click to select</p>
       
               {previewImage && (
                 <Image width={200} height={200} src={previewImage} alt="Profile Preview" className="mt-4 w-32 h-32 rounded-full mx-auto" />
               )}
               {formData.resume && (
                 <p className="mt-2 text-green-400">Resume uploaded: {formData.resume.name}</p>
               )}
             </div>
       
             {resumeText && (
               <div className="bg-gray-700 p-4 rounded-lg max-h-40 overflow-y-auto">
                 <h3 className="font-bold mb-2">Resume Preview:</h3>
                 <p className="text-sm opacity-75">{resumeText.substring(0, 500)}...</p>
               </div>
             )}
       
             <div className="grid grid-cols-2 gap-4">
               <div className="bg-gray-700 p-4 rounded-lg">
                 <h3 className="font-bold mb-2">Personal Information</h3>
                 <p>{formData.firstName} {formData.lastName}</p>
                 <p>{formData.email}</p>
                 <p>{formData.phone}</p>
               </div>
               <div className="bg-gray-700 p-4 rounded-lg">
                 <h3 className="font-bold mb-2">Education Information</h3>
                 <p>{formData.university}</p>
                 <p>{formData.department}</p>
                 <p>{formData.domain}</p>
               </div>
             </div>
           </div>
            )}

<div className="flex items-center justify-between w-full mt-8 space-x-4">
  {/* Back Button */}
  {step > 1 ? (
    <button 
      onClick={() => setStep(prev => prev - 1)}
      className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition"
    >
      Back
    </button>
  ) : (
    <div className="w-24" />  // Placeholder to keep layout balanced
  )}

  {/* Step Indicators */}
  <div className="flex space-x-3">
    {[1, 2, 3].map(num => (
      <button
        key={num}
        onClick={() => setStep(num)}
        className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition
          ${step === num ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300"}
          ${step > num ? "bg-green-500 text-white" : ""}`}
      >
        {num}
      </button>
    ))}
  </div>

  {/* Next / Submit Button */}
  {step < 3 ? (
    <button
      onClick={handleNext}
      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
    >
      Next
    </button>
  ) : (
    <button
      onClick={handleSubmit}
      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition"
    >
      Submit Application
    </button>
  )}
</div>


          </div>
        </div>
      </div>
    </div>
  );
}