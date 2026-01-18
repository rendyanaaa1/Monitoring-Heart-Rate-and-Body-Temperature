import { Link } from 'react-router-dom';

export default function LandingPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-4">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">Tugas Akhir</h1>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl">
                Real-time monitoring of Heart Rate and Body Temperature using Arduino & Firebase.
            </p>
            <Link
                to="/dashboard"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
                Go to Dashboard
            </Link>
        </div>
    );
}
