import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import text from '../navbar/textflip1.webp'

const images = [
  { img: "Shoes", src: text},
  { img: "Shoes", src: "https://rukminim2.flixcart.com/fk-p-flap/1620/270/image/d9290fb51138d286.png?q=20" },
  { img: "Shoes", src: "https://rukminim2.flixcart.com/fk-p-flap/1620/270/image/7f3cde58a30f6024.jpg?q=20" },
  { img: "Shoes", src: "https://rukminim2.flixcart.com/fk-p-flap/1620/270/image/c070850106101831.jpeg?q=20" },
  { img: "Shoes", src: "https://rukminim2.flixcart.com/fk-p-flap/1620/270/image/d9290fb51138d286.png?q=20" },
  { img: "Shoes", src: "https://rukminim2.flixcart.com/fk-p-flap/1620/270/image/d9290fb51138d286.png?q=20" },
];

const Carousal = () => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    // nextArrow: <NextArrow />,
    // prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className="banner relative overflow-hidden">
      <Slider {...settings}>
        {images.map((image, index) => (
          <div key={index} className="relative">
            {/* Gradient Overlay */}
            <div className="absolute to-transparent"></div>
            {/* Image */}
            <img
              src={image.src}
              alt={image.name}
              className="w-full h-64 object-cover"
            />
            {/* Text Overlay */}
            <h3 className="absolute bottom-4 left-4 text-white text-lg font-medium">
              {image.name}
            </h3>
          </div>
        ))}
      </Slider>
    </div>
  );
};

// Custom Next Arrow
// const NextArrow = (props) => {
//   const { className, style, onClick } = props;
//   return (
//     <div
//       className={`${className} absolute top-1/2 -translate-y-1/2 right-2 z-10 bg-white/80 rounded-full p-2 shadow-lg cursor-pointer hover:bg-white`}
//       style={{ ...style }}
//       onClick={onClick}
//     >
//       <svg
//         xmlns="http://www.w3.org/2000/svg"
//         className="h-6 w-6 text-black"
//         fill="none"
//         viewBox="0 0 24 24"
//         stroke="currentColor"
//       >
//         <path
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           strokeWidth={2}
//           d="M9 5l7 7-7 7"
//         />
//       </svg>
//     </div>
//   );
// };

// Custom Previous Arrow
// const PrevArrow = (props) => {
//   const { className, style, onClick } = props;
//   return (
//     <div
//       className={`${className} absolute top-1/2 -translate-y-1/2 left-2 z-10 bg-white/80 rounded-full p-2 shadow-lg cursor-pointer hover:bg-white`}
//       style={{ ...style }}
//       onClick={onClick}
//     >
//       <svg
//         xmlns="http://www.w3.org/2000/svg"
//         className="h-6 w-6 text-black"
//         fill="none"
//         viewBox="0 0 24 24"
//         stroke="currentColor"
//       >
//         <path
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           strokeWidth={2}
//           d="M15 19l-7-7 7-7"
//         />
//       </svg>
//     </div>
//   );
// };

export default Carousal;