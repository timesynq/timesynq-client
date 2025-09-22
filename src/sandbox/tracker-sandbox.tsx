import { Tracker } from "@/tracker/tracker-page";

export const TrackerSandbox = () => {
    return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-gray-900">
            <main className="flex-1 flex items-center justify-center">
                <div className="w-[600px] h-[600px] bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center border border-gray-700">
                    <Tracker />
                </div>
            </main>
        </div>
    );
};
