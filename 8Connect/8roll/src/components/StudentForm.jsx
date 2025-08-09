// src/components/StudentForm.jsx
import React, { useState, useEffect, useRef } from 'react';

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

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    marginTop: '4px',
    transition: 'border-color 0.2s, box-shadow 0.2s'
  };

  const errorInputStyle = {
    ...inputStyle,
    borderColor: '#dc3545'
  };

  const focusInputStyle = {
    ...inputStyle,
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
  };

  const labelStyle = {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
    marginBottom: '16px'
  };

  const errorStyle = {
    color: '#dc3545',
    fontSize: '12px',
    marginTop: '4px'
  };

  const isEditing = Boolean(initial?.student_id);

  return (
    <div style={{ maxWidth: '700px', padding: '24px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #e9ecef' }}>
        <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '24px' }}>
          {isEditing ? 'Edit Student' : 'Add New Student'}
        </h3>
        {isEditing && (
          <p style={{ margin: '8px 0 0 0', color: '#6c757d', fontSize: '14px', fontFamily: 'monospace' }}>
            ID: {form.student_id}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Show mode selector only when editing */}
        {isEditing && (
          <label style={labelStyle}>
            <span style={{ fontWeight: '600', color: '#495057' }}>Action</span>
            <select 
              name="mode" 
              value={form.mode} 
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="update">Update Student Details</option>
              <option value="addCourse">Add New Course</option>
            </select>
          </label>
        )}

        {/* If updating details, show all fields */}
        {(form.mode === 'update' || !isEditing) && (
          <>
            <fieldset style={{ border: '1px solid #dee2e6', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <legend style={{ fontWeight: '600', color: '#495057', fontSize: '16px', padding: '0 8px' }}>
                Personal Information
              </legend>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
                <label style={labelStyle}>
                  <span>First Name <span style={{ color: '#dc3545' }}>*</span></span>
                  <input 
                    name="first_name" 
                    value={form.first_name || ''} 
                    onChange={handleChange}
                    style={errors.first_name ? errorInputStyle : inputStyle}
                    placeholder="Enter first name"
                  />
                  {errors.first_name && <span style={errorStyle}>{errors.first_name}</span>}
                </label>

                <label style={labelStyle}>
                  <span>Last Name <span style={{ color: '#dc3545' }}>*</span></span>
                  <input 
                    name="last_name" 
                    value={form.last_name || ''} 
                    onChange={handleChange}
                    style={errors.last_name ? errorInputStyle : inputStyle}
                    placeholder="Enter last name"
                  />
                  {errors.last_name && <span style={errorStyle}>{errors.last_name}</span>}
                </label>
              </div>

              <label style={labelStyle}>
                <span>Middle Name</span>
                <input 
                  name="middle_name" 
                  value={form.middle_name || ''} 
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="Enter middle name (optional)"
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <label style={labelStyle}>
                  <span>Birth Date</span>
                  <input 
                    name="birth_date" 
                    type="date"
                    value={form.birth_date || ''} 
                    onChange={handleChange}
                    style={errors.birth_date ? errorInputStyle : inputStyle}
                  />
                  {errors.birth_date && <span style={errorStyle}>{errors.birth_date}</span>}
                  <small style={{ color: '#6c757d', fontSize: '12px', marginTop: '4px' }}>
                    Age will be calculated automatically from birth date
                  </small>
                </label>

                <label style={labelStyle}>
                  <span>Gender</span>
                  <select 
                    name="gender" 
                    value={form.gender || 'Male'} 
                    onChange={handleChange}
                    style={inputStyle}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </label>
              </div>

              <label style={labelStyle}>
                <span>Birth Place</span>
                <input 
                  name="birth_place" 
                  value={form.birth_place || ''} 
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="Enter birth place"
                />
              </label>
            </fieldset>

            <fieldset style={{ border: '1px solid #dee2e6', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <legend style={{ fontWeight: '600', color: '#495057', fontSize: '16px', padding: '0 8px' }}>
                Contact Information
              </legend>

              <label style={labelStyle}>
                <span>Phone Number</span>
                <input 
                  name="phone_number" 
                  type="tel"
                  value={form.phone_number || ''} 
                  onChange={handleChange}
                  style={errors.phone_number ? errorInputStyle : inputStyle}
                  placeholder="Enter phone number"
                />
                {errors.phone_number && <span style={errorStyle}>{errors.phone_number}</span>}
              </label>

              <label style={labelStyle}>
                <span>Address</span>
                <textarea 
                  name="address" 
                  value={form.address || ''} 
                  onChange={handleChange}
                  style={{ 
                    ...inputStyle, 
                    minHeight: '80px', 
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  placeholder="Enter complete address"
                  rows="3"
                />
              </label>
            </fieldset>
                  
            <fieldset style={{ border: '1px solid #dee2e6', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <legend style={{ fontWeight: '600', color: '#495057', fontSize: '16px', padding: '0 8px' }}>
                Academic Information
              </legend>
                  <label style={labelStyle}>
                  <span>Learning Device</span>
                  <select 
                    name="learning_device" 
                    value={form.learning_device} 
                    onChange={handleChange}
                    style={inputStyle}
                  >
                    <option value="Mobile Phone">Mobile Phone</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Desktop">Desktop</option>
                  </select>
                </label>


              <label style={labelStyle}>
                <span>Batch ID</span>
                <input 
                  name="batch_id" 
                  value={form.batch_id || ''} 
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="Enter batch ID (optional)"
                />
              </label>
            </fieldset>
          </>
        )}

        {/* Course selection (always required when adding a course or for new students) */}
        {(form.mode === 'addCourse' || !isEditing) && (
          <fieldset style={{ border: '1px solid #dee2e6', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
            <legend style={{ fontWeight: '600', color: '#495057', fontSize: '16px', padding: '0 8px' }}>
              Course Enrollment
            </legend>
            
            <label style={labelStyle}>
              <span>
                Course <span style={{ color: '#dc3545' }}>*</span>
              </span>
              <select 
                name="course_id" 
                value={form.course_id || ''} 
                onChange={handleChange}
                style={errors.course_id ? errorInputStyle : inputStyle}
              >
                <option value="">Select a course</option>
                {courses.map(course => (
                  <option key={course.course_id} value={course.course_id}>
                    {course.course_name}
                  </option>
                ))}
              </select>
              {errors.course_id && <span style={errorStyle}>{errors.course_id}</span>}
            </label>
          </fieldset>
        )}

        {/* Form Actions */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'flex-end',
          paddingTop: '16px',
          borderTop: '1px solid #e9ecef'
        }}>
          {onCancel && (
            <button 
              type="button" 
              onClick={onCancel}
              style={{
                padding: '12px 24px',
                border: '1px solid #6c757d',
                borderRadius: '6px',
                backgroundColor: 'white',
                color: '#6c757d',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#6c757d';
                e.target.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.color = '#6c757d';
              }}
            >
              Cancel
            </button>
          )}
          
          <button 
            type="submit"
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#007bff',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#0056b3';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#007bff';
            }}
          >
            {isEditing 
              ? (form.mode === 'addCourse' ? 'Add Course' : 'Update Student')
              : 'Add Student'
            }
          </button>
        </div>
      </form>
    </div>
  );
}