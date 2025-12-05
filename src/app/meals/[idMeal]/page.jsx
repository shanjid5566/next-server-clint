import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { idMeal } = await params;

  try {
    const res = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`,
      { next: { revalidate: 3600 } } // Revalidate every hour
    );
    const data = await res.json();
    const meal = data.meals?.[0];

    if (!meal) {
      return {
        title: "Meal Not Found",
        description: "The requested meal could not be found.",
      };
    }

    return {
      title: `${meal.strMeal} Recipe | Delicious ${meal.strCategory} Dish`,
      description: `Learn how to make ${meal.strMeal}, a delicious ${meal.strArea} ${meal.strCategory} dish. Get the full recipe with ingredients and step-by-step instructions.`,
      keywords: [
        meal.strMeal,
        meal.strCategory,
        meal.strArea,
        "recipe",
        "cooking",
        "food",
        ...(meal.strTags ? meal.strTags.split(",") : []),
      ],
      openGraph: {
        title: `${meal.strMeal} Recipe`,
        description: `Learn how to make ${meal.strMeal}, a delicious ${meal.strArea} ${meal.strCategory} dish.`,
        images: [
          {
            url: meal.strMealThumb,
            width: 1200,
            height: 630,
            alt: meal.strMeal,
          },
        ],
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: `${meal.strMeal} Recipe`,
        description: `Learn how to make ${meal.strMeal}, a delicious ${meal.strArea} ${meal.strCategory} dish.`,
        images: [meal.strMealThumb],
      },
      alternates: {
        canonical: `/meals/${idMeal}`,
      },
    };
  } catch (error) {
    return {
      title: "Error Loading Meal",
      description: "An error occurred while loading the meal details.",
    };
  }
}

const MealDetailsPage = async ({ params }) => {
  const { idMeal } = await params;

  const fetchMealDetails = async () => {
    try {
      const res = await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`,
        {
          next: { revalidate: 3600 }, // Cache for 1 hour
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch meal details");
      }

      const data = await res.json();
      return data.meals?.[0] || null;
    } catch (error) {
      console.error("Error fetching meal details:", error);
      return null;
    }
  };

  const meal = await fetchMealDetails();

  if (!meal) {
    notFound();
  }

  // Get ingredients and measures
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      ingredients.push({ ingredient, measure });
    }
  }

  // Generate structured data for SEO (JSON-LD)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: meal.strMeal,
    image: meal.strMealThumb,
    description: meal.strInstructions?.substring(0, 200) + "...",
    keywords: meal.strTags || "",
    recipeCategory: meal.strCategory,
    recipeCuisine: meal.strArea,
    recipeIngredient: ingredients.map(
      (item) => `${item.measure} ${item.ingredient}`.trim()
    ),
    recipeInstructions: meal.strInstructions,
    video: meal.strYoutube
      ? {
          "@type": "VideoObject",
          name: `How to make ${meal.strMeal}`,
          description: `Video tutorial for ${meal.strMeal}`,
          thumbnailUrl: meal.strMealThumb,
          contentUrl: meal.strYoutube,
          uploadDate: new Date().toISOString(),
        }
      : undefined,
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb Navigation */}
          <nav
            className="mb-4 text-sm"
            aria-label="Breadcrumb"
            itemScope
            itemType="https://schema.org/BreadcrumbList"
          >
            <ol className="flex items-center space-x-2 text-gray-600">
              <li
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                <Link
                  href="/"
                  itemProp="item"
                  className="hover:text-blue-600 transition-colors"
                >
                  <span itemProp="name">Home</span>
                </Link>
                <meta itemProp="position" content="1" />
              </li>
              <li>/</li>
              <li
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                <Link
                  href="/meals"
                  itemProp="item"
                  className="hover:text-blue-600 transition-colors"
                >
                  <span itemProp="name">Meals</span>
                </Link>
                <meta itemProp="position" content="2" />
              </li>
              <li>/</li>
              <li
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                <span itemProp="name" className="text-gray-800 font-medium">
                  {meal.strMeal}
                </span>
                <meta itemProp="position" content="3" />
              </li>
            </ol>
          </nav>

          {/* Back Button */}
          <Link
            href="/meals"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold mb-6 transition-colors"
            aria-label="Go back to meals page"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Meals
          </Link>

          {/* Main Content */}
          <article
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
            itemScope
            itemType="https://schema.org/Recipe"
          >
            {/* Header Section */}
            <header className="relative h-96 w-full">
              <Image
                src={meal.strMealThumb}
                alt={`${meal.strMeal} - ${meal.strCategory} dish from ${meal.strArea}`}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                itemProp="image"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <h1
                  className="text-4xl md:text-5xl font-bold mb-2"
                  itemProp="name"
                >
                  {meal.strMeal}
                </h1>
                <div className="flex flex-wrap gap-3 text-sm">
                  {meal.strCategory && (
                    <span
                      className="bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full"
                      itemProp="recipeCategory"
                    >
                      {meal.strCategory}
                    </span>
                  )}
                  {meal.strArea && (
                    <span
                      className="bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full"
                      itemProp="recipeCuisine"
                    >
                      {meal.strArea}
                    </span>
                  )}
                  {meal.strTags &&
                    meal.strTags.split(",").map((tag, index) => (
                      <span
                        key={index}
                        className="bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full"
                        itemProp="keywords"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                </div>
              </div>
            </header>

            {/* Content Grid */}
            <div className="grid md:grid-cols-3 gap-8 p-8">
              {/* Ingredients Section */}
              <section className="md:col-span-1" aria-labelledby="ingredients-heading">
                <h2
                  id="ingredients-heading"
                  className="text-2xl font-bold text-gray-800 mb-4 flex items-center"
                >
                  <svg
                    className="w-6 h-6 mr-2 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Ingredients
                </h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <ul className="space-y-2" role="list">
                    {ingredients.map((item, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0"
                        itemProp="recipeIngredient"
                        content={`${item.measure} ${item.ingredient}`.trim()}
                      >
                        <span className="font-medium text-gray-700">
                          {item.ingredient}
                        </span>
                        <span className="text-gray-600 text-sm">
                          {item.measure}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Instructions Section */}
              <section className="md:col-span-2" aria-labelledby="instructions-heading">
                <h2
                  id="instructions-heading"
                  className="text-2xl font-bold text-gray-800 mb-4 flex items-center"
                >
                  <svg
                    className="w-6 h-6 mr-2 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  Instructions
                </h2>
                <div className="prose max-w-none">
                  <p
                    className="text-gray-700 leading-relaxed whitespace-pre-line"
                    itemProp="recipeInstructions"
                  >
                    {meal.strInstructions}
                  </p>
                </div>

                {/* Video Link */}
                {meal.strYoutube && (
                  <div className="mt-6">
                    <a
                      href={meal.strYoutube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md"
                      aria-label={`Watch video tutorial for ${meal.strMeal}`}
                      itemProp="video"
                    >
                      <svg
                        className="w-6 h-6 mr-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                      Watch Video Tutorial
                    </a>
                  </div>
                )}

                {/* Source Link */}
                {meal.strSource && (
                  <div className="mt-4">
                    <a
                      href={meal.strSource}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline text-sm"
                      aria-label={`View original recipe source for ${meal.strMeal}`}
                    >
                      View Original Recipe Source →
                    </a>
                  </div>
                )}
              </section>
            </div>
          </article>
        </div>
      </div>
    </>
  );
};

export default MealDetailsPage;
