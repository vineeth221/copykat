import React from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const categories = [
  { name: "Fashion", image: "https://rukminim2.flixcart.com/fk-p-flap/128/128/image/0d75b34f7d8fbcb3.png?q=100", link: "/clothes" },
  { name: "Men's", image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSUsQQ-D4lV15WzbENuO7cC91o4L1-e43wC1YSNZCatzuNr6Po9svk0gbDwtAyP1360tN1fdMVE3Vd7qd4OgMh9KxwGkdwzsTRRAhjoSGVndUnbSSXsGYKo", link: "/clothes" },
  { name: "Womens", image: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQnAsPsNXIwDziPnQ-LPrQpcKWO3YJIKMR6ENejlaNi_nXSDeMY96DTG98ZiU0Z5IldhP0F1hR7AsoqMVhT6P89-1-YM1mjAevfkc3yEgf3AIVaFW0PNbvexg", link: "/womens" },
  { name: "Watches", image: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSGdpouNV2UZdogl2h0VwufjIqW-tnEDd-eKDBeYdavD9QO9Jpen_6AJFVVw3QAl_KYDYSB9je_MPeJHUm2H54DwewXMlEFPZTWxHU_VCkRgetTdbUXty8JbIg", link: "/watches" },
  { name: "Shoes", image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSd_hkRSfNBKYShwz2ls2kTtFl1n3eBcRfyhojPIxIPO-zuS9hRIKqKEdrPVdiXSbBKGg-eWbCSfbWSqgJchv3bhRfCjyc4SRTaAeSW3XoQXNGaRNYUv_nOvTY", link: "/shoes" },
  { name: "Bags", image: "https://img.freepik.com/free-vector/shopping-paper-bags-icon-isolated_18591-82221.jpg", link: "/bags" },
  { name: "Accessories", image: "https://st4.depositphotos.com/12985656/24190/i/450/depositphotos_241907032-stock-photo-top-view-watches-lipstick-earrings.jpg", link: "/accessories" },
  { name: "Glasses", image: "https://i.pinimg.com/236x/f5/13/cb/f513cbb2068e776adc482f88f73ed3d9.jpg", link: "/glasses" },
];

const Landing = () => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 8, // Default for large screens (desktop)
    slidesToScroll: 2,
    responsive: [
      {
        breakpoint: 1024, // Tablets
        settings: {
          slidesToShow: 4,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 768, // Mobile devices
        settings: {
          slidesToShow: 5, // ✅ Show 5 items on mobile
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 480, // Very small mobile devices
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        },
      },
    ],
  };
  

  return (
    <div className="bg-white py-6 px-4 overflow-hidden">
      <Slider {...settings}>
        {categories.map((category, index) => (
          <Link key={index} to={category.link} className="text-center group">
            <div className="bg-transparent rounded-lg p-2 transition-transform transform group-hover:scale-105">
              <img
                src={category.image}
                alt={category.name}
                className="w-12 h-12 object-cover rounded-full mx-auto"
              />
              <h3 className="text-xs font-medium mt-1 group-hover:text-orange-500">
                {category.name}
              </h3>
            </div>
          </Link>
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

export default Landing;