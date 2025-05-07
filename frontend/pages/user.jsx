import React, { useContext, useState } from 'react';
import { userContext } from '../context/userContext';

function User() {
  const { user, updateUser } = useContext(userContext);
  const [editing, setEditing] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({ ...user });
  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const handleEditToggle = () => setEditing(!editing);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateUser(updatedUser);
    setEditing(false);
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 text-lg">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16 bg-white shadow-xl rounded-lg text-gray-900 overflow-hidden">
      <div className="h-32 w-full">
        <img
          className="object-cover w-full h-full"
          src={user.cover || 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?auto=format&q=80'}
          alt="Cover"
        />
      </div>
      <div className="flex justify-center -mt-16">
        <img
          className="w-32 h-32 object-cover rounded-full border-4 border-white"
          src={user.profilePic || user.avatar || defaultAvatar}
          alt="User Avatar"
        />
      </div>

      <div className="text-center mt-2 px-4">
        <h2 className="text-xl font-semibold">{user.name}</h2>
        <p className="text-gray-500 text-sm">{user.role || 'Member'}</p>
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 border-t mt-4">
          {['name', 'email', 'bio', 'portfolio', 'contact'].map((field) => (
            <div key={field} className="space-y-1">
              <label className="text-sm text-gray-600 capitalize">{field}</label>
              <input
                name={field}
                value={updatedUser[field] || ''}
                onChange={handleChange}
                placeholder={`Enter ${field}`}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={handleEditToggle}
              className="flex-1 border py-2 rounded hover:bg-gray-100 text-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="px-6 py-4 text-sm text-gray-700 space-y-2">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Bio:</strong> {user.bio || 'No bio available'}</p>
            <p><strong>Portfolio:</strong> {user.portfolio || 'No portfolio link'}</p>
            <p><strong>Contact:</strong> {user.contact || 'No contact info'}</p>
          </div>
          <div className="px-6 py-4 border-t">
            <button
              onClick={handleEditToggle}
              className="w-full bg-gray-900 text-white py-2 rounded-full font-semibold hover:bg-gray-800"
            >
              Edit Profile
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default User;
