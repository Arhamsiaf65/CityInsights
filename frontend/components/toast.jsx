import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import toast from "react-hot-toast";

export const ErrorToast = ({ t, title, message }) => (
    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-red-100 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <FaTimesCircle className="h-10 w-10 text-red-600" /> {/* Error icon */}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-bold text-red-800">{title}</p>
            <p className="mt-1 text-sm text-red-700">{message}</p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-red-200">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-500"
        >
          Close
        </button>
      </div>
    </div>
  );

export const SuccessToast = ({ t, title, message }) => (
    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-green-100 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <FaCheckCircle className="h-10 w-10 text-green-600" /> {/* Success icon */}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-bold text-green-800">{title}</p>
            <p className="mt-1 text-sm text-green-700">{message}</p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-green-200">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-green-600 hover:text-green-500"
        >
          Close
        </button>
      </div>
    </div>
  );