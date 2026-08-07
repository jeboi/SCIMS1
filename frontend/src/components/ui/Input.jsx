export default function Input({ className = "", ...props }) {
    return (
        <input
            className={`w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 ${className}`}
            {...props}
        />
    );
}