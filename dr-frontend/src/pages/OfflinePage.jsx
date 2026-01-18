import { useNavigate } from "react-router-dom";

export default function OfflinePage() {
    const navigate = useNavigate();

    return (
        <div className="page-container" style={{ background: '#1a0505' }}>
            <div className="card" style={{ border: '1px solid #ff3333' }}>
                <h1 style={{ color: '#ff3333' }}>⚠️ Connection Lost</h1>
                <p style={{ marginBottom: '2rem', color: '#ccc' }}>
                    Server connection unavailable. Please check the host machine or network connection.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    style={{ background: '#333' }}
                >
                    Retry Connection
                </button>
            </div>
        </div>
    );
}
