import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { eventsData } from "../utils/eventsData";

const schema = yup.object().shape({
    name: yup.string().required("Full Name is required").min(3, "Name must be at least 3 characters"),
    email: yup.string().email("Invalid email").required("Email is required"),
    phone: yup.string().matches(/^[0-9]{10}$/, "Phone number must be 10 digits").required("Phone is required"),
    college: yup.string().required("College Name is required"),
    participantCount: yup.number().typeError("Count must be a number").min(1, "At least 1 participant").required("Required"),
    amount: yup.number().typeError("Amount must be a number").min(0, "Invalid amount").required("Required"),
    paymentMethod: yup.string().required("Select payment method"),
    transactionId: yup.string().when('paymentMethod', {
        is: (val) => val === 'UPI' || val === 'Cheque',
        then: (schema) => schema.required("Transaction/Cheque ID is required"),
        otherwise: (schema) => schema.notRequired()
    }),
    events: yup.array().min(1, "Select at least one event").required("Select at least one event"),
});

export default function RegistrationPage() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [conflictError, setConflictError] = useState(null);

    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            events: [],
            participantCount: 1,
            paymentMethod: "Cash",
            amount: 0
        }
    });

    const paymentMethodValue = watch("paymentMethod");
    const selectedEvents = watch("events");

    useEffect(() => {
        let total = 0;
        const timeSlots = new Set();
        let conflictMsg = null;

        if (selectedEvents && selectedEvents.length > 0) {
            // Helper to get raw event object
            const findEvent = (name) => {
                for (const cat in eventsData) {
                    const found = eventsData[cat].find(e => e.name === name);
                    if (found) return found;
                }
                return null;
            };

            for (const evName of selectedEvents) {
                const evt = findEvent(evName);
                if (evt) {
                    total += (evt.price || 0);

                    // Simple conflict check: Same Date + Same Time String
                    const slotKey = `${evt.date}||${evt.time}`;

                    if (timeSlots.has(slotKey)) {
                        conflictMsg = `Schedule Conflict: Multiple events selected on ${evt.date} at ${evt.time}. Please select only one.`;
                    } else {
                        timeSlots.add(slotKey);
                    }
                }
            }
        }
        setValue("amount", total);
        setConflictError(conflictMsg);
    }, [selectedEvents, setValue]);

    const currentDate = new Date().toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric'
    });

    const toggleCategory = (category) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const onSubmit = async (data) => {
        if (conflictError) return; // Prevent submission if conflict exists

        setIsSubmitting(true);
        try {
            // Transform events array of strings to array of objects with details
            const selectedEventsDetails = [];

            // Loop through all category data to find matches
            Object.entries(eventsData).forEach(([category, catEvents]) => {
                catEvents.forEach(evt => {
                    if (data.events.includes(evt.name)) {
                        selectedEventsDetails.push({
                            name: evt.name,
                            date: evt.date,
                            time: evt.time,
                            category: category, // 'Wing'
                            price: evt.price || 0
                        });
                    }
                });
            });

            const payload = {
                name: data.name,
                email: data.email,
                phone: data.phone,
                college: data.college,
                events: selectedEventsDetails,
                participantCount: data.participantCount,
                payment: {
                    amount: data.amount,
                    method: data.paymentMethod,
                    transactionId: data.transactionId
                },
                registrationDateFormatted: currentDate
            };

            const BACKEND_URL = "http://localhost:3000";
            const response = await axios.post(`${BACKEND_URL}/api/register`, payload);

            // Use the data returned from backend (which includes _id)
            navigate("/success", { state: { data: response.data.data } });

        } catch (error) {
            console.error("Registration failed:", error);
            alert("Registration failed. Please try again. " + (error.response?.data?.message || error.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="page-container">
            <div className="card" style={{ maxWidth: '800px' }}>
                <div className="header">
                    <h1>INFERNO'26</h1>
                    <p style={{ color: '#888' }}>SDJ International College</p>
                    <div style={{
                        marginTop: '10px',
                        padding: '5px 15px',
                        background: '#2a2a2a',
                        borderRadius: '20px',
                        display: 'inline-block',
                        fontSize: '0.9rem',
                        border: '1px solid #444'
                    }}>
                        Date: <span style={{ color: '#ff4500', fontWeight: 'bold' }}>{currentDate}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <h3 style={{ color: '#ff8c00', marginBottom: '15px', borderBottom: '1px solid #333', paddingBottom: '5px' }}>Participant Details</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                        <div>
                            <input placeholder="Full Name" {...register("name")} />
                            {errors.name && <span className="error-msg">{errors.name.message}</span>}
                        </div>

                        <div>
                            <input placeholder="College / Institute Name" {...register("college")} />
                            {errors.college && <span className="error-msg">{errors.college.message}</span>}
                        </div>

                        <div>
                            <input placeholder="Phone Number" {...register("phone")} />
                            {errors.phone && <span className="error-msg">{errors.phone.message}</span>}
                        </div>

                        <div>
                            <input placeholder="Email Address" {...register("email")} />
                            {errors.email && <span className="error-msg">{errors.email.message}</span>}
                        </div>

                        <div>
                            <label style={{ fontSize: '0.9rem', color: '#999', display: 'block', marginBottom: '5px' }}>Number of Participants</label>
                            <input type="number" {...register("participantCount")} style={{ margin: 0 }} />
                            {errors.participantCount && <span className="error-msg">{errors.participantCount.message}</span>}
                        </div>
                    </div>

                    <h3 style={{ color: '#ff8c00', marginBottom: '15px', borderBottom: '1px solid #333', paddingBottom: '5px', marginTop: '30px' }}>Payment Details</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ fontSize: '0.9rem', color: '#999', display: 'block', marginBottom: '5px' }}>Amount Received (₹) (Auto-calculated)</label>
                            <input type="number" placeholder="Amount Recieved (₹)" {...register("amount")} readOnly style={{ background: '#333', cursor: 'not-allowed' }} />
                            {errors.amount && <span className="error-msg">{errors.amount.message}</span>}
                        </div>

                        <div>
                            <label style={{ fontSize: '0.9rem', color: '#999', display: 'block', marginBottom: '5px' }}>Payment Method</label>
                            <select {...register("paymentMethod")}>
                                <option value="Cash">Cash</option>
                                <option value="UPI">UPI / Online</option>
                                <option value="Cheque">Cheque</option>
                            </select>
                            {errors.paymentMethod && <span className="error-msg">{errors.paymentMethod.message}</span>}
                        </div>

                        {(paymentMethodValue === 'UPI' || paymentMethodValue === 'Cheque') && (
                            <div style={{ gridColumn: '1 / -1' }}>
                                <input placeholder={paymentMethodValue === 'UPI' ? "Transaction ID" : "Cheque Number"} {...register("transactionId")} />
                                {errors.transactionId && <span className="error-msg">{errors.transactionId.message}</span>}
                            </div>
                        )}
                    </div>

                    <div style={{ marginBottom: '24px', marginTop: '30px' }}>
                        <h3 style={{ marginBottom: '16px', color: '#fff', borderBottom: '1px solid #444', paddingBottom: '10px' }}>
                            Competitions & Events
                        </h3>
                        {conflictError && (
                            <div style={{
                                padding: '15px',
                                background: 'rgba(255, 0, 0, 0.2)',
                                border: '1px solid #ff4444',
                                borderRadius: '8px',
                                color: '#ffaaaa',
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                                <div>
                                    <strong>Schedule Conflict Detected</strong>
                                    <div style={{ fontSize: '0.9rem', marginTop: '5px' }}>{conflictError}</div>
                                </div>
                            </div>
                        )}
                        <p style={{ marginBottom: '10px', fontSize: '0.9rem', color: '#888' }}>Click on a competition category to see events.</p>

                        <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '10px' }}>
                            {Object.entries(eventsData).map(([category, events]) => {
                                const isExpanded = expandedCategories[category];
                                const selectedCount = events.filter(e => watch("events")?.includes(e.name)).length;

                                return (
                                    <div key={category} style={{ marginBottom: '10px', border: '1px solid #333', borderRadius: '8px', overflow: 'hidden' }}>
                                        <button
                                            type="button"
                                            onClick={() => toggleCategory(category)}
                                            style={{
                                                width: '100%',
                                                textAlign: 'left',
                                                padding: '15px',
                                                background: '#2a2a2a',
                                                border: 'none',
                                                borderRadius: '0',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                color: '#ff8c00',
                                                fontSize: '1rem',
                                                textTransform: 'uppercase'
                                            }}
                                        >
                                            <span style={{ fontWeight: 'bold' }}>
                                                {category}
                                                {selectedCount > 0 && <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: '#00ff66', background: 'rgba(0,255,102,0.1)', padding: '2px 8px', borderRadius: '10px' }}>{selectedCount} Selected</span>}
                                            </span>
                                            <span>{isExpanded ? '▲' : '▼'}</span>
                                        </button>

                                        {isExpanded && (
                                            <div style={{ padding: '15px', background: 'rgba(0,0,0,0.2)' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '10px' }}>
                                                    {events.map(event => (
                                                        <label key={event.name} style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            padding: '12px',
                                                            background: watch("events")?.includes(event.name) ? 'rgba(255, 69, 0, 0.15)' : '#1f1f1f',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            border: watch("events")?.includes(event.name) ? '1px solid #ff4500' : '1px solid #444',
                                                            transition: 'all 0.2s',
                                                            opacity: (conflictError && !watch("events")?.includes(event.name)) ? 0.5 : 1
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                                                <input
                                                                    type="checkbox"
                                                                    value={event.name}
                                                                    style={{ width: 'auto', margin: '4px 10px 0 0' }}
                                                                    {...register("events")}
                                                                />
                                                                <div>
                                                                    <span style={{ fontSize: '0.95rem', fontWeight: '600', display: 'block' }}>{event.name}</span>
                                                                    <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '4px' }}>
                                                                        ⏱ {event.date} • {event.time}
                                                                    </div>
                                                                    <div style={{ fontSize: '0.85rem', color: '#ff4500', fontWeight: 'bold', marginTop: '4px' }}>
                                                                        ₹{event.price}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        {errors.events && <span className="error-msg" style={{ marginTop: '10px' }}>{errors.events.message}</span>}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !!conflictError}
                        style={{
                            opacity: (isSubmitting || !!conflictError) ? 0.5 : 1,
                            cursor: (isSubmitting || !!conflictError) ? 'not-allowed' : 'pointer',
                            background: conflictError ? '#552222' : '#ff4500'
                        }}
                    >
                        {conflictError ? "FIX SCHEDULE CONFLICTS" : (isSubmitting ? "Registering..." : "COMPLETE REGISTRATION")}
                    </button>
                </form>
            </div>
        </div>
    );
}
