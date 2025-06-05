import React, { useEffect, useState } from 'react';

const baseUrl = import.meta.env.VITE_BASE_URL;

function Livestream() {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStreams() {
      try {
        const res = await fetch(`${baseUrl}/livestream/get-all`);
        if (!res.ok) throw new Error('Failed to fetch streams');
        const data = await res.json();
        console.log(data);
        setStreams(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStreams();
  }, []);

  if (loading) return <p className="text-center mt-12">Loading streams...</p>;
  if (error) return <p className="text-center mt-12 text-red-600">{error}</p>;
  if (!streams.length) return <p className="text-center mt-12">No livestreams available.</p>;

  const now = new Date();

  const isInRange = (from, to) => new Date(from) <= now && new Date(to) >= now;

const liveStream = streams.find((stream) =>
  isInRange(stream.startTime, stream.endTime) && stream.isLive
);

const upcomingStreams = streams
  .filter((stream) => new Date(stream.startTime) > now && !stream.isLive)
  .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

const pastStreams = streams
  .filter((stream) => new Date(stream.endTime) < now && !stream.isLive)
  .sort((a, b) => new Date(b.endTime) - new Date(a.endTime));


  return (
    <div className="min-h-screen bg-gray-100 px-4 py-12">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-md p-8 md:p-16">
        <h1 className="text-4xl font-extrabold text-blue-900 mb-6 border-b-4 border-blue-600 inline-block">
          📺 City Insight Live
        </h1>

        {/* Show live stream only if exists */}
        {liveStream ? (
          <>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">{liveStream.title} (Live Now!)</h2>
            <p className="text-gray-700 mb-2">{liveStream.description}</p>
            <p className="text-sm text-gray-500 mb-8">
              From <strong>{new Date(liveStream.startTime).toLocaleString()}</strong> to{' '}
              <strong>{new Date(liveStream.endTime).toLocaleString()}</strong>
            </p>

            <div
              className="aspect-video w-full rounded-xl overflow-hidden shadow-lg mb-12"
              dangerouslySetInnerHTML={{ __html: liveStream.embedUrl }}
            />
          </>
        ) : (
          <div className="mb-12 p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <p className="text-yellow-700 font-semibold">
              There is currently no live stream playing.
            </p>
          </div>
        )}

        {/* Upcoming Streams */}
        <div className="mb-12">
          <h3 className="text-xl font-bold text-blue-800 mb-4">🎙 Upcoming Sessions</h3>
          {upcomingStreams.length > 0 ? (
            <ul className="space-y-4 text-gray-700 max-h-96 overflow-y-auto">
              {upcomingStreams.map((stream) => (
                <li key={stream._id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <strong>{new Date(stream.startTime).toLocaleString()}</strong> to{' '}
                  <strong>{new Date(stream.endTime).toLocaleString()}</strong>: {stream.title}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No upcoming sessions scheduled.</p>
          )}
        </div>

        {/* Past Streams */}
        <div>
          <h3 className="text-xl font-bold text-blue-800 mb-4">🕒 Past Sessions</h3>
          {pastStreams.length > 0 ? (
            <ul className="space-y-4 text-gray-700 max-h-96 overflow-y-auto">
              {pastStreams.map((stream) => (
              <li key={stream._id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
  <strong>{new Date(stream.startTime).toLocaleString()}</strong> to{' '}
  <strong>{new Date(stream.endTime).toLocaleString()}</strong>: {stream.title}
</li>

              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No past sessions found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Livestream;
