import React from 'react';
import styled from 'styled-components';

const SparkButton = ({ children, className }) => {
  return (
    <StyledWrapper>
      <button className={`button ${className}`}>
        <div className="dots_border" />
        
        {/* Add this to render passed content */}
        <span className="text_button">
          {children}
        </span>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .button {
    --black-700: hsla(0 0% 12% / 1);
    --border_radius: 9999px;
    --transtion: 0.3s ease-in-out;
    --offset: 2px;

    cursor: pointer;
    position: relative;

    display: flex;
    align-items: center;
    gap: 0.5rem;

    transform-origin: center;

    /* Default padding for larger screens */
 padding: 0.5rem 1rem;     background-color: transparent;

    border: none;
    border-radius: var(--border_radius);
    transform: scale(calc(1 + (var(--active, 0) * 0.01)));

    transition: transform var(--transtion);

    /* Responsive padding for mobile screens */
    @media (max-width: 768px) {
      padding: 0.4rem 0.8rem;    }

    @media (max-width: 480px) {
      padding: 0.3rem 0.6rem; /* Even smaller padding for very small screens */
    }
  }

  .button::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    width: 100%;
    height: 100%;
    background-color: white; /* Updated background color */

    border-radius: var(--border_radius);
    box-shadow: inset 0 0.5px hsl(0, 0%, 100%), inset 0 -1px 2px 0 hsl(0, 0%, 0%),
      0px 4px 10px -4px hsla(0 0% 0% / calc(1 - var(--active, 0))),
      0 0 0 calc(var(--active, 0) * 0.375rem) hsl(260 97% 50% / 0.75);

    transition: all var(--transtion);
    z-index: 0;
  }

  .button::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    width: 100%;
    height: 100%;
    background-color: hsla(260 97% 61% / 0.75);
    background-image: radial-gradient(
        at 51% 89%,
        hsla(266, 45%, 74%, 1) 0px,
        transparent 50%
      ),
      radial-gradient(at 100% 100%, hsla(266, 36%, 60%, 1) 0px, transparent 50%),
      radial-gradient(at 22% 91%, hsla(266, 36%, 60%, 1) 0px, transparent 50%);
    background-position: top;

    opacity: var(--active, 0);
    border-radius: var(--border_radius);
    transition: opacity var(--transtion);
    z-index: 2;
  }

  .button:is(:hover, :focus-visible) {
    --active: 1;
  }

  .button:is(:hover, :focus-visible) .text_button {
    color: white; /* Change text color to white on hover/focus */
  }

  .button:is(:hover, :focus-visible) .sparkle .path {
    color: white; /* Change sparkle color to white on hover/focus */
  }

  .button:active {
    transform: scale(0.75);
  }

  .button .dots_border {
    --size_border: calc(100% + 2px);

    overflow: hidden;

    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    width: var(--size_border);
    height: var(--size_border);
    background-color: transparent;

    border-radius: var(--border_radius);
    z-index: -10;
  }

  .button .dots_border::before {
    content: "";
    position: absolute;
    top: 30%;
    left: 50%;
    transform: translate(-50%, -50%);
    transform-origin: left;
    transform: rotate(0deg);

    width: 100%;
    height: 2rem;
    background-color: black;

    mask: linear-gradient(transparent 0%, white 120%);
    animation: rotate 2s linear infinite;
  }

  @keyframes rotate {
    to {
      transform: rotate(360deg);
    }
  }

  .button .sparkle {
    position: relative;
    z-index: 10;
    width: 1rem;
    color: #1C398E;
  }

  .button .sparkle .path {
    fill: currentColor;
    stroke: currentColor;

    transform-origin: center;
    color: #1C398E;
  }

  .button:is(:hover, :focus) .sparkle .path {
    animation: path 1.5s linear 0.5s infinite;
  }

  .button .sparkle .path:nth-child(1) {
    --scale_path_1: 0.75;
  }
  .button .sparkle .path:nth-child(2) {
    --scale_path_2: 0.75;
  }
  .button .sparkle .path:nth-child(3) {
    --scale_path_3: 0.75;
  }

  @keyframes path {
    0%,
    34%,
    71%,
    100% {
      transform: scale(0.75);
    }
    17% {
      transform: scale(var(--scale_path_1, 0.75));
    }
    49% {
      transform: scale(var(--scale_path_2, 0.75));
    }
    83% {
      transform: scale(var(--scale_path_3, 0.75));
    }
  }

  .button .text_button {
    position: relative;
    z-index: 10;

    background-image: linear-gradient(
      90deg,
      hsla(0 0% 100% / 1) 0%,
      hsla(0 0% 100% / var(--active, 0)) 120%
    );
    background-clip: text;

    font-size: 0.85rem;
    color: #1C398E;

    /* Responsive font size for mobile */
    @media (max-width: 768px) {
      font-size: 0.75rem; /* Smaller font size for mobile */
    }

    @media (max-width: 480px) {
      font-size: 0.875rem; /* Even smaller font size for very small screens */
    }
  }
`;

export default SparkButton;