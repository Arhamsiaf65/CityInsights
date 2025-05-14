import React from 'react';

function About() {
  return (
    <div className="min-h-screen bg-gray-100 px-4 py-12">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-md p-8 md:p-16">
        {/* Headline */}
        <h1 className="text-4xl font-extrabold text-blue-900 mb-6 border-b-4 border-blue-600 inline-block">
          Who We Are: The Voice Behind the News
        </h1>

        {/* Mission & Story */}
        <div className="flex flex-col md:flex-row gap-10 mt-10">
          {/* Left side */}
          <div className="md:w-1/2 space-y-6">
            <p className="text-lg text-gray-700 leading-relaxed">
              At <span className="font-semibold text-blue-700">City Insight</span>, our mission is simple:
              bring the most relevant, community-driven stories to light. From local events and community heroes
              to opinion pieces and neighborhood discoveries — we keep your city talking.
            </p>
            <p className="text-sm text-gray-500">
              Established in 2025, we saw the need for a platform that tells stories *from the people, for the people*.
              Our contributors are residents, thinkers, doers — just like you.
            </p>
          </div>

          {/* Right image */}
          <img
            src="https://img.freepik.com/free-photo/group-people-taking-interview-outdoors_23-2149032384.jpg?t=st=1746185334~exp=1746188934~hmac=cf4972451784b3eb938124bd7d8b28c090f75fc6f6487494d5e87977eb1aaade&w=996"
            alt="Our team at work"
            className="rounded-lg shadow-md object-cover md:w-1/2"
          />
        </div>

        {/* Why We Started */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-blue-800 mb-4">Why We Started</h2>
          <p className="text-gray-700 text-md leading-relaxed">
            In an age where global news overshadows local voices, we created this space to empower everyday people
            to share what matters in their neighborhood. Our city has stories worth telling — and we’re here to amplify them.
          </p>
        </div>

        {/* Meet the Team */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-blue-800 mb-8">Meet the Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              { name: 'Alisha', role: 'Chief Editor', img: 'https://randomuser.me/api/portraits/women/68.jpg' },
              { name: 'Roman', role: 'Content Strategist', img: 'https://randomuser.me/api/portraits/women/45.jpg' },
              { name: 'Laiba', role: 'Community Reporter', img: 'https://randomuser.me/api/portraits/women/76.jpg' },
            ].map((person) => (
              <div key={person.name} className="bg-gray-50 rounded-xl p-4 shadow-md text-center">
                <img
                  src={person.img}
                  alt={person.name}
                  className="w-24 h-24 mx-auto rounded-full mb-4 object-cover"
                />
                <h3 className="text-lg font-semibold text-gray-800">{person.name}</h3>
                <p className="text-sm text-blue-700">{person.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
