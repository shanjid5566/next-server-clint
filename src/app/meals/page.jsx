import React from "react";
import MealSearchInput from "./components/MealSearchInput";
import Image from "next/image";
import Link from "next/link";

const MealPage = async ({ searchParams }) => {
  const query = await searchParams;

  const fetchMeals = async () => {
    try {
      const res = await fetch(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${
          query.search || ""
        }`
      );
      const data = await res.json();
      return data.meals || [];
    } catch (error) {
      return [];
    }
  };
  console.log(fetchMeals());
  const meals = await fetchMeals();
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Search Section */}
        <div className="mb-8">
          <MealSearchInput />
        </div>

        {/* Meals Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* সব meal লুপ করা হচ্ছে */}
          {meals?.map((singleMeal) => {
            return (
              <div
                key={singleMeal?.idMeal}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col"
              >
                {/* meal এর ছবি */}
                <div className="relative w-full h-64 overflow-hidden">
                  <Image
                    src={singleMeal?.strMealThumb}
                    width={641}
                    height={641}
                    alt={singleMeal?.strMeal}
                    className="object-cover w-full h-full hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Content Section */}
                <div className="p-5 flex flex-col grow">
                  {/* meal নাম */}
                  <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                    {singleMeal?.strMeal}
                  </h3>

                  {/* meal এর description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 grow">
                    {singleMeal?.strInstructions}
                  </p>

                  {/* ডিটেইলস পেজের লিংক */}
                  <Link
                    href={`/meals/${singleMeal.idMeal}`}
                    className="inline-block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 mt-auto"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MealPage;
