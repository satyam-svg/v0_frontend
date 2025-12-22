'use client'
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import stl from "./TeamRegistration.module.scss";
import toast from "react-hot-toast";
import { endpoints } from "@/store/urls";
import { useRouter } from "next/navigation";
import Image from "next/image";
import CsvFormat from "@public/team-registration-format.png";
import { apiCall } from '@/store/utils';

const TeamRegistrationScreen = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const router = useRouter();

  const sampleCsvData = `Team ID,Team Name,Name of Player,Phone Number,Email,DUPR ID,Gender,Age,Skill Type
T001,Thunder Smash,John Smith,1234567890,john.smith@email.com,DUPR123,Male,28,INTERMEDIATE
T001,Thunder Smash,Sarah Johnson,2345678901,sarah.j@email.com,DUPR124,Female,25,ADVANCED
T002,Lightning Serve,Mike Wilson,,,,,,,
T002,Lightning Serve,Emma Davis,,,,,,,
T003,,David Brown,,,,,,,
T003,,Lisa Anderson,,,,,,,
T004,,James Lee,,,,,,,
T004,,Rachel White,,,,,,,`;

  const downloadTemplate = () => {
    const blob = new Blob([sampleCsvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'team-registration-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const formik = useFormik({
    initialValues: {
      players: null,
      tournamentId: "",
      seasonId: "",
      categoryId: ""
    },
    validationSchema: Yup.object({
      players: Yup.mixed().required("CSV file is required"),
      tournamentId: Yup.string().required("Tournament ID is required"),
      seasonId: Yup.string().required("Season is required"),
      categoryId: Yup.string().required("Category is required"),
    }),
    onSubmit: async (values) => {
      try {
        setErrorMessage("");
        const formData = new FormData();
        formData.append("tournament_id", values.categoryId);
        formData.append("file", values.players);

        setIsSubmitting(true);

        const response = await fetch(endpoints.registerTeams, {
          method: "POST",
          body: formData
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to upload CSV");
        }

        toast.success("Teams and players registered successfully.");
        router.push("/organizer/tournament-set-up");
      } catch (error) {
        console.error("Error:", error.message);
        setErrorMessage(error.message);
        toast.error(error.message || "Failed to upload CSV.");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const fetchTournamentDetails = async (id) => {
    try {
      setLoading(true);
      const response = await apiCall(`${endpoints.getSuperTournamentDetails}/${id}`);
      setTournament(response || null);
      // Clear season and category selection when tournament changes
      formik.setFieldValue('seasonId', '');
      formik.setFieldValue('categoryId', '');
    } catch (error) {
      console.error('Error fetching tournament details:', error);
      toast.error('Failed to fetch tournament details');
      setTournament(null);
      formik.setFieldValue('seasonId', '');
      formik.setFieldValue('categoryId', '');
    } finally {
      setLoading(false);
    }
  };

  // Handle tournament ID input change with debounce
  const handleTournamentChange = (e) => {
    const id = e.target.value.trim();
    formik.handleChange(e);

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    if (id) {
      const newTimeout = setTimeout(() => {
        fetchTournamentDetails(id);
      }, 500);
      setTypingTimeout(newTimeout);
    } else {
      setTournament(null);
      formik.setFieldValue('seasonId', '');
      formik.setFieldValue('categoryId', '');
    }
  };

  // Get categories for selected season
  const getCategories = () => {
    const season = tournament?.seasons?.find(s => s.id.toString() === formik.values.seasonId);
    return season?.tournaments || [];
  };

  return (
    <div className={stl.container}>
      <h2 className={stl.title}>Team Registration</h2>
      <form onSubmit={formik.handleSubmit} className={stl.form}>
        {/* Tournament Selection Section */}
        <div className={`${stl.formSection} ${stl.tournamentSection}`}>
          <div className={stl.formGroup}>
            <label htmlFor="tournamentId">Tournament ID</label>
            <input
              id="tournamentId"
              name="tournamentId"
              type="text"
              onChange={handleTournamentChange}
              onBlur={formik.handleBlur}
              value={formik.values.tournamentId}
              className={stl.input}
              placeholder="Enter Tournament ID"
            />
            {formik.touched.tournamentId && formik.errors.tournamentId && (
              <div className={stl.error}>{formik.errors.tournamentId}</div>
            )}
          </div>

          {loading && <div className={stl.loading}>Loading...</div>}

          {tournament && (
            <div className={stl.tournamentInfo}>
              <p><strong>Tournament Name:</strong> {tournament.name}</p>
              <p><strong>Description:</strong> {tournament.description}</p>
            </div>
          )}

          <div className={stl.formGroup}>
            <label htmlFor="seasonId">Season</label>
            <select
              id="seasonId"
              name="seasonId"
              onChange={(e) => {
                formik.handleChange(e);
                formik.setFieldValue('categoryId', ''); // Clear category when season changes
              }}
              value={formik.values.seasonId}
              className={stl.input}
              disabled={!tournament || loading}
            >
              <option value="">Select Season</option>
              {tournament?.seasons?.map(season => (
                <option key={season.id} value={season.id}>
                  {season.name}
                </option>
              ))}
            </select>
            {formik.touched.seasonId && formik.errors.seasonId && (
              <div className={stl.error}>{formik.errors.seasonId}</div>
            )}
          </div>

          <div className={stl.formGroup}>
            <label htmlFor="categoryId">Category</label>
            <select
              id="categoryId"
              name="categoryId"
              onChange={formik.handleChange}
              value={formik.values.categoryId}
              className={stl.input}
              disabled={!formik.values.seasonId}
            >
              <option value="">Select Category</option>
              {getCategories().map(category => (
                <option key={category.id} value={category.id}>
                  {category.name.split('~')[0]} {/* Show only the category name part */}
                </option>
              ))}
            </select>
            {formik.touched.categoryId && formik.errors.categoryId && (
              <div className={stl.error}>{formik.errors.categoryId}</div>
            )}
          </div>
        </div>

        {/* Reference Image and Template Download */}
        <div className={stl.refImage}>
          <Image src={CsvFormat} alt="ref-image" />
          <h4>Upload CSV in this format</h4>
          <button 
            type="button" 
            onClick={downloadTemplate}
            className={stl.downloadButton}
          >
            Download Template
          </button>
          <p>
            <strong>Note:</strong> The tournament ID should be unique for each team across tournaments.<br />
            So, add underscore tournament id at the end of team id.<br />
            Eg: <strong>JN1_7</strong>
          </p>
        </div>

        {/* File Upload */}
        <div className={stl.formGroup}>
          <label htmlFor="players">Upload Players (CSV)</label>
          <input
            id="players"
            name="players"
            type="file"
            accept=".csv"
            onChange={(event) => {
              formik.setFieldValue("players", event.target.files[0]);
              setErrorMessage(""); // Clear error when new file is selected
            }}
            onBlur={formik.handleBlur}
            className={stl.input}
          />
          {formik.touched.players && formik.errors.players && (
            <div className={stl.error}>{formik.errors.players}</div>
          )}
        </div>

        {/* Error Message Display */}
        {errorMessage && (
          <div className={stl.errorMessage}>
            {errorMessage}
          </div>
        )}

        {/* Submit Button */}
        <button type="submit" className={stl.submitButton} disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
        <button
          type="button"
          className={stl.submitButton}
          style={{ background: "#F28C28" }}
          onClick={() => router.push("/organizer/tournament-set-up")}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default TeamRegistrationScreen;
