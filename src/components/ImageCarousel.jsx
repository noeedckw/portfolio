import { useState } from "react";
import { resolveAsset } from "../utils/assets";

export default function ImageCarousel({ images, alt = "", accent = "#ffffff" }) {
  const [index, setIndex] = useState(0);
  if (!images?.length) return null;

  const goTo = (i) => setIndex((i + images.length) % images.length);

  return (
    <div className="carousel">
      <div className="carousel__viewport">
        <img
          key={images[index]}
          src={resolveAsset(images[index])}
          alt={`${alt} ${index + 1}/${images.length}`}
          className="carousel__image"
        />
        {images.length > 1 && (
          <>
            <button type="button" className="carousel__arrow carousel__arrow--prev" onClick={() => goTo(index - 1)} aria-label="Image précédente">‹</button>
            <button type="button" className="carousel__arrow carousel__arrow--next" onClick={() => goTo(index + 1)} aria-label="Image suivante">›</button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="carousel__dots">
          {images.map((img, i) => (
            <button
              key={img + i}
              type="button"
              className={`carousel__dot ${i === index ? "carousel__dot--active" : ""}`}
              style={i === index ? { backgroundColor: accent } : undefined}
              onClick={() => goTo(i)}
              aria-label={`Aller à l'image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}