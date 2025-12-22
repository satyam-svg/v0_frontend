'use client'
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import stl from "./AddTournament.module.scss";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { endpoints } from "@/store/urls";
import { Dialog } from "@mui/material";
import { apiCall } from '@/store/utils';

const AddTournament = () => {
  const [open, setOpen] = useState(false);
  const [newTid, setNewTid] = useState(null);
  const router = useRouter();
  const [superTournament, setSuperTournament] = useState(null);
  const [loading, setLoading] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const formik = useFormik({
    initialValues: {
      superTournamentId: '',
      seasonId: '',
      name: "",
      location: "",
      format: "singles",
      type: "elimination",
      numberOfCourts: 1,
      generateRegistrationLink: false,
    },
    validationSchema: Yup.object({
      superTournamentId: Yup.string().required("Tournament ID is required"),
      seasonId: Yup.string().required("Season is required"),
      name: Yup.string().required("Category name is required"),
      location: Yup.string().required("Category location is required"),
      numberOfCourts: Yup.number()
        .required("Number of courts is required")
        .min(1, "At least one court is required")
        .max(50, "Maximum 50 courts allowed")
        .integer("Number of courts must be a whole number"),
    }),
    onSubmit: async (values) => {
      try {
        const reqbody = {
          name: `${values.name}~${values.location}~${values.format}`,
          type: values.type,
          season_id: parseInt(values.seasonId),
          num_courts: parseInt(values.numberOfCourts)
        };

        const response = await apiCall(endpoints.createTournament, {
          method: "POST",
          body: reqbody
        });

        if (response.tournament_id) {
          toast.success("Tournament created successfully");
          setOpen(true);
          setNewTid(response.tournament_id);
        } else {
          throw new Error("Failed to add tournament");
        }
      } catch (error) {
        console.error("Failed to add tournament:", error);
        toast.error(error.message || "Failed to add tournament");
      }
    },
  });

  const fetchSuperTournamentDetails = async (id) => {
    try {
      setLoading(true);
      const response = await apiCall(`${endpoints.getSuperTournamentDetails}/${id}`);
      setSuperTournament(response || null);
    } catch (error) {
      console.error('Error fetching super tournament details:', error);
      toast.error('Failed to fetch super tournament details');
      setSuperTournament(null);
      formik.setFieldValue('seasonId', '');
    } finally {
      setLoading(false);
    }
  };

  // Handle super tournament ID input change with debounce
  const handleSuperTournamentChange = (e) => {
    const id = e.target.value.trim();
    formik.handleChange(e);

    // Clear previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    if (id) {
      // Set new timeout
      const newTimeout = setTimeout(() => {
        fetchSuperTournamentDetails(id);
      }, 500); // 500ms delay
      setTypingTimeout(newTimeout);
    } else {
      setSuperTournament(null);
      formik.setFieldValue('seasonId', '');
    }
  };

  const handleClose = () => {
    setOpen(false);
    router.push("/organizer/tournament-set-up");
  };

  const getRegistrationLink = () => {
    const hostname = window.location.origin;
    return `${hostname}/player/register?tournament=${newTid}`;
  };

  return (
    <div className={stl.container}>
      {open && (
        <Dialog open={open} onClose={handleClose}>
          <div className={stl.dialogContent}>
            <h3>Category Created Successfully!</h3>
            <div className={stl.tournamentInfo}>
              <p><strong>Category ID:</strong> {newTid}</p>
              {formik.values.generateRegistrationLink && (
                <div className={stl.registrationInfo}>
                  <p><strong>Player Registration Link:</strong></p>
                  <div className={stl.linkBox}>
                    {getRegistrationLink()}
                  </div>
                </div>
              )}
            </div>
            <button 
              onClick={handleClose}
              className={stl.doneButton}
            >
              Done
            </button>
          </div>
        </Dialog>
      )}

      <h2>CREATE CATEGORY</h2>
      <form onSubmit={formik.handleSubmit} className={stl.form}>
        {/* Tournament Section */}
        <div className={`${stl.formSection} ${stl.superTournamentSection}`}>
          <div className={stl.formGroup}>
            <label htmlFor="superTournamentId">Tournament ID</label>
            <input
              id="superTournamentId"
              name="superTournamentId"
              type="text"
              onChange={handleSuperTournamentChange}
              onBlur={formik.handleBlur}
              value={formik.values.superTournamentId}
              className={stl.input}
              placeholder="Enter Tournament ID"
            />
            {formik.touched.superTournamentId && formik.errors.superTournamentId && (
              <div className={stl.error}>{formik.errors.superTournamentId}</div>
            )}
          </div>

          {loading && <div className={stl.loading}>Loading...</div>}

          {superTournament && (
            <div className={stl.superTournamentInfo}>
              <p><strong>Tournament Name:</strong> {superTournament.name}</p>
              <p><strong>Description:</strong> {superTournament.description}</p>
            </div>
          )}

          <div className={stl.formGroup}>
            <label htmlFor="seasonId">Season</label>
            <select
              id="seasonId"
              name="seasonId"
              onChange={formik.handleChange}
              value={formik.values.seasonId}
              className={stl.input}
              disabled={!superTournament || loading}
            >
              <option value="">Select Season</option>
              {superTournament?.seasons?.map(season => (
                <option key={season.id} value={season.id}>
                  {season.name}
                </option>
              ))}
            </select>
            {formik.touched.seasonId && formik.errors.seasonId && (
              <div className={stl.error}>{formik.errors.seasonId}</div>
            )}
          </div>
        </div>

        {/* Category Details */}
        <div className={stl.formGroup}>
          <label htmlFor="name">Category Name</label>
          <input
            id="name"
            name="name"
            type="text"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.name}
            className={stl.input}
          />
          {formik.touched.name && formik.errors.name && (
            <div className={stl.error}>{formik.errors.name}</div>
          )}
        </div>

        {/* Location field - updated label */}
        <div className={stl.formGroup}>
          <label htmlFor="location">Category Location</label>
          <input
            id="location"
            name="location"
            type="text"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.location}
            className={stl.input}
          />
          {formik.touched.location && formik.errors.location && (
            <div className={stl.error}>{formik.errors.location}</div>
          )}
        </div>

        {/* Number of Courts */}
        <div className={stl.formGroup}>
          <label htmlFor="numberOfCourts">Number of Courts</label>
          <input
            id="numberOfCourts"
            name="numberOfCourts"
            type="number"
            min="1"
            max="50"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.numberOfCourts}
            className={stl.input}
          />
          {formik.touched.numberOfCourts && formik.errors.numberOfCourts && (
            <div className={stl.error}>{formik.errors.numberOfCourts}</div>
          )}
        </div>

        {/* Format Radio Buttons */}
        <div className={stl.formGroup}>
          <label>Type</label>
          <div className={stl.radioGroup}>
            <label>
              <input
                type="radio"
                name="type"
                value="elimination"
                checked={formik.values.type === "elimination"}
                onChange={formik.handleChange}
              />
              Elimination
            </label>
            <label>
              <input
                type="radio"
                name="type"
                value="regular"
                checked={formik.values.type === "regular"}
                onChange={formik.handleChange}
              />
              Regular
            </label>
          </div>
        </div>

        {/* Type Radio Buttons */}
        <div className={stl.formGroup}>
          <label>Format</label>
          <div className={stl.radioGroup}>
            <label>
              <input
                type="radio"
                name="format"
                value="singles"
                checked={formik.values.format === "singles"}
                onChange={formik.handleChange}
              />
              Singles
            </label>
            <label>
              <input
                type="radio"
                name="format"
                value="doubles"
                checked={formik.values.format === "doubles"}
                onChange={formik.handleChange}
              />
              Doubles
            </label>
          </div>
        </div>

        {/* Add this new checkbox before the submit button */}
        <div className={stl.formGroup}>
          <label className={stl.checkboxLabel}>
            <input
              type="checkbox"
              name="generateRegistrationLink"
              checked={formik.values.generateRegistrationLink}
              onChange={formik.handleChange}
            />
            Generate Player Registration Link
          </label>
        </div>

        {/* Submit Button */}
        <button type="submit" className={stl.submitButton}>
          Add
        </button>
        <button 
          className={stl.submitButton}
          style={{ background: "#F28C28", marginTop: '1rem' }}
          onClick={() => router.push("/organizer/tournament-set-up")}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default AddTournament;
