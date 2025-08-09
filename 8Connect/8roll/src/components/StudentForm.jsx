// src/components/StudentForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import './StudentForm.css'; // Import the CSS file
export default function StudentForm({ initial = {}, courses = [], onSubmit, onCancel }) {
  const initialRef = useRef(null);
  const [form, setForm] = useState({
    student_id: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    gender: 'Male',
    birth_date: '',
    birth_place: '',
    phone_number: '',
    address: '',
    batch_id: '',
    course_id: '',
    mode: 'update',
    learning_device: '',
    ...initial,
  });
  const [errors, setErrors] = useState({});

  // Only update form when the student_id actually changes
  useEffect(() => {
    const currentStudentId = initial?.student_id;
    if (currentStudentId !== initialRef.current) {
      initialRef.current = currentStudentId;
      setForm(prevForm => ({
        student_id: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        gender: 'Male',
        birth_date: '',
        birth_place: '',
        phone_number: '',
        address: '',
        batch_id: '',
        course_id: '',
        mode: 'update',
        ...initial,
      }));
      setErrors({});
    }
  }, [initial?.student_id]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.first_name?.trim()) {
      newErrors.first_name = 'First name is required';
    }
    
    if (!form.last_name?.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    
    // Course is required for new students or when adding courses
    if ((form.mode === 'addCourse' || !initial?.student_id) && !form.course_id) {
      newErrors.course_id = 'Course selection is required';
    }
    
    // Validate birth date if provided
    if (form.birth_date) {
      const birthDate = new Date(form.birth_date);
      const today = new Date();
      if (birthDate > today) {
        newErrors.birth_date = 'Birth date cannot be in the future';
      }
    }
    
    if (form.phone_number && !/^[\+]?[\d\s\-\(\)]+$/.test(form.phone_number)) {
      newErrors.phone_number = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prevForm => ({ 
      ...prevForm, 
      [name]: value 
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const payload = { ...form };
    
    // Auto-generate student ID if not provided
    if (!payload.student_id) {
      payload.student_id = `STU${Date.now()}`;
    }
    
    onSubmit(payload);
  };

  const isEditing = Boolean(initial?.student_id);

  return (
    <>
      <div className="sf-container">
        <div className="sf-header">
          <h3 className="sf-title">
            {isEditing ? 'Edit Student' : 'Add New Student'}
          </h3>
          {isEditing && (
            <p className="sf-student-id">
              ID: {form.student_id}
            </p>
          )}
        </div>

        <form className="sf-form" onSubmit={handleSubmit}>
          {/* Show mode selector only when editing */}
          {isEditing && (
            <label className="sf-label">
              <span className="sf-label-text">Action</span>
              <select 
                name="mode" 
                value={form.mode} 
                onChange={handleChange}
                className="sf-select"
              >
                <option value="update">Update Student Details</option>
                <option value="addCourse">Add New Course</option>
              </select>
            </label>
          )}

          {/* If updating details, show all fields */}
          {(form.mode === 'update' || !isEditing) && (
            <>
              <fieldset className="sf-fieldset">
                <legend className="sf-legend">
                  Personal Information
                </legend>
                
                <div className="sf-grid-2">
                  <label className="sf-label">
                    <span>First Name <span className="sf-required">*</span></span>
                    <input 
                      name="first_name" 
                      value={form.first_name || ''} 
                      onChange={handleChange}
                      className={`sf-input ${errors.first_name ? 'sf-error' : ''}`}
                      placeholder="Enter first name"
                    />
                    {errors.first_name && <span className="sf-error-text">{errors.first_name}</span>}
                  </label>
                  
                  <label className="sf-label">
                    <span>Last Name <span className="sf-required">*</span></span>
                    <input 
                      name="last_name" 
                      value={form.last_name || ''} 
                      onChange={handleChange}
                      className={`sf-input ${errors.last_name ? 'sf-error' : ''}`}
                      placeholder="Enter last name"
                    />
                    {errors.last_name && <span className="sf-error-text">{errors.last_name}</span>}
                  </label>
                </div>

                <label className="sf-label">
                  <span>Middle Name</span>
                  <input 
                    name="middle_name" 
                    value={form.middle_name || ''} 
                    onChange={handleChange}
                    className="sf-input"
                    placeholder="Enter middle name (optional)"
                  />
                </label>

                <div className="sf-grid-2-no-margin">
                  <label className="sf-label">
                    <span>Birth Date</span>
                    <input 
                      name="birth_date" 
                      type="date"
                      value={form.birth_date || ''} 
                      onChange={handleChange}
                      className={`sf-input ${errors.birth_date ? 'sf-error' : ''}`}
                    />
                    {errors.birth_date && <span className="sf-error-text">{errors.birth_date}</span>}
                    <small className="sf-help-text">
                      Age will be calculated automatically from birth date
                    </small>
                  </label>

                  <label className="sf-label">
                    <span>Gender</span>
                    <select 
                      name="gender" 
                      value={form.gender || 'Male'} 
                      onChange={handleChange}
                      className="sf-select"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </label>
                </div>

                <label className="sf-label">
                  <span>Birth Place</span>
                  <input 
                    name="birth_place" 
                    value={form.birth_place || ''} 
                    onChange={handleChange}
                    className="sf-input"
                    placeholder="Enter birth place"
                  />
                </label>
              </fieldset>

              <fieldset className="sf-fieldset">
                <legend className="sf-legend">
                  Contact Information
                </legend>

                <label className="sf-label">
                  <span>Phone Number</span>
                  <input 
                    name="phone_number" 
                    type="tel"
                    value={form.phone_number || ''} 
                    onChange={handleChange}
                    className={`sf-input ${errors.phone_number ? 'sf-error' : ''}`}
                    placeholder="Enter phone number"
                  />
                  {errors.phone_number && <span className="sf-error-text">{errors.phone_number}</span>}
                </label>

                <label className="sf-label">
                  <span>Address</span>
                  <textarea 
                    name="address" 
                    value={form.address || ''} 
                    onChange={handleChange}
                    className="sf-textarea"
                    placeholder="Enter complete address"
                    rows="3"
                  />
                </label>
              </fieldset>

              <fieldset className="sf-fieldset">
                <legend className="sf-legend">
                  Academic Information
                </legend>

                <label className="sf-label">
                  <span>Learning Device</span>
                  <select 
                    name="learning_device" 
                    value={form.learning_device} 
                    onChange={handleChange}
                    className="sf-select"
                  >
                    <option value="Mobile Phone">Mobile Phone</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Desktop">Desktop</option>
                  </select>
                </label>

                <label className="sf-label">
                  <span>Batch ID</span>
                  <input 
                    name="batch_id" 
                    value={form.batch_id || ''} 
                    onChange={handleChange}
                    className="sf-input"
                    placeholder="Enter batch ID (optional)"
                  />
                </label>
              </fieldset>
            </>
          )}

          {/* Course selection (always required when adding a course or for new students) */}
          {(form.mode === 'addCourse' || !isEditing) && (
            <fieldset className="sf-fieldset">
              <legend className="sf-legend">
                Course Enrollment
              </legend>
              
              <label className="sf-label">
                <span>
                  Course <span className="sf-required">*</span>
                </span>
                <select 
                  name="course_id" 
                  value={form.course_id || ''} 
                  onChange={handleChange}
                  className={`sf-select ${errors.course_id ? 'sf-error' : ''}`}
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course.course_id} value={course.course_id}>
                      {course.course_name}
                    </option>
                  ))}
                </select>
                {errors.course_id && <span className="sf-error-text">{errors.course_id}</span>}
              </label>
            </fieldset>
          )}

          {/* Form Actions */}
          <div className="sf-actions">
            {onCancel && (
              <button 
                type="button" 
                onClick={onCancel}
                className="sf-btn sf-btn-cancel"
              >
                Cancel
              </button>
            )}
            
            <button 
              type="submit"
              className="sf-btn sf-btn-submit"
            >
              {isEditing 
                ? (form.mode === 'addCourse' ? 'Add Course' : 'Update Student')
                : 'Add Student'
              }
            </button>
          </div>
        </form>
      </div>
    </>
  );
}