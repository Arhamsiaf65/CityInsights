import React from "react";
import { Link } from "react-router-dom";

const CategoryCard = ({ title, description, link }) => {
  return (
    <Link
      to={link}
      className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-300"
    >
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </Link>
  );
};

export default CategoryCard;