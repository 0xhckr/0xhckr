"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Fragment, useEffect, useState } from "react";
import { cn } from "~/lib/util";

gsap.registerPlugin(useGSAP);

export const PageLoader = ({ children }: { children: React.ReactNode }) => {
  const [squares, setSquares] = useState<React.ReactNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    setSquares(
      Array.from({
        length:
          Math.ceil(window.innerWidth / 160) *
          Math.ceil(window.innerHeight / 160),
      }).map((_, index) => {
        const key = `square-${index}`;
        const rand1 = Math.floor(Math.random() * Math.random() * 5);
        const rand2 = Math.floor(Math.random() * Math.random() * 25);
        const numberOfSquaresTotalVertical = Math.ceil(
          window.innerHeight / 160
        );
        const numberOfSquaresTotalHorizontal = Math.ceil(
          window.innerWidth / 160
        );
        const verticalOffset =
          Math.floor(index / Math.ceil(window.innerWidth / 160)) * 160;
        const horizontalOffset =
          (index % Math.ceil(window.innerWidth / 160)) * 160;
        return (
          <Fragment key={key}>
            <div
              className="w-40 h-40 absolute square"
              style={{
                backgroundColor: `hsl(0, 0%, ${rand1}%)`,
                top: `${
                  verticalOffset -
                  (numberOfSquaresTotalVertical * 160 - window.innerHeight) / 2
                }px`,
                left: `${
                  horizontalOffset -
                  (numberOfSquaresTotalHorizontal * 160 - window.innerWidth) / 2
                }px`,
              }}
            />
            <div className="crosshair" key={`crosshair-${key}`}>
              <div
                className="w-1 h-8 absolute"
                style={{
                  backgroundColor: `hsl(0, 0%, ${rand2}%)`,
                  top: `${
                    verticalOffset -
                    (numberOfSquaresTotalVertical * 160 - window.innerHeight) /
                      2 -
                    16
                  }px`,
                  left: `${
                    horizontalOffset -
                    (numberOfSquaresTotalHorizontal * 160 - window.innerWidth) /
                      2 -
                    2
                  }px`,
                }}
              />
              <div
                className="w-8 h-1 absolute"
                style={{
                  backgroundColor: `hsl(0, 0%, ${rand2}%)`,
                  top: `${
                    verticalOffset -
                    (numberOfSquaresTotalVertical * 160 - window.innerHeight) /
                      2 -
                    2
                  }px`,
                  left: `${
                    horizontalOffset -
                    (numberOfSquaresTotalHorizontal * 160 - window.innerWidth) /
                      2 -
                    16
                  }px`,
                }}
              />
            </div>
          </Fragment>
        );
      })
    );
  }, []);

  useGSAP(() => {
    gsap.to(".square, .crosshair", {
      opacity: 0,
      duration: 0.3,
      ease: "power2.inOut",
      stagger: () => {
        return Math.random() * 0.5;
      },
      delay: 0.5,
      onComplete: () => {
        setIsLoading(false);
      },
    });
  }, [squares]);

  return (
    <div>
      {/* Grid of overlaid squares */}
      {squares && squares.length > 0 && children}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden h-screen w-screen z-20">
        <div className="relative pointer-events-none">{squares}</div>
        <div
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-2xl font-bold loading-text transition-all duration-300",
            isLoading ? "animate-pulse" : "opacity-0"
          )}
        >
          <h1>loading...</h1>
        </div>
      </div>
    </div>
  );
};
